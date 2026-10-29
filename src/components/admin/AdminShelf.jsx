'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Eye, ImageIcon, Loader2, Lock, Unlock } from 'lucide-react';
import { api } from '@/lib/client';

const GRADIENTS = [
  'from-brand-600 via-brand-900 to-black',
  'from-emerald-600 via-ink-900 to-black',
  'from-teal-600 via-ink-900 to-black',
  'from-green-700 via-ink-900 to-black',
  'from-lime-700 via-ink-900 to-black',
  'from-cyan-700 via-ink-900 to-black',
];

function isOpen(lesson) {
  if (lesson.release_mode === 'free') return true;
  if (lesson.release_mode === 'manual') return Boolean(lesson.is_released);
  return Boolean(lesson.release_at) && new Date(lesson.release_at) <= new Date();
}

/**
 * Previa da prateleira como o aluno enxerga, com o botao de liberar em cada
 * cartaz. E a forma mais rapida de soltar as aulas uma a uma.
 */
export default function AdminShelf({ modules }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function toggle(lesson) {
    if (lesson.release_mode === 'free') return;
    setBusyId(lesson.id);
    setError('');
    try {
      await api(`/api/admin/lessons/${lesson.id}/release`, {
        method: 'POST',
        body: { released: !isOpen(lesson) },
      });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  let counter = 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-ink-700 bg-ink-800/40 px-5 py-4">
        <Eye size={16} className="text-brand-300" />
        <h2 className="text-sm font-semibold text-white">Como o aluno ve</h2>
        <span className="ml-auto text-xs text-zinc-500">clique no cartaz para liberar</span>
      </div>

      {error && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-2.5 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-5 p-5">
        {modules.map((mod) => (
          <div key={mod.id}>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {mod.title}
            </h3>

            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
              {mod.lessons.map((lesson) => {
                counter += 1;
                const open = isOpen(lesson);
                const gradient = GRADIENTS[(lesson.id + counter) % GRADIENTS.length];
                const fixed = lesson.release_mode === 'free';

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => toggle(lesson)}
                    disabled={fixed || busyId === lesson.id}
                    title={
                      fixed
                        ? 'Aula sempre aberta'
                        : open
                          ? 'Clique para travar'
                          : 'Clique para liberar'
                    }
                    className={[
                      'group relative aspect-[2/3] w-[104px] shrink-0 overflow-hidden rounded-lg border text-left',
                      'transition-all duration-300 hover:scale-[1.06]',
                      open
                        ? 'border-brand-500/40'
                        : 'border-white/5 hover:border-brand-400/40',
                      fixed ? 'cursor-default' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    {lesson.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={lesson.thumbnail_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <span className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                        <span className="absolute inset-0 grid place-items-center text-3xl font-black text-white/15">
                          {String(counter).padStart(2, '0')}
                        </span>
                      </span>
                    )}

                    <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    {!open && <span className="absolute inset-0 bg-black/55 backdrop-grayscale" />}

                    <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-black/70 text-white/85 backdrop-blur">
                      {busyId === lesson.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : open ? (
                        <Unlock size={11} className="text-brand-300" />
                      ) : lesson.release_mode === 'scheduled' ? (
                        <CalendarClock size={11} />
                      ) : (
                        <Lock size={11} />
                      )}
                    </span>

                    {!lesson.thumbnail_url && (
                      <span className="absolute left-1.5 top-1.5 text-white/30">
                        <ImageIcon size={11} />
                      </span>
                    )}

                    {/* o titulo so e escrito quando a aula nao tem arte propria,
                        senao ele briga com o texto desenhado na capa */}
                    {!lesson.thumbnail_url && (
                      <span className="absolute inset-x-0 bottom-0 p-2">
                        <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-white">
                          {lesson.title}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}

              {!mod.lessons.length && (
                <p className="text-xs text-zinc-600">Nenhuma aula neste modulo.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
