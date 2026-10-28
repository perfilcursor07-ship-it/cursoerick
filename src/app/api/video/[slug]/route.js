import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { currentUser } from '@/lib/auth';
import { getLessonForUser } from '@/lib/access';

export const dynamic = 'force-dynamic';

const MIME = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
};

function storageDir() {
  return path.resolve(process.cwd(), process.env.VIDEO_STORAGE_DIR || './storage/videos');
}

/**
 * Streaming protegido: o arquivo fica fora da pasta publica e so e entregue
 * se o aluno tiver a aula liberada. Suporta Range para permitir avancar o video.
 */
export async function GET(request, { params }) {
  const user = await currentUser();
  const { lesson, unlocked } = await getLessonForUser(params.slug, user);

  if (!lesson) return new Response('Aula nao encontrada', { status: 404 });
  if (!unlocked) return new Response('Aula bloqueada', { status: 403 });
  if (lesson.video_type !== 'upload' || !lesson.video_path) {
    return new Response('Esta aula nao possui arquivo de video', { status: 404 });
  }

  const base = storageDir();

  // O upload sempre grava um arquivo solto na pasta, entao basename() descarta
  // qualquer pasta que tenha sido escrita a mao no campo video_path.
  const fileName = path.basename(lesson.video_path);
  const filePath = path.join(base, fileName);

  // confere que o caminho final continua DENTRO da pasta permitida.
  // (um simples startsWith deixaria passar uma pasta irma como "videos-x")
  const relative = path.relative(base, filePath);
  const dentroDaPasta =
    relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);

  if (!dentroDaPasta || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new Response('Arquivo nao encontrado', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  const range = request.headers.get('range');

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match && match[1] ? Number(match[1]) : 0;
    const end = match && match[2] ? Number(match[2]) : stat.size - 1;

    if (start >= stat.size || end >= stat.size || start > end) {
      return new Response('Range invalido', {
        status: 416,
        headers: { 'Content-Range': `bytes */${stat.size}` },
      });
    }

    const stream = fs.createReadStream(filePath, { start, end });
    return new Response(Readable.toWeb(stream), {
      status: 206,
      headers: {
        'Content-Type': type,
        'Content-Length': String(end - start + 1),
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=0, no-store',
      },
    });
  }

  const stream = fs.createReadStream(filePath);
  return new Response(Readable.toWeb(stream), {
    status: 200,
    headers: {
      'Content-Type': type,
      'Content-Length': String(stat.size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=0, no-store',
    },
  });
}
