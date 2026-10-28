import { SignJWT, jwtVerify } from 'jose';

/**
 * Funcoes de token isoladas em jose (compativel com o middleware do Next,
 * que roda no runtime edge e nao aceita bibliotecas nativas).
 */
/**
 * Em producao o segredo e obrigatorio: sem ele qualquer pessoa que conheca o
 * valor padrao conseguiria forjar um cookie de administrador. Em
 * desenvolvimento usamos um valor fixo so para nao travar o `npm run dev`.
 */
const DEV_FALLBACK = 'apenas-desenvolvimento-rode-npm-run-jwt-secret';

function secretValue() {
  const value = process.env.JWT_SECRET;
  if (value && value.length >= 32) return value;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET ausente ou muito curto (minimo 32 caracteres). Rode: npm run jwt:secret'
    );
  }

  console.warn('[aviso] JWT_SECRET fraco ou ausente - rode: npm run jwt:secret');
  return DEV_FALLBACK;
}

const secret = () => new TextEncoder().encode(secretValue());

export const SESSION_COOKIE = 'curso_session';

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES || '7d')
    .sign(secret());
}

export async function readSession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}
