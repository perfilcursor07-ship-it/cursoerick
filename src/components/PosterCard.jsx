import Link from 'next/link';
import { CalendarClock, Check, Lock, Play } from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/utils';

/** Paletas usadas quando a aula ainda nao tem arte de capa. */
const GRADIENTS = [
  'from-brand-600 via-brand-900 to-black',
  'from-orange-600 via-ink-900 to-black',
  'from-teal-600 via-ink-900 to-black',
  'from-amber-600 via-ink-900 to-black',
  'from-lime-700 via-ink-900 to-black',
  'from-cyan-700 via-ink-900 to-black',
];

/**
 * Cartaz vertical de uma aula (estilo Netflix).
 * Cresce no hover e mostra cadeado quando a aula ainda nao foi liberada.
 */
export default function PosterCard({ lesson, index }) {
  const { state } = lesson;
  const locked = !state.unlocked;
  const hasArt = Boolean(lesson.thumbnail_url);
  const gradient = GRADIENTS[(lesson.id + index) % GRADIENTS.length];

  const art = lesson.thumbnail_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={lesson.thumbnail_url}
      alt={lesson.title}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  ) : (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 bg-grid-dark bg-[size:26px_26px] opacity-40" />
      <span className="absolute left-3 top-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
        Aula
      </span>
      <span className="absolute inset-0 grid place-items-center pb-10 text-[64px] font-black leading-none tracking-tighter text-white/15">
        {String(index).padStart(2, '0')}
      </span>
    </div>
  );

  const inner = (
    <article
      className={[
        'group relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/5 bg-ink-850',
        'transition-all duration-300 ease-out',
        locked
          ? 'hover:scale-[1.06] hover:border-white/10'
          : 'hover:z-20 hover:scale-[1.08] hover:border-brand-400/40 hover:shadow-[0_24px_60px_-18px_rgba(245,158,11,.6)]',
      ].join(' ')}
    >
      {art}

      {/* vinheta para o texto respirar (mais leve quando ha arte propria) */}
      <div
        className={[
          'absolute inset-0 bg-gradient-to-t to-transparent',
          hasArt ? 'from-black/35 via-transparent' : 'from-black/85 via-black/10',
        ].join(' ')}
      />

      {/* aulas travadas ficam apagadas */}
      {locked && (
        <div className="absolute inset-0 bg-black/55 backdrop-grayscale transition group-hover:bg-black/45" />
      )}

      {/* selo de estado no canto superior */}
      <div className="absolute right-2.5 top-2.5 z-10">
        {locked ? (
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/70 text-white/80 backdrop-blur">
            {state.lock?.code === 'scheduled' ? (
              <CalendarClock size={13} />
            ) : (
              <Lock size={13} />
            )}
          </span>
        ) : state.completed ? (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-black">
            <Check size={14} strokeWidth={3} />
          </span>
        ) : null}
      </div>

      {/* play que aparece no hover */}
      {!locked && (
        <div className="absolute inset-0 z-10 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur">
            <Play size={18} className="translate-x-[2px] fill-white" />
          </span>
        </div>
      )}

      {/* rodape do cartaz: quando a aula tem arte propria o texto so aparece
          no hover, para nao competir com o titulo desenhado na capa */}
      <div
        className={[
          'absolute inset-x-0 bottom-0 z-10 p-3 transition-opacity duration-300',
          hasArt ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
        ].join(' ')}
      >
        {hasArt && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-black via-black/80 to-transparent" />
        )}

        {!hasArt && (
          <p
            className={[
              'line-clamp-2 text-[12px] font-semibold leading-tight',
              locked ? 'text-zinc-400' : 'text-white',
            ].join(' ')}
          >
            {lesson.title}
          </p>
        )}

        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-wide text-white/55">
          {locked
            ? state.lock?.code === 'scheduled' && lesson.release_at
              ? formatDateTime(lesson.release_at)
              : state.lock?.code === 'sequence'
                ? 'conclua a anterior'
                : 'em breve'
            : lesson.duration_seconds > 0
              ? formatDuration(lesson.duration_seconds)
              : 'disponivel'}
        </p>

      </div>

      {/* barra de progresso de quem ja comecou (sempre visivel) */}
      {!locked && state.secondsWatched > 0 && lesson.duration_seconds > 0 && (
        <div className="absolute inset-x-3 bottom-2 z-20 h-[3px] overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-brand-400"
            style={{
              width: `${Math.min(
                100,
                Math.round((state.secondsWatched / lesson.duration_seconds) * 100)
              )}%`,
            }}
          />
        </div>
      )}
    </article>
  );

  if (locked) {
    return (
      <div
        className="block w-[138px] shrink-0 cursor-not-allowed select-none sm:w-[160px] lg:w-[178px]"
        title={state.lock?.message || 'Aguardando liberacao'}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/painel/aula/${lesson.slug}`}
      className="block w-[138px] shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:w-[160px] lg:w-[178px]"
    >
      {inner}
    </Link>
  );
}
