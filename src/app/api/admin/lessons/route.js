import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { fieldErrors, lessonSchema } from '@/lib/validators';
import { jsonError, jsonOk, uniqueSlug } from '@/lib/utils';

export const POST = withAdmin(async (request) => {
  const parsed = lessonSchema.safeParse((await readJson(request)) || {});
  if (!parsed.success) {
    return jsonError('Confira os campos', 422, { fields: fieldErrors(parsed.error) });
  }

  const data = parsed.data;
  const mod = await db('modules').where({ id: data.module_id }).first();
  if (!mod) return jsonError('Modulo nao encontrado', 404);

  const max = await db('lessons').where({ module_id: data.module_id }).max('position as m').first();
  const slug = await uniqueSlug(db, 'lessons', data.title);

  const [id] = await db('lessons').insert({
    module_id: data.module_id,
    title: data.title,
    slug,
    description: data.description,
    video_type: data.video_type,
    video_url: data.video_type === 'external' ? data.video_url : null,
    video_path: data.video_type === 'upload' ? data.video_path || null : null,
    thumbnail_url: data.thumbnail_url || null,
    duration_seconds: data.duration_seconds,
    release_mode: data.release_mode,
    is_released: data.release_mode === 'free' ? true : data.is_released,
    release_at: data.release_mode === 'scheduled' && data.release_at ? new Date(data.release_at) : null,
    is_published: data.is_published,
    position: data.position || (max?.m || 0) + 1,
  });

  return jsonOk({ id, slug });
});
