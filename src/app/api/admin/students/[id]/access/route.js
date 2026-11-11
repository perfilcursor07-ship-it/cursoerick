import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { jsonError, jsonOk } from '@/lib/utils';

async function grantLesson(studentId, lessonId, adminId) {
  const exists = await db('lesson_access')
    .where({ user_id: studentId, lesson_id: lessonId })
    .first();
  if (!exists) {
    await db('lesson_access').insert({
      user_id: studentId,
      lesson_id: lessonId,
      granted_by: adminId,
    });
  }
}

/**
 * Liberacao individual de aula(s) para UM aluno.
 * body: { lesson_id, granted }  ou  { all_pro: true, granted }
 */
export const POST = withAdmin(async (request, { params }, admin) => {
  const body = (await readJson(request)) || {};
  const granted = Boolean(body.granted);

  const student = await db('users').where({ id: params.id }).first();
  if (!student) return jsonError('Aluno nao encontrado', 404);

  if (body.all_pro) {
    const proLessons = await db('lessons').where({ is_pro: true }).select('id');
    const ids = proLessons.map((l) => l.id);
    if (granted) {
      for (const id of ids) {
        await grantLesson(student.id, id, admin.id);
      }
    } else if (ids.length) {
      await db('lesson_access').where({ user_id: student.id }).whereIn('lesson_id', ids).del();
    }
    return jsonOk({ granted, count: ids.length });
  }

  const lessonId = Number(body.lesson_id);
  if (!lessonId) return jsonError('Aula nao informada');

  const lesson = await db('lessons').where({ id: lessonId }).first();
  if (!lesson) return jsonError('Aula nao encontrada', 404);

  if (granted) {
    await grantLesson(student.id, lesson.id, admin.id);
  } else {
    await db('lesson_access').where({ user_id: student.id, lesson_id: lesson.id }).del();
  }

  return jsonOk({ granted });
});
