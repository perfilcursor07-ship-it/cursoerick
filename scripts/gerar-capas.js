/**
 * Gera as artes de capa das aulas (cartaz vertical 2:3) e o banner de cada
 * curso, direto do titulo cadastrado no banco.
 *
 *   node scripts/gerar-capas.js            gera so o que ainda nao tem capa
 *   node scripts/gerar-capas.js --force    refaz todas as capas
 *
 * Os arquivos sao SVG (leves e nitidos em qualquer tela) e ficam em
 * public/uploads/capas/. Depois e so substituir pela sua arte no painel.
 */
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

const FORCE = process.argv.includes('--force');
const OUT_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'capas');

/** Paletas por modulo: tons de verde que vao esquentando ate o dourado. */
const PALETTES = [
  { from: '#10b981', mid: '#064e3b', to: '#04090a', glow: '#6ee7b7', accent: '#d1fae5' },
  { from: '#0d9488', mid: '#0b3b3a', to: '#04090c', glow: '#2dd4bf', accent: '#ccfbf1' },
  { from: '#65a30d', mid: '#1a2e05', to: '#060a04', glow: '#facc15', accent: '#fef08a' },
  { from: '#16a34a', mid: '#052e16', to: '#04090a', glow: '#4ade80', accent: '#dcfce7' },
];

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const slug = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

/** Quebra o titulo em linhas curtas para caber no cartaz. */
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Enfeite diferente por modulo, para as prateleiras nao ficarem iguais. */
function ornament(moduleIndex, p) {
  if (moduleIndex % 3 === 1) {
    // barras subindo
    const bars = [120, 190, 260, 330].map((h, i) => {
      const x = 360 + i * 56;
      return `<rect x="${x}" y="${470 - h}" width="34" height="${h}" rx="10" fill="${p.accent}" opacity="${0.12 + i * 0.07}"/>`;
    });
    return bars.join('');
  }

  if (moduleIndex % 3 === 2) {
    // cifrao
    return `
    <g opacity="0.16" transform="translate(300 180)">
      <circle cx="140" cy="140" r="140" fill="none" stroke="${p.accent}" stroke-width="6"/>
      <text x="140" y="212" text-anchor="middle" font-family="Inter, 'Arial Black', Arial, sans-serif"
            font-size="210" font-weight="900" fill="${p.accent}">$</text>
    </g>`;
  }

  // circulos concentricos
  return `
  <g opacity="0.14" fill="none" stroke="${p.accent}" stroke-width="5">
    <circle cx="430" cy="300" r="90"/>
    <circle cx="430" cy="300" r="150"/>
    <circle cx="430" cy="300" r="210"/>
  </g>`;
}

function poster({ number, title, moduleLabel, moduleIndex }) {
  const p = PALETTES[moduleIndex % PALETTES.length];
  const lines = wrap(title.toUpperCase(), 15).slice(0, 4);
  const lineHeight = 52;
  const firstY = 900 - 76 - (lines.length - 1) * lineHeight;

  const tspans = lines
    .map((l, i) => `<tspan x="48" y="${firstY + i * lineHeight}">${esc(l)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="${p.from}"/>
      <stop offset="0.52" stop-color="${p.mid}"/>
      <stop offset="1" stop-color="${p.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.75" cy="0.18" r="0.72">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shade" x1="0" y1="0.42" x2="0" y2="1">
      <stop offset="0" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.88"/>
    </linearGradient>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M50 0H0V50" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="600" height="900" fill="url(#bg)"/>
  <rect width="600" height="900" fill="url(#grid)"/>
  <rect width="600" height="900" fill="url(#glow)"/>
  ${ornament(moduleIndex, p)}
  <text x="48" y="470" font-family="Inter, 'Arial Black', Arial, sans-serif" font-size="230"
        font-weight="900" fill="#ffffff" opacity="0.13" letter-spacing="-12">${number}</text>
  <rect width="600" height="900" fill="url(#shade)"/>

  <text x="48" y="92" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="700"
        fill="#ffffff" opacity="0.6" letter-spacing="7">${esc(moduleLabel)}</text>
  <rect x="48" y="112" width="52" height="4" rx="2" fill="${p.accent}" opacity="0.85"/>

  <text font-family="Inter, 'Arial Black', Arial, sans-serif" font-size="46" font-weight="900"
        fill="#ffffff" letter-spacing="-1">${tspans}</text>
  <rect x="48" y="838" width="76" height="5" rx="2.5" fill="${p.accent}"/>
</svg>
`;
}

/**
 * O banner e so arte de fundo: o titulo do curso ja e escrito por cima pela
 * propria pagina, entao a imagem nao repete o texto.
 */
function banner({ title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="720" viewBox="0 0 1920 720" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05402f"/>
      <stop offset="0.45" stop-color="#063b2c"/>
      <stop offset="1" stop-color="#04090a"/>
    </linearGradient>
    <radialGradient id="g1" cx="0.5" cy="0.1" r="0.7">
      <stop offset="0" stop-color="#10b981" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="0.12" cy="0.85" r="0.55">
      <stop offset="0" stop-color="#2dd4bf" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="0.88" cy="0.8" r="0.5">
      <stop offset="0" stop-color="#facc15" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#facc15" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1920" height="720" fill="url(#bg)"/>
  <rect width="1920" height="720" fill="url(#grid)"/>
  <rect width="1920" height="720" fill="url(#g1)"/>
  <rect width="1920" height="720" fill="url(#g2)"/>
  <rect width="1920" height="720" fill="url(#g3)"/>

  <g opacity="0.1" fill="none" stroke="#ffffff" stroke-width="4">
    <circle cx="1640" cy="210" r="110"/>
    <circle cx="1640" cy="210" r="180"/>
    <circle cx="280" cy="560" r="150"/>
    <circle cx="280" cy="560" r="230"/>
  </g>
  <text x="1640" y="276" text-anchor="middle" font-family="Inter, 'Arial Black', Arial, sans-serif"
        font-size="150" font-weight="900" fill="#ffffff" opacity="0.09">$</text>
  <text x="280" y="625" text-anchor="middle" font-family="Inter, 'Arial Black', Arial, sans-serif"
        font-size="190" font-weight="900" fill="#ffffff" opacity="0.07">$</text>

  <g opacity="0.1">
    <rect x="1180" y="520" width="44" height="90" rx="14" fill="#ffffff"/>
    <rect x="1248" y="470" width="44" height="140" rx="14" fill="#ffffff"/>
    <rect x="1316" y="408" width="44" height="202" rx="14" fill="#ffffff"/>
    <rect x="1384" y="340" width="44" height="270" rx="14" fill="#ffffff"/>
  </g>
</svg>
`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'curso_erick',
  });

  const [courses] = await db.execute('SELECT * FROM courses ORDER BY position, id');
  let posters = 0;
  let banners = 0;

  for (const course of courses) {
    // ---- banner do curso ----
    if (FORCE || !course.cover_url) {
      const file = `banner-${slug(course.title)}.svg`;
      fs.writeFileSync(
        path.join(OUT_DIR, file),
        banner({ title: course.title, subtitle: course.subtitle || 'aula por aula' })
      );
      await db.execute('UPDATE courses SET cover_url = ?, updated_at = NOW() WHERE id = ?', [
        `/uploads/capas/${file}`,
        course.id,
      ]);
      banners += 1;
    }

    // ---- capa de cada aula ----
    const [modules] = await db.execute(
      'SELECT * FROM modules WHERE course_id = ? ORDER BY position, id',
      [course.id]
    );

    let n = 0;
    for (let mi = 0; mi < modules.length; mi += 1) {
      const [lessons] = await db.execute(
        'SELECT * FROM lessons WHERE module_id = ? ORDER BY position, id',
        [modules[mi].id]
      );

      for (const lesson of lessons) {
        n += 1;
        if (!FORCE && lesson.thumbnail_url) continue;

        const file = `aula-${String(n).padStart(2, '0')}-${slug(lesson.title)}.svg`;
        fs.writeFileSync(
          path.join(OUT_DIR, file),
          poster({
            number: String(n).padStart(2, '0'),
            title: lesson.title,
            moduleLabel: `MODULO ${mi + 1}`,
            moduleIndex: mi,
          })
        );

        await db.execute('UPDATE lessons SET thumbnail_url = ?, updated_at = NOW() WHERE id = ?', [
          `/uploads/capas/${file}`,
          lesson.id,
        ]);
        posters += 1;
      }
    }
  }

  console.log(`[ok] ${posters} capa(s) de aula e ${banners} banner(s) gerados em ${OUT_DIR}`);
  if (!FORCE) console.log('     use --force para refazer as que ja existem');

  await db.end();
}

main().catch((err) => {
  console.error('[erro]', err.message);
  process.exit(1);
});
