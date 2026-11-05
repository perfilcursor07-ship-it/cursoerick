/**
 * Feedback do aluno e sequência obrigatória no curso principal.
 */
exports.up = async function up(knex) {
  if (!(await knex.schema.hasColumn('lesson_progress', 'feedback'))) {
    await knex.schema.alterTable('lesson_progress', (t) => {
      t.string('feedback', 10).nullable();
    });
  }

  await knex('courses')
    .where({ slug: 'paginas-que-pagam-em-dolar' })
    .update({ sequential: true });
};

exports.down = async function down(knex) {
  await knex('courses')
    .where({ slug: 'paginas-que-pagam-em-dolar' })
    .update({ sequential: false });

  if (await knex.schema.hasColumn('lesson_progress', 'feedback')) {
    await knex.schema.alterTable('lesson_progress', (t) => {
      t.dropColumn('feedback');
    });
  }
};