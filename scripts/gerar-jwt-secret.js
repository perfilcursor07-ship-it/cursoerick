/**
 * Gera um JWT_SECRET forte e grava no .env.
 *
 *   node scripts/gerar-jwt-secret.js
 *
 * O segredo NUNCA e impresso na tela: ele fica no .env, na linha JWT_SECRET.
 *
 * ATENCAO: trocar o segredo invalida todos os cookies de sessao ja emitidos.
 * Todo mundo que estiver logado (incluindo voce) precisa entrar de novo.
 */
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PLACEHOLDERS = [
  '',
  'troque-este-segredo-por-algo-bem-longo-e-aleatorio',
  'secret',
  'changeme',
];

function generateSecret() {
  // 64 bytes aleatorios em base64url: ~86 caracteres, bem acima do necessario
  // para HS256 (que usa chave de 256 bits)
  return crypto.randomBytes(64).toString('base64url');
}

function writeEnv(secret) {
  const file = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(file)) throw new Error('arquivo .env nao encontrado');

  const original = fs.readFileSync(file, 'utf8');
  const line = `JWT_SECRET=${secret}`;
  const updated = /^JWT_SECRET=.*$/m.test(original)
    ? original.replace(/^JWT_SECRET=.*$/m, line)
    : `${original.trimEnd()}\n${line}\n`;

  fs.writeFileSync(`${file}.bak`, original);
  fs.writeFileSync(file, updated);
  return file;
}

function main() {
  const atual = process.env.JWT_SECRET || '';
  const fraco = PLACEHOLDERS.includes(atual) || atual.length < 32;

  const secret = generateSecret();
  const file = writeEnv(secret);

  console.log('[ok] JWT_SECRET novo gravado');
  console.log(`     esta em ${file}, na linha JWT_SECRET (${secret.length} caracteres)`);
  console.log(`     o anterior ${fraco ? 'era fraco/padrao' : 'tinha tamanho adequado'} e foi salvo em .env.bak`);
  console.log('');
  console.log('     Reinicie o servidor para o novo segredo valer.');
  console.log('     Todas as sessoes abertas caem: e preciso entrar de novo.');
}

try {
  main();
} catch (err) {
  console.error('[erro]', err.message);
  process.exit(1);
}
