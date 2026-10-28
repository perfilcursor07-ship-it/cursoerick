import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { jsonError, jsonOk } from '@/lib/utils';

const ALLOWED = [
  'title',
  'subtitle',
  'description',
  'cover_url',
  'is_published',
  'sequential',
  'auto_enroll',
  'position',
];

export const PATCH = withAdmin(async (request, { params }) => {
  const body = (await readJson(request)) || {};
  const patch = {};
  for (const key of ALLOWED) {
    if (key in body) patch[key] = body[key];
  }
  if (!Object.keys(patch).length) return jsonError('Nada para atualizar');

  patch.updated_at = db.fn.now();
  const updated = await db('courses').where({ id: params.id }).update(patch);
  if (!updated) return jsonError('Curso nao encontrado', 404);

  return jsonOk();
});

export const DELETE = withAdmin(async (_request, { params }) => {
  const deleted = await db('courses').where({ id: params.id }).del();
  if (!deleted) return jsonError('Curso nao encontrado', 404);
  return jsonOk();
});
