import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { fieldErrors, moduleSchema } from '@/lib/validators';
import { jsonError, jsonOk } from '@/lib/utils';

export const POST = withAdmin(async (request) => {
  const parsed = moduleSchema.safeParse((await readJson(request)) || {});
  if (!parsed.success) {
    return jsonError('Confira os campos', 422, { fields: fieldErrors(parsed.error) });
  }

  const data = parsed.data;
  const course = await db('courses').where({ id: data.course_id }).first();
  if (!course) return jsonError('Curso nao encontrado', 404);

  const max = await db('modules').where({ course_id: data.course_id }).max('position as m').first();

  const [id] = await db('modules').insert({
    course_id: data.course_id,
    title: data.title,
    description: data.description,
    position: data.position || (max?.m || 0) + 1,
  });

  return jsonOk({ id });
});
