import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { jsonError, jsonOk } from '@/lib/utils';

/** Alterar status (active/blocked) ou papel (student/admin) de um aluno. */
export const PATCH = withAdmin(async (request, { params }, admin) => {
  const body = (await readJson(request)) || {};
  const patch = {};

  if (body.status === 'active' || body.status === 'blocked') patch.status = body.status;
  if (body.role === 'student' || body.role === 'admin') patch.role = body.role;
  if (!Object.keys(patch).length) return jsonError('Nada para atualizar');

  if (Number(params.id) === admin.id) {
    return jsonError('Voce nao pode alterar a sua propria conta por aqui', 400);
  }

  const updated = await db('users').where({ id: params.id }).update({
    ...patch,
    updated_at: db.fn.now(),
  });
  if (!updated) return jsonError('Aluno nao encontrado', 404);

  return jsonOk();
});

export const DELETE = withAdmin(async (_request, { params }, admin) => {
  if (Number(params.id) === admin.id) {
    return jsonError('Voce nao pode excluir a sua propria conta', 400);
  }
  const deleted = await db('users').where({ id: params.id }).del();
  if (!deleted) return jsonError('Aluno nao encontrado', 404);
  return jsonOk();
});
