import slugify from 'slugify';

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function makeSlug(text) {
  return slugify(String(text || ''), { lower: true, strict: true, locale: 'pt' }).slice(0, 80);
}

/** Garante um slug unico na tabela informada. */
export async function uniqueSlug(db, table, text) {
  const base = makeSlug(text) || 'item';
  let slug = base;
  let i = 1;
  /* eslint-disable no-await-in-loop */
  while (await db(table).where({ slug }).first()) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

export function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  if (!total) return '--:--';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Converte links do YouTube/Vimeo no formato de incorporacao. */
export function toEmbedUrl(url) {
  if (!url) return null;
  const value = String(url).trim();

  const yt =
    value.match(/youtube\.com\/watch\?v=([\w-]+)/) ||
    value.match(/youtu\.be\/([\w-]+)/) ||
    value.match(/youtube\.com\/embed\/([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return value;
}

export function jsonError(message, status = 400, extra = {}) {
  return Response.json({ ok: false, error: message, ...extra }, { status });
}

export function jsonOk(data = {}) {
  return Response.json({ ok: true, ...data });
}
