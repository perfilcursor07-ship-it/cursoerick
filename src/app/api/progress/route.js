import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getLessonForUser } from '@/lib/access';
import { jsonError, jsonOk } from '@/lib/utils';

/**
 * Salva o progresso do aluno em uma aula.
 * body: { slug, seconds?, completed? }
 */
export async function POST(request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return jsonError(err.message, err.status || 401);
  }

  const body = await request.json().catch(() => null);
  if (!body?.slug) return jsonError('Aula nao informada');

  const { lesson, unlocked } = await getLessonForUser(body.slug, user);
  if (!lesson) return jsonError('Aula nao encontrada', 404);
  if (!unlocked) return jsonError('Esta aula ainda nao foi liberada', 403);

  const seconds = Math.max(0, Math.floor(Number(body.seconds) || 0));
  const completed = Boolean(body.completed);

  const existing = await db('lesson_progress')
    .where({ user_id: user.id, lesson_id: lesson.id })
    .first();

  if (existing) {
    await db('lesson_progress')
      .where({ id: existing.id })
      .update({
        seconds_watched: Math.max(existing.seconds_watched, seconds),
        completed: existing.completed || completed,
        completed_at:
          existing.completed || !completed ? existing.completed_at : db.fn.now(),
        updated_at: db.fn.now(),
      });
  } else {
    await db('lesson_progress').insert({
      user_id: user.id,
      lesson_id: lesson.id,
      seconds_watched: seconds,
      completed,
      completed_at: completed ? db.fn.now() : null,
    });
  }

  return jsonOk();
}
