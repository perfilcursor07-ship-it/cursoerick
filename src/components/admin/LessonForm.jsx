'use client';

import { useState } from 'react';
import { CheckCircle2, ImageIcon, Link2, Loader2, Upload, X } from 'lucide-react';
import { api, uploadFile } from '@/lib/client';

const EMPTY = {
  title: '',
  description: '',
  video_type: 'upload',
  video_url: '',
  video_path: '',
  thumbnail_url: '',
  duration_seconds: 0,
  release_mode: 'manual',
  is_released: false,
  release_at: '',
};

/** Formulario de criacao/edicao de aula, com upload de video em streaming. */
export default function LessonForm({ moduleId, lesson, onDone, onCancel }) {
  const editing = Boolean(lesson);
  const [form, setForm] = useState(
    editing
      ? {
          ...EMPTY,
          ...lesson,
          description: lesson.description || '',
          video_url: lesson.video_url || '',
          video_path: lesson.video_path || '',
          thumbnail_url: lesson.thumbnail_url || '',
          release_at: lesson.release_at
            ? new Date(lesson.release_at).toISOString().slice(0, 16)
            : '',
        }
      : EMPTY
  );

  const [progress, setProgress] = useState(null);
  const [coverProgress, setCoverProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setProgress(0);
    try {
      const { video_path: path } = await uploadFile(file, setProgress, 'video');
      set('video_path', path);
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setProgress(null);
    }
  }

  async function handleCover(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setCoverProgress(0);
    try {
      const { url } = await uploadFile(file, setCoverProgress, 'cover');
      set('thumbnail_url', url);
      setCoverProgress(100);
    } catch (err) {
      setError(err.message);
      setCoverProgress(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    const payload = {
      module_id: moduleId,
      title: form.title,
      description: form.description,
      video_type: form.video_type,
      video_url: form.video_type === 'external' ? form.video_url : '',
      video_path: form.video_type === 'upload' ? form.video_path : '',
      thumbnail_url: form.thumbnail_url,
      duration_seconds: Number(form.duration_seconds) || 0,
      release_mode: form.release_mode,
      is_released: form.release_mode === 'free' ? true : Boolean(form.is_released),
      release_at: form.release_mode === 'scheduled' ? form.release_at || null : null,
      is_published: true,
    };

    try {
      if (editing) {
        await api(`/api/admin/lessons/${lesson.id}`, { method: 'PATCH', body: payload });
      } else {
        await api('/api/admin/lessons', { method: 'POST', body: payload });
      }
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t border-ink-700 bg-ink-900/60 p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">
          {editing ? 'Editar aula' : 'Nova aula'}
        </h4>
        <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-zinc-200">
          <X size={16} />
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="label">Titulo da aula</label>
        <input
          className="input"
          placeholder="Aula 02 - Montando sua estrutura"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </div>

      <div>
        <label className="label">Descricao</label>
        <textarea
          rows={3}
          className="input resize-y"
          placeholder="O que o aluno vai ver nesta aula"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      {/* origem do video */}
      <div>
        <label className="label">Video</label>
        <div className="mb-3 inline-flex rounded-xl border border-ink-600 bg-ink-900 p-1">
          <button
            type="button"
            onClick={() => set('video_type', 'upload')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              form.video_type === 'upload'
                ? 'bg-brand-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload size={13} /> Enviar arquivo
          </button>
          <button
            type="button"
            onClick={() => set('video_type', 'external')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              form.video_type === 'external'
                ? 'bg-brand-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Link2 size={13} /> Link externo
          </button>
        </div>

        {form.video_type === 'upload' ? (
          <div className="space-y-2">
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov,.m4v"
              onChange={handleFile}
              className="block w-full cursor-pointer rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm text-zinc-400
                         file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-1.5
                         file:text-xs file:font-semibold file:text-brand-200 hover:file:bg-brand-500/30"
            />

            {progress !== null && progress < 100 && (
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full bg-brand-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">Enviando... {progress}%</p>
              </div>
            )}

            {form.video_path && (
              <p className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                <CheckCircle2 size={13} />
                Arquivo salvo: {form.video_path}
              </p>
            )}
          </div>
        ) : (
          <input
            className="input"
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.video_url}
            onChange={(e) => set('video_url', e.target.value)}
          />
        )}
      </div>

      {/* capa (cartaz vertical) */}
      <div>
        <label className="label">Capa da aula</label>
        <p className="mb-2 text-xs text-zinc-600">
          Imagem vertical (proporcao 2:3, ex: 600x900). E ela que aparece no painel do aluno.
        </p>

        <div className="flex gap-4">
          <div className="h-32 w-[86px] shrink-0 overflow-hidden rounded-lg border border-ink-600 bg-ink-900">
            {form.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.thumbnail_url}
                alt="Capa da aula"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-zinc-700">
                <ImageIcon size={20} />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
              onChange={handleCover}
              className="block w-full cursor-pointer rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm text-zinc-400
                         file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-1.5
                         file:text-xs file:font-semibold file:text-brand-200 hover:file:bg-brand-500/30"
            />

            {coverProgress !== null && coverProgress < 100 && (
              <div className="h-2 overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${coverProgress}%` }}
                />
              </div>
            )}

            <input
              className="input"
              placeholder="ou cole o link de uma imagem"
              value={form.thumbnail_url}
              onChange={(e) => set('thumbnail_url', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Liberacao</label>
          <select
            className="input"
            value={form.release_mode}
            onChange={(e) => set('release_mode', e.target.value)}
          >
            <option value="free">Aberta para todos (aula de apresentacao)</option>
            <option value="manual">Manual - eu libero quando quiser</option>
            <option value="scheduled">Agendada por data</option>
          </select>
        </div>

        <div>
          <label className="label">Duracao (minutos)</label>
          <input
            type="number"
            min="0"
            className="input"
            placeholder="0"
            value={form.duration_seconds ? Math.round(form.duration_seconds / 60) : ''}
            onChange={(e) => set('duration_seconds', (Number(e.target.value) || 0) * 60)}
          />
        </div>
      </div>

      {form.release_mode === 'scheduled' && (
        <div>
          <label className="label">Liberar em</label>
          <input
            type="datetime-local"
            className="input"
            value={form.release_at}
            onChange={(e) => set('release_at', e.target.value)}
          />
        </div>
      )}

      {form.release_mode === 'manual' && (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={Boolean(form.is_released)}
            onChange={(e) => set('is_released', e.target.checked)}
            className="h-4 w-4 rounded border-ink-500 bg-ink-800 accent-brand-500"
          />
          Ja liberar esta aula para os alunos
        </label>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={busy} className="btn-primary btn-sm">
          {busy && <Loader2 size={14} className="animate-spin" />}
          {editing ? 'Salvar alteracoes' : 'Criar aula'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost btn-sm">
          Cancelar
        </button>
      </div>
    </form>
  );
}
