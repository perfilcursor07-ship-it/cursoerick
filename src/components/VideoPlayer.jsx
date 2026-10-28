'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Loader2, VideoOff } from 'lucide-react';

/**
 * Player da aula.
 *  - video_type "upload"   -> <video> apontando para a rota protegida /api/video/[slug]
 *  - video_type "external" -> iframe do YouTube/Vimeo
 *
 * O progresso e enviado a cada 15 segundos e ao sair da pagina.
 */
export default function VideoPlayer({
  slug,
  videoType,
  src,
  startAt = 0,
  completed: completedInitial = false,
}) {
  const router = useRouter();
  const videoRef = useRef(null);
  const lastSent = useRef(0);
  const secondsRef = useRef(startAt);

  const [completed, setCompleted] = useState(completedInitial);
  const [saving, setSaving] = useState(false);

  const send = useCallback(
    async (payload) => {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, ...payload }),
          keepalive: true,
        });
      } catch {
        /* progresso e best-effort: nao atrapalha a aula */
      }
    },
    [slug]
  );

  // retoma de onde parou
  useEffect(() => {
    const el = videoRef.current;
    if (el && startAt > 5) {
      const resume = () => {
        el.currentTime = startAt;
      };
      el.addEventListener('loadedmetadata', resume, { once: true });
      return () => el.removeEventListener('loadedmetadata', resume);
    }
    return undefined;
  }, [startAt]);

  // salva ao sair da pagina
  useEffect(() => {
    return () => {
      if (secondsRef.current > lastSent.current) {
        send({ seconds: Math.floor(secondsRef.current) });
      }
    };
  }, [send]);

  function handleTimeUpdate(event) {
    const seconds = event.target.currentTime;
    secondsRef.current = seconds;
    if (seconds - lastSent.current >= 15) {
      lastSent.current = seconds;
      send({ seconds: Math.floor(seconds) });
    }
  }

  async function handleEnded() {
    setCompleted(true);
    await send({ seconds: Math.floor(secondsRef.current), completed: true });
    router.refresh();
  }

  async function toggleComplete() {
    setSaving(true);
    setCompleted(true);
    await send({ seconds: Math.floor(secondsRef.current), completed: true });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-ink-700 bg-black shadow-card">
        {!src ? (
          <div className="grid aspect-video place-items-center bg-ink-900 text-center">
            <div>
              <VideoOff size={40} className="mx-auto text-zinc-600" />
              <p className="mt-3 text-sm font-semibold text-zinc-400">
                O video desta aula ainda nao foi enviado
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                O administrador precisa anexar o arquivo ou o link.
              </p>
            </div>
          </div>
        ) : videoType === 'upload' ? (
          <video
            ref={videoRef}
            src={src}
            controls
            controlsList="nodownload"
            onContextMenu={(event) => event.preventDefault()}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="aspect-video w-full bg-black"
            preload="metadata"
            playsInline
          />
        ) : (
          <iframe
            src={src}
            title="Aula"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="aspect-video w-full border-0"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">
          {videoType === 'upload'
            ? 'Seu progresso e salvo automaticamente.'
            : 'Marque como concluida ao terminar de assistir.'}
        </p>

        <button
          type="button"
          onClick={toggleComplete}
          disabled={completed || saving}
          className={completed ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : completed ? (
            <CheckCircle2 size={14} className="text-emerald-400" />
          ) : (
            <Circle size={14} />
          )}
          {completed ? 'Aula concluida' : 'Marcar como concluida'}
        </button>
      </div>
    </div>
  );
}
