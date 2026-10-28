'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ImageIcon, Loader2, Save } from 'lucide-react';
import { api, uploadFile } from '@/lib/client';

/**
 * Aparencia do curso: titulo, subtitulo e a arte do banner que abre o painel
 * do aluno (a faixa grande no topo, estilo Netflix).
 */
export default function CourseBannerForm({ course, onClose }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: course.title || '',
    subtitle: course.subtitle || '',
    cover_url: course.cover_url || '',
  });
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleCover(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setProgress(0);
    try {
      const { url } = await uploadFile(file, setProgress, 'cover');
      set('cover_url', url);
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setProgress(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(`/api/admin/courses/${course.id}`, { method: 'PATCH', body: form });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Titulo do curso</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Subtitulo</label>
          <input
            className="input"
            placeholder="Do basico ao avancado"
            value={form.subtitle}
            onChange={(e) => set('subtitle', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Banner do painel</label>
        <p className="mb-3 text-xs text-zinc-600">
          Imagem larga (proporcao 16:6, ex: 1920x720). Aparece no topo do painel do aluno.
        </p>

        <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-900">
          {form.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.cover_url}
              alt="Banner do curso"
              className="h-40 w-full object-cover"
            />
          ) : (
            <div className="grid h-40 place-items-center text-zinc-700">
              <ImageIcon size={26} />
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
            onChange={handleCover}
            className="block w-full cursor-pointer rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm text-zinc-400
                       file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-1.5
                       file:text-xs file:font-semibold file:text-brand-200 hover:file:bg-brand-500/30"
          />

          {progress !== null && progress < 100 && (
            <div className="h-2 overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full bg-brand-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <input
            className="input"
            placeholder="ou cole o link de uma imagem"
            value={form.cover_url}
            onChange={(e) => set('cover_url', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary btn-sm">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Salvar
        </button>
        <button type="button" onClick={onClose} className="btn-ghost btn-sm">
          Fechar
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 size={15} /> Salvo
          </span>
        )}
      </div>
    </form>
  );
}
