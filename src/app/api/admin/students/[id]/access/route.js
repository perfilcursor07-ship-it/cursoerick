import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { jsonError, jsonOk } from '@/lib/utils';

/**
 * Liberacao individual de uma aula para UM aluno.
 * body: { lesson_id, granted: boolean }
 */
export const POST = withAdmin(async (request, { params }, admin) => {
  const body = (await readJson(request)) || {};
  const lessonId = Number(body.lesson_id);
  if (!lessonId) return jsonError('Aula nao informada');

  const student = await db('users').where({ id: params.id }).first();
  if (!student) return jsonError('Aluno nao encontrado', 404);

  const lesson = await db('lessons').where({ id: lessonId }).first();
  if (!lesson) return jsonError('Aula nao encontrada', 404);

  if (body.granted) {
    const exists = await db('lesson_access')
      .where({ user_id: student.id, lesson_id: lesson.id })
      .first();
    if (!exists) {
      await db('lesson_access').insert({
        user_id: student.id,
        lesson_id: lesson.id,
        granted_by: admin.id,
      });
    }
  } else {
    await db('lesson_access').where({ user_id: student.id, lesson_id: lesson.id }).del();
  }

  return jsonOk({ granted: Boolean(body.granted) });
});
