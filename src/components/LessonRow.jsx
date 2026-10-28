'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PosterCard from './PosterCard';

/**
 * Carrossel horizontal de cartazes (um por modulo), igual as prateleiras
 * das plataformas de streaming: rola de lado e cresce no hover.
 */
export default function LessonRow({ title, subtitle, lessons, startIndex = 1 }) {
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

  const unlocked = lessons.filter((l) => l.state.unlocked).length;

  return (
    <section className="group/row relative">
      <div className="container-page flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
            {title}
          </h2>
          {subtitle && <p className="truncate text-xs text-zinc-500">{subtitle}</p>}
        </div>
        <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-zinc-600">
          {unlocked}/{lessons.length} liberadas
        </span>
      </div>

      <div className="relative mt-3">
        {/* setas (aparecem ao passar o mouse na prateleira) */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          aria-label="Voltar"
          className="absolute left-1 top-1/2 z-30 hidden h-20 w-9 -translate-y-1/2 place-items-center rounded-xl
                     border border-white/10 bg-black/70 text-white opacity-0 backdrop-blur transition
                     hover:bg-black/90 disabled:pointer-events-none disabled:opacity-0
                     group-hover/row:opacity-100 md:grid"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          aria-label="Avancar"
          className="absolute right-1 top-1/2 z-30 hidden h-20 w-9 -translate-y-1/2 place-items-center rounded-xl
                     border border-white/10 bg-black/70 text-white opacity-0 backdrop-blur transition
                     hover:bg-black/90 disabled:pointer-events-none disabled:opacity-0
                     group-hover/row:opacity-100 md:grid"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={trackRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 py-7
                     sm:gap-4 md:px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]"
        >
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="shrink-0 snap-start">
              <PosterCard lesson={lesson} index={startIndex + i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
