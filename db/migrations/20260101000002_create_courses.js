/**
 * Cursos (um curso agrupa modulos e aulas).
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('courses', (t) => {
    t.engine('InnoDB'); // InnoDB e necessario para as chaves estrangeiras
    t.increments('id').primary();
    t.string('title', 180).notNullable();
    t.string('slug', 200).notNullable().unique();
    t.string('subtitle', 240).nullable();
    t.text('description').nullable();
    t.string('cover_url', 500).nullable();
    t.boolean('is_published').notNullable().defaultTo(false);
    // quando true, o aluno precisa concluir a aula anterior para abrir a proxima
    t.boolean('sequential').notNullable().defaultTo(false);
    // todo aluno novo recebe acesso automatico a este curso
    t.boolean('auto_enroll').notNullable().defaultTo(true);
    t.integer('position').notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.index(['is_published'], 'courses_published_idx');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('courses');
};
