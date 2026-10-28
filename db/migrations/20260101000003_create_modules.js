/**
 * Modulos de um curso.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('modules', (t) => {
    t.engine('InnoDB'); // InnoDB e necessario para as chaves estrangeiras
    t.increments('id').primary();
    t.integer('course_id').unsigned().notNullable();
    t.string('title', 180).notNullable();
    t.string('description', 500).nullable();
    t.integer('position').notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.foreign('course_id').references('courses.id').onDelete('CASCADE');
    t.index(['course_id', 'position'], 'modules_course_position_idx');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('modules');
};
