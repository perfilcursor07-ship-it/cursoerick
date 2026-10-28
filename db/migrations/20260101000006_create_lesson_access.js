/**
 * Liberacao individual: permite soltar uma aula para UM aluno especifico,
 * antes da liberacao geral.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('lesson_access', (t) => {
    t.engine('InnoDB'); // InnoDB e necessario para as chaves estrangeiras
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable();
    t.integer('lesson_id').unsigned().notNullable();
    t.integer('granted_by').unsigned().nullable();
    t.timestamp('granted_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('user_id').references('users.id').onDelete('CASCADE');
    t.foreign('lesson_id').references('lessons.id').onDelete('CASCADE');
    t.foreign('granted_by').references('users.id').onDelete('SET NULL');
    t.unique(['user_id', 'lesson_id'], { indexName: 'lesson_access_user_lesson_uq' });
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('lesson_access');
};
