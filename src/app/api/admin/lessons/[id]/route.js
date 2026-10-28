import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { jsonError, jsonOk } from '@/lib/utils';

const ALLOWED = [
  'title',
  'description',
  'video_type',
  'video_url',
  'video_path',
  'thumbnail_url',
  'duration_seconds',
  'release_mode',
  'is_released',
  'release_at',
  'is_published',
  'position',
  'module_id',
];

export const PATCH = withAdmin(async (request, { params }) => {
  const body = (await readJson(request)) || {};
  const patch = {};
  for (const key of ALLOWED) {
    if (key in body) patch[key] = body[key];
  }
  if (!Object.keys(patch).length) return jsonError('Nada para atualizar');

  if (patch.release_mode === 'free') patch.is_released = true;
  if ('release_at' in patch) {
    patch.release_at = patch.release_at ? new Date(patch.release_at) : null;
  }

  patch.updated_at = db.fn.now();
  const updated = await db('lessons').where({ id: params.id }).update(patch);
  if (!updated) return jsonError('Aula nao encontrada', 404);

  return jsonOk();
});

export const DELETE = withAdmin(async (_request, { params }) => {
  const deleted = await db('lessons').where({ id: params.id }).del();
  if (!deleted) return jsonError('Aula nao encontrada', 404);
  return jsonOk();
});
