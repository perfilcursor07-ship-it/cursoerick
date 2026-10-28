import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { courseSchema, fieldErrors } from '@/lib/validators';
import { jsonError, jsonOk, uniqueSlug } from '@/lib/utils';

export const POST = withAdmin(async (request) => {
  const body = await readJson(request);
  const parsed = courseSchema.safeParse(body || {});
  if (!parsed.success) {
    return jsonError('Confira os campos', 422, { fields: fieldErrors(parsed.error) });
  }

  const data = parsed.data;
  const slug = await uniqueSlug(db, 'courses', data.title);
  const max = await db('courses').max('position as m').first();

  const [id] = await db('courses').insert({
    ...data,
    slug,
    position: (max?.m || 0) + 1,
  });

  return jsonOk({ id, slug });
});
