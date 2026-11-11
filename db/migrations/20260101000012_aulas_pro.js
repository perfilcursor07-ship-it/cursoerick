/**
 * Aulas PRO (so para assinantes).
 *
 *  - coluna is_pro: a aula nunca abre para todo mundo
 *  - o admin libera aluno a aluno em /admin/alunos
 *  - cria o Modulo 4 no curso de dolar se ele ja existir
 */

const { PRO_MODULE, slugifyPro } = require('../data/aulas-pro');

const COURSE_SLUG = 'paginas-que-pagam-em-dolar';

exports.up = async function up(knex) {
  if (!(await knex.schema.hasColumn('lessons', 'is_pro'))) {
    await knex.schema.alterTable('lessons', (t) => {
      t.boolean('is_pro').notNullable().defaultTo(false);
    });
  }

  const course = await knex('courses').where({ slug: COURSE_SLUG }).first();
  if (!course) return;

  const existing = await knex('modules')
    .where({ course_id: course.id, title: PRO_MODULE.title })
    .first();
  if (existing) return;

  const maxMod = await knex('modules').where({ course_id: course.id }).max('position as m').first();
  const lessonCount = await knex('lessons')
    .join('modules', 'modules.id', 'lessons.module_id')
    .where('modules.course_id', course.id)
    .count({ c: '*' })
    .first();

  const [moduleId] = await knex('modules').insert({
    course_id: course.id,
    title: PRO_MODULE.title,
    description: PRO_MODULE.description,
    position: (maxMod?.m || 0) + 1,
  });

  let n = Number(lessonCount?.c || 0);
  for (let i = 0; i < PRO_MODULE.lessons.length; i += 1) {
    const lesson = PRO_MODULE.lessons[i];
    n += 1;
    await knex('lessons').insert({
      module_id: moduleId,
      title: lesson.title,
      slug: slugifyPro(lesson.title, n),
      description: lesson.description,
      task: (lesson.task || []).join('\n') || null,
      video_type: 'external',
      video_url: '',
      release_mode: 'manual',
      is_released: false,
      is_pro: true,
      is_published: true,
      position: i + 1,
    });
  }
};

exports.down = async function down(knex) {
  const course = await knex('courses').where({ slug: COURSE_SLUG }).first();
  if (course) {
    const mod = await knex('modules')
      .where({ course_id: course.id, title: PRO_MODULE.title })
      .first();
    if (mod) await knex('modules').where({ id: mod.id }).del();
  }

  if (await knex.schema.hasColumn('lessons', 'is_pro')) {
    await knex.schema.alterTable('lessons', (t) => {
      t.dropColumn('is_pro');
    });
  }
};
