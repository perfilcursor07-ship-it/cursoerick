import { db } from '@/lib/db';
import { checkPassword, createSession } from '@/lib/auth';
import { fieldErrors, loginSchema } from '@/lib/validators';
import { jsonError, jsonOk } from '@/lib/utils';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Dados invalidos');
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Confira os campos destacados', 422, { fields: fieldErrors(parsed.error) });
  }

  const { email, password } = parsed.data;
  const user = await db('users').where({ email }).first();

  if (!user || !(await checkPassword(password, user.password_hash))) {
    return jsonError('E-mail ou senha incorretos', 401);
  }

  if (user.status !== 'active') {
    return jsonError('Seu acesso esta bloqueado. Fale com o suporte.', 403);
  }

  await db('users').where({ id: user.id }).update({ last_login_at: db.fn.now() });
  await createSession(user);

  return jsonOk({ redirect: user.role === 'admin' ? '/admin' : '/painel' });
}
