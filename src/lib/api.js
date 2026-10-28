import { requireAdmin, requireUser } from './auth';
import { jsonError } from './utils';

/**
 * Erros esperados (401, 403, 404, 422...) levam a mensagem ate o usuario.
 * Erros inesperados viram uma mensagem generica: a original pode conter
 * caminho de arquivo, nome de tabela ou trecho de SQL.
 */
function handleError(err) {
  if (err?.status && err.status < 500) {
    return jsonError(err.message, err.status);
  }

  console.error('[api] erro inesperado:', err);
  return jsonError('Erro inesperado. Tente novamente.', 500);
}

/** Envolve um handler de API garantindo que exista um usuario logado. */
export function withUser(handler) {
  return async (request, context) => {
    try {
      const user = await requireUser();
      return await handler(request, context, user);
    } catch (err) {
      return handleError(err);
    }
  };
}

/** Envolve um handler de API garantindo que o usuario seja administrador. */
export function withAdmin(handler) {
  return async (request, context) => {
    try {
      const admin = await requireAdmin();
      return await handler(request, context, admin);
    } catch (err) {
      return handleError(err);
    }
  };
}

/** Le o corpo JSON da requisicao com tratamento de erro. */
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
