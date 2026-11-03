import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

export const dynamic = 'force-dynamic';

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

function capasDir() {
  return path.resolve(process.cwd(), 'public', 'uploads', 'capas');
}

/**
 * Entrega as capas enviadas pelo painel.
 *
 * O Next so serve a pasta public/ conforme ela estava no build, entao um arquivo
 * gravado em producao depois do deploy nunca aparece como estatico. Esta rota
 * responde na mesma URL que o upload devolve (/uploads/capas/<arquivo>), assim
 * o que ja esta salvo no banco continua valendo.
 *
 * Em desenvolvimento o arquivo estatico tem prioridade e esta rota nem roda.
 */
export async function GET(_request, { params }) {
  const base = capasDir();

  // o upload sempre grava um arquivo solto na pasta: basename() descarta
  // qualquer tentativa de subir de diretorio pela URL.
  const fileName = path.basename(decodeURIComponent(params.file || ''));
  const filePath = path.join(base, fileName);

  // confere que o caminho final continua DENTRO da pasta permitida
  const relative = path.relative(base, filePath);
  const dentroDaPasta =
    relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);

  const ext = path.extname(fileName).toLowerCase();
  if (!dentroDaPasta || !MIME[ext]) {
    return new Response('Arquivo nao encontrado', { status: 404 });
  }

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return new Response('Arquivo nao encontrado', { status: 404 });
  }
  if (!stat.isFile()) return new Response('Arquivo nao encontrado', { status: 404 });

  const stream = fs.createReadStream(filePath);
  return new Response(Readable.toWeb(stream), {
    status: 200,
    headers: {
      'Content-Type': MIME[ext],
      'Content-Length': String(stat.size),
      // o nome do arquivo ja carrega timestamp + hash, entao nunca muda de conteudo
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
