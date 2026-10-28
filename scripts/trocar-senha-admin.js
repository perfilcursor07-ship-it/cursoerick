/**
 * Gera uma senha forte para o administrador, grava no .env e atualiza o hash
 * no banco. A senha NUNCA e impressa na tela: leia o valor de ADMIN_PASSWORD
 * no arquivo .env.
 *
 *   node scripts/trocar-senha-admin.js                  troca a do ADMIN_EMAIL do .env
 *   node scripts/trocar-senha-admin.js outro@email.com  troca a de outra conta
 */
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// alfabeto sem caracteres que se confundem na leitura (0/O, 1/l/I)
const GROUPS = [
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  'abcdefghijkmnopqrstuvwxyz',
  '23456789',
  '!@#$%&*?-_=+',
];

function pick(alphabet) {
  return alphabet[crypto.randomInt(alphabet.length)];
}

function generatePassword(length = 20) {
  const all = GROUPS.join('');
  // garante pelo menos um caractere de cada grupo
  const chars = GROUPS.map(pick);
  while (chars.length < length) chars.push(pick(all));

  // embaralha (Fisher-Yates com fonte criptografica)
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

/** Reescreve apenas a linha ADMIN_PASSWORD do .env, preservando o resto. */
function writeEnv(password) {
  const file = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(file)) throw new Error('arquivo .env nao encontrado');

  const original = fs.readFileSync(file, 'utf8');
  const line = `ADMIN_PASSWORD=${password}`;
  const updated = /^ADMIN_PASSWORD=.*$/m.test(original)
    ? original.replace(/^ADMIN_PASSWORD=.*$/m, line)
    : `${original.trimEnd()}\n${line}\n`;

  // backup antes de sobrescrever
  fs.writeFileSync(`${file}.bak`, original);
  fs.writeFileSync(file, updated);
  return file;
}

async function main() {
  const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  if (!email) throw new Error('informe o e-mail ou defina ADMIN_EMAIL no .env');

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'curso_erick',
  });

  const [[user]] = await db.execute('SELECT id, email, role FROM users WHERE email = ?', [email]);
  if (!user) {
    await db.end();
    throw new Error(`nenhuma conta encontrada com o e-mail ${email}`);
  }

  const password = generatePassword();
  const hash = bcrypt.hashSync(password, 12);

  await db.execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [
    hash,
    user.id,
  ]);

  // confere que o hash gravado realmente valida a senha nova
  const [[check]] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [user.id]);
  const ok = bcrypt.compareSync(password, check.password_hash);
  await db.end();

  if (!ok) throw new Error('o hash gravado nao confere com a senha gerada');

  const file = writeEnv(password);

  console.log(`[ok] senha trocada para ${user.email} (${user.role})`);
  console.log(`     a senha nova esta em ${file}, na linha ADMIN_PASSWORD`);
  console.log('     a anterior foi guardada em .env.bak - apague esse arquivo quando quiser');
}

main().catch((err) => {
  console.error('[erro]', err.message);
  process.exit(1);
});
