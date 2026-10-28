import { db } from '@/lib/db';
import { readJson, withAdmin } from '@/lib/api';
import { jsonError, jsonOk } from '@/lib/utils';

/** Atualiza o conteudo da pagina inicial. body: { chave: valor, ... } */
export const PATCH = withAdmin(async (request) => {
  const body = (await readJson(request)) || {};
  const entries = Object.entries(body).filter(([key]) => /^[\w.]{2,120}$/.test(key));
  if (!entries.length) return jsonError('Nada para atualizar');

  for (const [key, value] of entries) {
    const exists = await db('settings').where({ key }).first();
    if (exists) {
      await db('settings').where({ key }).update({ value: String(value ?? ''), updated_at: db.fn.now() });
    } else {
      await db('settings').insert({ key, value: String(value ?? '') });
    }
  }

  return jsonOk();
});
