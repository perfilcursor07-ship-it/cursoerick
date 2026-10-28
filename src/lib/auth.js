import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { SESSION_COOKIE, readSession, signSession } from './jwt';

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function createSession(user) {
  const token = await signSession({ sub: user.id, role: user.role, name: user.name });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SEVEN_DAYS,
  });
}

export function destroySession() {
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/** Retorna o usuario logado (ou null) lendo o cookie de sessao. */
export async function currentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const payload = await readSession(token);
  if (!payload?.sub) return null;

  const user = await db('users')
    .select('id', 'name', 'email', 'phone', 'role', 'status', 'created_at')
    .where({ id: payload.sub })
    .first();

  if (!user || user.status !== 'active') return null;
  return user;
}

/** Para uso em rotas de API: lanca um objeto com status quando nao autorizado. */
export async function requireUser() {
  const user = await currentUser();
  if (!user) {
    const err = new Error('Nao autenticado');
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') {
    const err = new Error('Acesso restrito ao administrador');
    err.status = 403;
    throw err;
  }
  return user;
}
