'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PosterCard from './PosterCard';

/** "Modulo 1 - A base do jogo" -> { eyebrow: "Modulo 1", name: "A base do jogo" } */
function splitTitle(title) {
  const match = String(title || '').match(/^(m[oó]dulo\s*\d+)\s*[-–—:·|]\s*(.+)$/i);
  return match ? { eyebrow: match[1], name: match[2] } : { eyebrow: null, name: title };
}

/**
 * Carrossel horizontal de cartazes (um por modulo), igual as prateleiras
 * das plataformas de streaming: rola de lado e cresce no hover.
 */
export default function LessonRow({ title, subtitle, lessons, startIndex = 1, tone = 0 }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, lessons.length]);

  function scrollBy(direction) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
  }

  const { eyebrow, name } = splitTitle(title);
  const unlocked = lessons.filter((l) => l.state.unlocked).length;
  const completed = lessons.filter((l) => l.state.completed).length;

  const arrow =
    'absolute inset-y-4 z-30 hidden w-14 place-items-center text-white opacity-0 transition ' +
    'hover:text-brand-300 disabled:pointer-events-none disabled:opacity-0 group-hover/row:opacity-100 md:grid';

  return (
    <section className="group/row relative">
      <div className="container-page flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 truncate text-lg font-bold tracking-tight text-white sm:text-2xl">
            {eyebrow && (
              <span className="font-brush text-xl font-normal uppercase text-brand-300 sm:text-3xl">
                {eyebrow}
              </span>
            )}
            <span className="truncate">{name}</span>
            <ChevronRight
              size={22}
              className="shrink-0 -translate-x-1 text-brand-300 opacity-0 transition group-hover/row:translate-x-0 group-hover/row:opacity-100"
            />
          </h2>
          {subtitle && <p className="mt-0.5 truncate text-xs text-zinc-500 sm:text-sm">{subtitle}</p>}
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="text-[11px] font-semibold text-zinc-500">
            {completed}/{lessons.length} concluídas
          </span>
          <span className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-brand-400"
              style={{ width: `${Math.round((completed / lessons.length) * 100)}%` }}
            />
          </span>
          <span className="sr-only">{unlocked} liberadas</span>
        </div>
      </div>

      <div className="relative">
        {/* setas (aparecem ao passar o mouse na prateleira) */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          aria-label="Voltar"
          className={`${arrow} left-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent`}
        >
          <ChevronLeft size={36} />
        </button>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          aria-label="Avancar"
          className={`${arrow} right-0 bg-gradient-to-l from-ink-950 via-ink-950/70 to-transparent`}
        >
          <ChevronRight size={36} />
        </button>

        <div
          ref={trackRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scroll-px-5 px-5 py-5 sm:gap-4
                     md:scroll-px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))] md:px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]"
        >
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="shrink-0 snap-start">
              <PosterCard lesson={lesson} index={startIndex + i} tone={tone} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
