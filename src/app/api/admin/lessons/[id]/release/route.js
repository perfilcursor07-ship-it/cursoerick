import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { jsonError, jsonOk } from '@/lib/utils';

/**
 * Liberar / travar uma aula para TODOS os alunos.
 * body: { released: boolean }
 */
export const POST = withAdmin(async (request, { params }) => {
  const body = (await readJson(request)) || {};
  const released = Boolean(body.released);

  const lesson = await db('lessons').where({ id: params.id }).first();
  if (!lesson) return jsonError('Aula nao encontrada', 404);

  await db('lessons')
    .where({ id: lesson.id })
    .update({
      is_released: released,
      // ao liberar manualmente saimos do modo agendado
      release_mode: lesson.release_mode === 'free' ? 'free' : 'manual',
      release_at: null,
      updated_at: db.fn.now(),
    });

  return jsonOk({ released });
});
