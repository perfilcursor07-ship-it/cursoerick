'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, Loader2, Plus, Settings2, Trash2 } from 'lucide-react';
import { api } from '@/lib/client';

export default function CoursesManager({ courses }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', subtitle: '', description: '' });

  async function createCourse(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { id } = await api('/api/admin/courses', {
        method: 'POST',
        body: { ...form, is_published: false, auto_enroll: true },
      });
      router.push(`/admin/cursos/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(course) {
    setBusy(true);
    try {
      await api(`/api/admin/courses/${course.id}`, {
        method: 'PATCH',
        body: { is_published: !course.is_published },
      });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeCourse(course) {
    if (
      !window.confirm(
        `Excluir "${course.title}"? Todos os modulos e aulas deste curso serao apagados.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await api(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {courses.length} curso(s)
        </h2>
        <button type="button" onClick={() => setCreating((v) => !v)} className="btn-primary btn-sm">
          <Plus size={14} />
          Novo curso
        </button>
      </div>

      {creating && (
        <form onSubmit={createCourse} className="card space-y-4 p-5">
          <div>
            <label className="label" htmlFor="course-title">
              Titulo do curso
            </label>
            <input
              id="course-title"
              className="input"
              placeholder="Formacao Completa"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="course-subtitle">
              Subtitulo
            </label>
            <input
              id="course-subtitle"
              className="input"
              placeholder="Do basico ao avancado"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="course-description">
              Descricao
            </label>
            <textarea
              id="course-description"
              rows={3}
              className="input resize-y"
              placeholder="O que o aluno vai aprender"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary btn-sm">
              {busy && <Loader2 size={14} className="animate-spin" />}
              Criar curso
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="btn-ghost btn-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={34} className="mx-auto text-zinc-600" />
          <p className="mt-4 text-sm text-zinc-400">
            Nenhum curso criado. Comece criando o curso principal.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="card flex flex-col overflow-hidden">
              <div className="h-28 w-full bg-ink-900">
                {course.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.cover_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-brand-800/60 via-ink-850 to-black" />
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">{course.title}</h3>
                  {course.subtitle && (
                    <p className="mt-1 truncate text-xs text-zinc-500">{course.subtitle}</p>
                  )}
                </div>
                {course.is_published ? (
                  <span className="badge-open shrink-0">no ar</span>
                ) : (
                  <span className="badge-locked shrink-0">rascunho</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
                <span>{course.modulesCount} modulos</span>
                <span>{course.lessonsCount} aulas</span>
                <span>{course.releasedCount} liberadas</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/admin/cursos/${course.id}`} className="btn-primary btn-sm">
                  <Settings2 size={14} />
                  Aulas
                </Link>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => togglePublish(course)}
                  className="btn-ghost btn-sm"
                >
                  {course.is_published ? 'Despublicar' : 'Publicar'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeCourse(course)}
                  className="btn-danger btn-sm ml-auto"
                  title="Excluir curso"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
