/**
 * Conserta bancos criados com o MySQL do WAMP configurado em MyISAM.
 *
 * O MyISAM aceita a sintaxe de chave estrangeira mas ignora a restricao: as
 * tabelas ficam sem integridade e o ON DELETE CASCADE nunca acontece (apagar um
 * curso deixava os modulos e as aulas orfaos no banco).
 *
 * Esta migration limpa os orfaos, converte tudo para InnoDB e cria as chaves
 * de verdade. Em um banco que ja estava correto ela nao faz nada.
 */

const TABLES = [
  'users',
  'courses',
  'modules',
  'lessons',
  'enrollments',
  'lesson_access',
  'lesson_progress',
  'settings',
];

const FOREIGN_KEYS = [
  { table: 'modules', column: 'course_id', ref: 'courses', onDelete: 'CASCADE' },
  { table: 'lessons', column: 'module_id', ref: 'modules', onDelete: 'CASCADE' },
  { table: 'enrollments', column: 'user_id', ref: 'users', onDelete: 'CASCADE' },
  { table: 'enrollments', column: 'course_id', ref: 'courses', onDelete: 'CASCADE' },
  { table: 'lesson_access', column: 'user_id', ref: 'users', onDelete: 'CASCADE' },
  { table: 'lesson_access', column: 'lesson_id', ref: 'lessons', onDelete: 'CASCADE' },
  { table: 'lesson_access', column: 'granted_by', ref: 'users', onDelete: 'SET NULL' },
  { table: 'lesson_progress', column: 'user_id', ref: 'users', onDelete: 'CASCADE' },
  { table: 'lesson_progress', column: 'lesson_id', ref: 'lessons', onDelete: 'CASCADE' },
];

async function hasForeignKey(knex, table, column) {
  const [rows] = await knex.raw(
    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = ? AND COLUMN_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [table, column]
  );
  return rows.length > 0;
}

exports.up = async function up(knex) {
  // 1. remove as linhas que apontam para registros que nao existem mais,
  //    senao a criacao das chaves falha
  await knex.raw(
    'DELETE lp FROM lesson_progress lp LEFT JOIN users u ON u.id = lp.user_id WHERE u.id IS NULL'
  );
  await knex.raw(
    'DELETE la FROM lesson_access la LEFT JOIN users u ON u.id = la.user_id WHERE u.id IS NULL'
  );
  await knex.raw(
    'UPDATE lesson_access la LEFT JOIN users u ON u.id = la.granted_by SET la.granted_by = NULL WHERE la.granted_by IS NOT NULL AND u.id IS NULL'
  );
  await knex.raw(
    'DELETE e FROM enrollments e LEFT JOIN users u ON u.id = e.user_id WHERE u.id IS NULL'
  );
  await knex.raw(
    'DELETE e FROM enrollments e LEFT JOIN courses c ON c.id = e.course_id WHERE c.id IS NULL'
  );
  // modulos de cursos apagados -> leva junto aulas, acessos e progresso
  await knex.raw(
    'DELETE lp FROM lesson_progress lp LEFT JOIN lessons l ON l.id = lp.lesson_id WHERE l.id IS NULL'
  );
  await knex.raw(
    'DELETE la FROM lesson_access la LEFT JOIN lessons l ON l.id = la.lesson_id WHERE l.id IS NULL'
  );
  await knex.raw(
    `DELETE l FROM lessons l
       LEFT JOIN modules m ON m.id = l.module_id
       LEFT JOIN courses c ON c.id = m.course_id
      WHERE m.id IS NULL OR c.id IS NULL`
  );
  await knex.raw(
    'DELETE m FROM modules m LEFT JOIN courses c ON c.id = m.course_id WHERE c.id IS NULL'
  );
  // repete para pegar progresso/acesso das aulas que acabaram de sair
  await knex.raw(
    'DELETE lp FROM lesson_progress lp LEFT JOIN lessons l ON l.id = lp.lesson_id WHERE l.id IS NULL'
  );
  await knex.raw(
    'DELETE la FROM lesson_access la LEFT JOIN lessons l ON l.id = la.lesson_id WHERE l.id IS NULL'
  );

  // 2. converte as tabelas para InnoDB (no-op se ja estiverem)
  for (const table of TABLES) {
    await knex.raw(`ALTER TABLE ?? ENGINE = InnoDB`, [table]);
  }

  // 3. cria as chaves que faltam
  for (const fk of FOREIGN_KEYS) {
    // eslint-disable-next-line no-await-in-loop
    if (await hasForeignKey(knex, fk.table, fk.column)) continue;

    // eslint-disable-next-line no-await-in-loop
    await knex.raw(
      `ALTER TABLE ?? ADD CONSTRAINT ?? FOREIGN KEY (??) REFERENCES ?? (id) ON DELETE ${fk.onDelete}`,
      [fk.table, `${fk.table}_${fk.column}_fk`, fk.column, fk.ref]
    );
  }
};

exports.down = async function down(knex) {
  for (const fk of FOREIGN_KEYS) {
    // eslint-disable-next-line no-await-in-loop
    await knex
      .raw('ALTER TABLE ?? DROP FOREIGN KEY ??', [fk.table, `${fk.table}_${fk.column}_fk`])
      .catch(() => {});
  }
};
