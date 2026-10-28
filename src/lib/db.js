import knexFactory from 'knex';

/**
 * Instancia unica do Knex. Em desenvolvimento o Next recarrega os modulos a cada
 * alteracao, por isso guardamos a conexao no objeto global para nao abrir um
 * pool novo a cada hot reload.
 */
const globalForDb = globalThis;

function create() {
  return knexFactory({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'curso_erick',
      charset: 'utf8mb4',
      timezone: 'Z',
    },
    pool: { min: 0, max: 10 },
  });
}

export const db = globalForDb.__cursoErickDb || create();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__cursoErickDb = db;
}
