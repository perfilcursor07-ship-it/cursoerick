/**
 * Matricula: liga um aluno a um curso.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('enrollments', (t) => {
    t.engine('InnoDB'); // InnoDB e necessario para as chaves estrangeiras
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable();
    t.integer('course_id').unsigned().notNullable();
    t.timestamp('enrolled_at').notNullable().defaultTo(knex.fn.now());
    t.timestamps(true, true);

    t.foreign('user_id').references('users.id').onDelete('CASCADE');
    t.foreign('course_id').references('courses.id').onDelete('CASCADE');
    t.unique(['user_id', 'course_id'], { indexName: 'enrollments_user_course_uq' });
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('enrollments');
};
