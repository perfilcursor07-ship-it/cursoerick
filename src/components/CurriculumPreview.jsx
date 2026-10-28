import { Lock, Play } from 'lucide-react';
import { isGloballyReleased } from '@/lib/access';

/**
 * Vitrine compacta da grade na home: um card por modulo com as capas das aulas
 * em miniatura. Mostra o tamanho do curso sem precisar listar aula por aula.
 */
export default function CurriculumPreview({ curriculum }) {
  let counter = 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {curriculum.modules.map((mod, mi) => (
        <div key={mod.id} className="card p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-xs font-bold text-brand-300">
              {mi + 1}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white">{mod.title}</h3>
              <p className="text-[11px] text-zinc-500">{mod.lessons.length} aulas</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {mod.lessons.map((lesson) => {
              counter += 1;
              const open = isGloballyReleased(lesson);

              return (
                <div
                  key={lesson.id}
                  title={lesson.title}
                  className={[
                    'relative aspect-[2/3] overflow-hidden rounded-md border',
                    open ? 'border-brand-500/40' : 'border-white/5',
                  ].join(' ')}
                >
                  {lesson.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={lesson.thumbnail_url}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-700 via-ink-900 to-black text-[11px] font-black text-white/25">
                      {String(counter).padStart(2, '0')}
                    </div>
                  )}

                  {!open && <div className="absolute inset-0 bg-black/65 backdrop-grayscale" />}

                  <span className="absolute inset-0 grid place-items-center">
                    {open ? (
                      <Play size={12} className="fill-white text-white drop-shadow" />
                    ) : (
                      <Lock size={11} className="text-white/55" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
