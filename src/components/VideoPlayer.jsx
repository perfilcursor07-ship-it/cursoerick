'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Loader2, ThumbsDown, ThumbsUp, VideoOff } from 'lucide-react';

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
  feedback: feedbackInitial = null,
}) {
  const router = useRouter();
  const videoRef = useRef(null);
  const lastSent = useRef(0);
  const secondsRef = useRef(startAt);
  const loggingOut = useRef(false);

  const [completed, setCompleted] = useState(completedInitial);
  const [feedback, setFeedback] = useState(feedbackInitial);
  const [saving, setSaving] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  const send = useCallback(
    async (payload) => {
      if (loggingOut.current) return false;
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, ...payload }),
          keepalive: true,
        });
        if (response.status === 401) {
          if (!loggingOut.current) {
            loggingOut.current = true;
            router.replace('/login?next=' + encodeURIComponent(window.location.pathname));
          }
          return false;
        }
        return response.ok;
      } catch {
        return false;
      }
    },
    [slug, router]
  );

  useEffect(() => {
    const handleLogout = () => {
      loggingOut.current = true;
    };
    window.addEventListener('curso:logout', handleLogout);
    return () => window.removeEventListener('curso:logout', handleLogout);
  }, []);

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
    const saved = await send({ seconds: Math.floor(secondsRef.current), completed: true });
    if (saved) {
      setCompleted(true);
      router.refresh();
    }
  }

  async function toggleComplete() {
    setSaving(true);
    const saved = await send({ seconds: Math.floor(secondsRef.current), completed: true });
    if (saved) {
      setCompleted(true);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleFeedback(value) {
    setFeedbackSaving(true);
    const nextValue = feedback === value ? null : value;
    const saved = await send({ feedback: nextValue });
    if (saved) setFeedback(nextValue);
    setFeedbackSaving(false);
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-xs text-zinc-500">
          {videoType === 'upload'
            ? 'Seu progresso e salvo automaticamente.'
            : 'Marque como concluida ao terminar de assistir.'}
        </p>

        <button
          type="button"
          onClick={toggleComplete}
          disabled={completed || saving}
          className={completed ? 'btn-ghost btn-sm w-full sm:w-auto' : 'btn-primary btn-sm w-full sm:w-auto'}
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

      <div className="flex flex-col gap-3 rounded-2xl border border-ink-700 bg-ink-900/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-200">Esta aula foi útil para você?</p>
          <p className="mt-1 text-xs text-zinc-500">Seu feedback ajuda a melhorar o conteúdo.</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:shrink-0">
          <button
            type="button"
            onClick={() => handleFeedback('like')}
            disabled={feedbackSaving}
            aria-pressed={feedback === 'like'}
            className={feedback === 'like' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
          >
            <ThumbsUp size={14} />
            Gostei
          </button>
          <button
            type="button"
            onClick={() => handleFeedback('dislike')}
            disabled={feedbackSaving}
            aria-pressed={feedback === 'dislike'}
            className={feedback === 'dislike' ? 'btn-danger btn-sm' : 'btn-ghost btn-sm'}
          >
            <ThumbsDown size={14} />
            Não gostei
          </button>
        </div>
      </div>
    </div>
  );
}
