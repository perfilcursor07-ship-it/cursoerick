import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { withAdmin } from '@/lib/api';
import { jsonError, jsonOk, makeSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const VIDEO_EXT = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

// teto de tamanho: sem isso um envio sem fim enche o disco do servidor
const MAX_VIDEO_MB = Number(process.env.MAX_VIDEO_MB || 2048);
const MAX_COVER_MB = Number(process.env.MAX_COVER_MB || 10);

/** Corta o envio assim que passar do limite, em vez de gravar o arquivo todo. */
function limitSize(maxBytes) {
  let total = 0;
  return new Transform({
    transform(chunk, _enc, done) {
      total += chunk.length;
      if (total > maxBytes) {
        const err = new Error('LIMITE_EXCEDIDO');
        err.code = 'LIMITE_EXCEDIDO';
        return done(err);
      }
      return done(null, chunk);
    },
  });
}

/**
 * Upload em streaming.
 * O arquivo chega no corpo da requisicao (sem multipart) e o nome vem na query,
 * assim arquivos grandes nao precisam ser carregados inteiros na memoria.
 *
 *  kind=video (padrao) -> storage/videos, entregue pela rota protegida /api/video
 *  kind=cover          -> public/uploads/capas, servido direto como imagem
 *
 * POST /api/admin/upload?filename=aula-01.mp4&kind=video
 */
export const POST = withAdmin(async (request) => {
  const params = new URL(request.url).searchParams;
  const original = params.get('filename') || '';
  const kind = params.get('kind') === 'cover' ? 'cover' : 'video';
  const ext = path.extname(original).toLowerCase();

  const allowed = kind === 'cover' ? IMAGE_EXT : VIDEO_EXT;
  if (!allowed.includes(ext)) {
    return jsonError(`Formato nao suportado. Use: ${allowed.join(', ')}`, 415);
  }
  if (!request.body) return jsonError('Nenhum arquivo recebido');

  const dir =
    kind === 'cover'
      ? path.resolve(process.cwd(), 'public', 'uploads', 'capas')
      : path.resolve(process.cwd(), process.env.VIDEO_STORAGE_DIR || './storage/videos');

  fs.mkdirSync(dir, { recursive: true });

  const base = makeSlug(path.basename(original, ext)) || kind;
  const fileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${base}${ext}`;
  const target = path.join(dir, fileName);

  const maxMb = kind === 'cover' ? MAX_COVER_MB : MAX_VIDEO_MB;

  try {
    await pipeline(
      Readable.fromWeb(request.body),
      limitSize(maxMb * 1024 * 1024),
      fs.createWriteStream(target)
    );
  } catch (err) {
    fs.rmSync(target, { force: true });

    if (err.code === 'LIMITE_EXCEDIDO') {
      return jsonError(`Arquivo muito grande. O limite e de ${maxMb} MB.`, 413);
    }

    console.error('[upload] falha ao gravar:', err);
    return jsonError('Nao foi possivel salvar o arquivo.', 500);
  }

  const { size } = fs.statSync(target);

  if (kind === 'cover') {
    return jsonOk({ url: `/uploads/capas/${fileName}`, size });
  }

  return jsonOk({ video_path: fileName, size });
});
