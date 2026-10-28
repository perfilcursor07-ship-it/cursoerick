import { db } from '@/lib/db';
import { createSession, hashPassword } from '@/lib/auth';
import { fieldErrors, registerSchema } from '@/lib/validators';
import { jsonError, jsonOk } from '@/lib/utils';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Dados invalidos');
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Confira os campos destacados', 422, { fields: fieldErrors(parsed.error) });
  }

  const { name, email, phone, password } = parsed.data;

  const exists = await db('users').where({ email }).first();
  if (exists) {
    return jsonError('Este e-mail ja esta cadastrado', 409, {
      fields: { email: 'E-mail ja cadastrado' },
    });
  }

  const [id] = await db('users').insert({
    name,
    email,
    phone,
    password_hash: await hashPassword(password),
    role: 'student',
    status: 'active',
  });

  // matricula automatica nos cursos marcados como auto_enroll
  const courses = await db('courses').where({ auto_enroll: true }).select('id');
  if (courses.length) {
    await db('enrollments').insert(
      courses.map((c) => ({ user_id: id, course_id: c.id }))
    );
  }

  await createSession({ id, name, role: 'student' });

  return jsonOk({ redirect: '/painel' });
}
