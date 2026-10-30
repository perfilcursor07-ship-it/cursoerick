import { db } from '@/lib/db';
import { withUser, readJson } from '@/lib/api';
import { checkPassword, hashPassword } from '@/lib/auth';
import { fieldErrors, profileSchema } from '@/lib/validators';
import { jsonError, jsonOk } from '@/lib/utils';

export const PATCH = withUser(async (request, _context, user) => {
  const body = await readJson(request);
  if (!body) return jsonError('Dados invalidos');

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Confira os campos destacados', 422, {
      fields: fieldErrors(parsed.error),
    });
  }

  const { phone, currentPassword, newPassword } = parsed.data;
  const account = await db('users')
    .select('id', 'password_hash')
    .where({ id: user.id })
    .first();

  if (!account || !(await checkPassword(currentPassword, account.password_hash))) {
    return jsonError('A senha atual esta incorreta', 422, {
      fields: { currentPassword: 'Confira sua senha atual' },
    });
  }

  const updates = { phone };
  if (newPassword) updates.password_hash = await hashPassword(newPassword);

  await db('users').where({ id: user.id }).update(updates);

  return jsonOk({ phone, passwordUpdated: Boolean(newPassword) });
});
