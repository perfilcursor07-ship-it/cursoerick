import Link from 'next/link';
import { CalendarClock, Check, Lock, Play } from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/utils';

/**
 * Paletas usadas quando a aula ainda nao tem arte de capa: uma por modulo,
 * para cada prateleira ter a sua cor (verde -> teal -> lima -> esmeralda).
 */
const PALETTES = [
  { bg: 'from-emerald-500 via-emerald-950 to-black', glow: 'bg-emerald-300', tag: 'text-emerald-200' },
  { bg: 'from-teal-400 via-cyan-950 to-black', glow: 'bg-cyan-300', tag: 'text-cyan-200' },
  { bg: 'from-lime-400 via-green-950 to-black', glow: 'bg-yellow-300', tag: 'text-lime-200' },
  { bg: 'from-green-500 via-teal-950 to-black', glow: 'bg-green-300', tag: 'text-green-200' },
];

/** Arte do cartaz: a capa enviada pelo admin ou um cartaz gerado com o titulo. */
export function PosterArt({ lesson, index, tone = 0, compact = false }) {
  if (lesson.thumbnail_url) {
    const isWelcomeLesson = lesson.slug === 'aula-01-boas-vindas-como-funciona-ganhar-em-dolar';
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lesson.thumbnail_url}
          alt={lesson.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {isWelcomeLesson && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20">
            <span className="absolute left-3 top-3 rounded bg-brand-400 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-black shadow-lg">
              Aula 01
            </span>
            <div className="absolute inset-x-3 bottom-10">
              <p className="font-brush text-[19px] uppercase leading-none text-white drop-shadow-lg">Boas-vindas</p>
              <p className="mt-1 text-[9px] font-semibold leading-tight text-emerald-100 drop-shadow-lg">
                Como funciona ganhar em dólar
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  const p = PALETTES[tone % PALETTES.length];
  const number = String(index).padStart(2, '0');

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${p.bg}`}>
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${p.glow} opacity-40 blur-3xl`} />
      <div className="absolute inset-0 bg-grid-dark bg-[size:22px_22px] opacity-30" />

      {/* numero gigante ao fundo */}
      <span className="absolute -right-2 top-6 font-brush text-[clamp(7rem,30vw,10rem)] leading-none text-white/[0.09] transition duration-500 group-hover:text-white/[0.14]">
        {number}
      </span>

      <span
        className={`absolute left-3 top-3 rounded bg-black/35 px-1.5 py-0.5 text-[9px] sm:left-4 sm:top-4 sm:text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm ${p.tag}`}
      >
        Aula {number}
      </span>

      <p
        className={[
          'absolute line-clamp-4 font-brush uppercase leading-[1.05] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.7)]',
          compact
            ? 'inset-x-3 bottom-10 text-[17px]'
            : 'inset-x-3 bottom-10 text-[19px] sm:inset-x-4 sm:bottom-12 sm:text-[23px] lg:text-[25px]',
        ].join(' ')}
      >
        {lesson.title}
      </p>
    </div>
  );
}

function statusLabel(lesson) {
  const { state } = lesson;
  if (!state.unlocked) {
    if (state.lock?.code === 'scheduled' && lesson.release_at) return formatDateTime(lesson.release_at);
    if (state.lock?.code === 'sequence') return 'Conclua a anterior';
    return 'Em breve';
  }
  if (state.completed) return 'Concluída';
  return lesson.duration_seconds > 0 ? formatDuration(lesson.duration_seconds) : 'Assistir';
}

/**
 * Cartaz vertical de uma aula (estilo Netflix).
 * Cresce no hover e mostra cadeado quando a aula ainda nao foi liberada.
 */
export default function PosterCard({ lesson, index, tone = 0 }) {
  const { state } = lesson;
  const locked = !state.unlocked;
  const hasArt = Boolean(lesson.thumbnail_url);
  const watched =
    !locked && state.secondsWatched > 0 && lesson.duration_seconds > 0
      ? Math.min(100, Math.round((state.secondsWatched / lesson.duration_seconds) * 100))
      : 0;

  const inner = (
    <article
      className={[
        'group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-ink-850 ring-1 ring-white/10',
        'transition duration-300 ease-out',
        locked
          ? 'hover:scale-[1.04]'
          : 'hover:z-20 hover:scale-[1.05] hover:ring-2 hover:ring-brand-300/70 hover:shadow-[0_22px_50px_-16px_rgba(16,185,129,.55)]',
      ].join(' ')}
    >
      <div className={locked ? 'absolute inset-0 brightness-[.6] saturate-[.45]' : 'absolute inset-0'}>
        <PosterArt lesson={lesson} index={index} tone={tone} />
      </div>

      {/* vinheta para o rodape respirar */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />

      {/* selo de estado no canto superior */}
      <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
        {locked ? (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white/85 ring-1 ring-white/15 backdrop-blur">
            {state.lock?.code === 'scheduled' ? <CalendarClock size={13} /> : <Lock size={13} />}
          </span>
        ) : state.completed ? (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-400 text-black shadow-lg">
            <Check size={14} strokeWidth={3} />
          </span>
        ) : null}
      </div>

      {/* play que aparece no hover */}
      {!locked && (
        <div className="absolute inset-0 z-10 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="grid h-12 w-12 scale-90 place-items-center rounded-full bg-white sm:h-14 sm:w-14 text-black shadow-xl transition duration-300 group-hover:scale-100">
            <Play size={20} className="translate-x-[2px] fill-current" />
          </span>
        </div>
      )}

      {/* rodape: com arte propria o titulo so aparece no hover */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
        {hasArt && (
          <p className="mb-1 line-clamp-2 text-[12px] font-semibold leading-tight text-white opacity-0 transition group-hover:opacity-100">
            {lesson.title}
          </p>
        )}
        <span
          className={[
            'inline-flex max-w-full items-center truncate rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:px-2 sm:text-[10px]',
            locked ? 'bg-white/10 text-white/60' : 'bg-brand-400/90 text-black',
          ].join(' ')}
        >
          {statusLabel(lesson)}
        </span>
      </div>

      {/* barra de progresso de quem ja comecou (sempre visivel) */}
      {watched > 0 && (
        <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/20">
          <div className="h-full bg-brand-400" style={{ width: `${watched}%` }} />
        </div>
      )}
    </article>
  );

  const size = 'block w-[42vw] max-w-[200px] shrink-0 sm:w-[190px] sm:max-w-none lg:w-[215px]';

  if (locked) {
    return (
      <div
        className={`${size} cursor-not-allowed select-none`}
        title={state.lock?.message || 'Aguardando liberacao'}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/painel/aula/${lesson.slug}`}
      className={`${size} rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-400`}
    >
      {inner}
    </Link>
  );
}
