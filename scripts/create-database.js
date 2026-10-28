/**
 * Cria o banco de dados caso ele ainda nao exista.
 * Uso: node scripts/create-database.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const name = process.env.DB_NAME || 'curso_erick';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: false,
  });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`[ok] banco "${name}" pronto`);
  await conn.end();
}

main().catch((err) => {
  console.error('[erro] nao foi possivel criar o banco:', err.message);
  process.exit(1);
});
