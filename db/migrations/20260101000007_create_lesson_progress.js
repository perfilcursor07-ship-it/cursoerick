/**
 * Progresso do aluno em cada aula.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('lesson_progress', (t) => {
    t.engine('InnoDB'); // InnoDB e necessario para as chaves estrangeiras
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable();
    t.integer('lesson_id').unsigned().notNullable();
    t.integer('seconds_watched').notNullable().defaultTo(0);
    t.boolean('completed').notNullable().defaultTo(false);
    t.timestamp('completed_at').nullable();
    t.timestamps(true, true);

    t.foreign('user_id').references('users.id').onDelete('CASCADE');
    t.foreign('lesson_id').references('lessons.id').onDelete('CASCADE');
    t.unique(['user_id', 'lesson_id'], { indexName: 'lesson_progress_user_lesson_uq' });
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('lesson_progress');
};
