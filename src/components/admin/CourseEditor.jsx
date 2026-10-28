'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CalendarClock,
  Film,
  ImageIcon,
  Link2,
  Loader2,
  Lock,
  Palette,
  Pencil,
  Plus,
  Trash2,
  Unlock,
} from 'lucide-react';
import { api } from '@/lib/client';
import { formatDateTime } from '@/lib/utils';
import AdminShelf from './AdminShelf';
import CourseBannerForm from './CourseBannerForm';
import LessonForm from './LessonForm';

export default function CourseEditor({ course, modules }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [newModule, setNewModule] = useState('');
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [lessonFormFor, setLessonFormFor] = useState(null); // id do modulo
  const [editingLesson, setEditingLesson] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const toggleCourse = (patch) =>
    run(() => api(`/api/admin/courses/${course.id}`, { method: 'PATCH', body: patch }));

  const toggleRelease = (lesson) =>
    run(() =>
      api(`/api/admin/lessons/${lesson.id}/release`, {
        method: 'POST',
        body: { released: !isOpen(lesson) },
      })
    );

  const removeLesson = (lesson) => {
    if (!window.confirm(`Excluir a aula "${lesson.title}"?`)) return;
    run(() => api(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' }));
  };

  const removeModule = (mod) => {
    if (!window.confirm(`Excluir o modulo "${mod.title}" e todas as suas aulas?`)) return;
    run(() => api(`/api/admin/modules/${mod.id}`, { method: 'DELETE' }));
  };

  async function createModule(event) {
    event.preventDefault();
    if (!newModule.trim()) return;
    await run(() =>
      api('/api/admin/modules', {
        method: 'POST',
        body: { course_id: course.id, title: newModule.trim() },
      })
    );
    setNewModule('');
    setShowModuleForm(false);
  }

  function isOpen(lesson) {
    if (lesson.release_mode === 'free') return true;
    if (lesson.release_mode === 'manual') return Boolean(lesson.is_released);
    return Boolean(lesson.release_at) && new Date(lesson.release_at) <= new Date();
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const openLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => isOpen(l)).length,
    0
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* configuracoes do curso */}
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-semibold text-white">{course.title}</h2>
            {course.is_published ? (
              <span className="badge-open">no ar</span>
            ) : (
              <span className="badge-locked">rascunho</span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {totalLessons} aulas - {openLessons} liberadas - {totalLessons - openLessons} com
            cadeado
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={Boolean(course.sequential)}
            disabled={busy}
            onChange={(e) => toggleCourse({ sequential: e.target.checked })}
            className="h-4 w-4 rounded border-ink-500 bg-ink-800 accent-brand-500"
          />
          Exigir conclusao da aula anterior
        </label>

        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          className="btn-ghost btn-sm"
        >
          <Palette size={13} />
          Aparencia
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => toggleCourse({ is_published: !course.is_published })}
          className="btn-ghost btn-sm"
        >
          {course.is_published ? 'Despublicar' : 'Publicar curso'}
        </button>
      </div>

      {showSettings && (
        <CourseBannerForm course={course} onClose={() => setShowSettings(false)} />
      )}

      {totalLessons > 0 && <AdminShelf modules={modules} />}

      {/* modulos */}
      <div className="space-y-5">
        {modules.map((mod, mi) => (
          <section key={mod.id} className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-ink-700 bg-ink-800/40 px-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-sm font-bold text-brand-300">
                {mi + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-white">{mod.title}</h3>
                <p className="text-xs text-zinc-500">{mod.lessons.length} aulas</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingLesson(null);
                  setLessonFormFor(lessonFormFor === mod.id ? null : mod.id);
                }}
                className="btn-primary btn-sm"
              >
                <Plus size={13} /> Aula
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => removeModule(mod)}
                className="btn-danger btn-sm"
                title="Excluir modulo"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="divide-y divide-ink-700/70">
              {mod.lessons.map((lesson, li) => {
                const open = isOpen(lesson);

                if (editingLesson?.id === lesson.id) {
                  return (
                    <LessonForm
                      key={lesson.id}
                      moduleId={mod.id}
                      lesson={lesson}
                      onDone={() => {
                        setEditingLesson(null);
                        router.refresh();
                      }}
                      onCancel={() => setEditingLesson(null)}
                    />
                  );
                }

                return (
                  <div key={lesson.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="w-6 shrink-0 text-center text-xs font-bold text-zinc-600">
                      {String(li + 1).padStart(2, '0')}
                    </span>

                    <span className="h-14 w-[38px] shrink-0 overflow-hidden rounded-md border border-ink-600 bg-ink-900">
                      {lesson.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={lesson.thumbnail_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="grid h-full place-items-center text-zinc-700">
                          <ImageIcon size={14} />
                        </span>
                      )}
                    </span>

                    <span className="shrink-0 text-zinc-600">
                      {lesson.video_type === 'upload' ? <Film size={14} /> : <Link2 size={14} />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">{lesson.title}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {lesson.release_mode === 'free'
                          ? 'aula aberta para todos'
                          : lesson.release_mode === 'scheduled'
                            ? `agendada para ${formatDateTime(lesson.release_at)}`
                            : open
                              ? 'liberada manualmente'
                              : 'aguardando liberacao'}
                        {lesson.video_type === 'upload' && !lesson.video_path && ' - sem video'}
                        {lesson.video_type === 'external' && !lesson.video_url && ' - sem link'}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {lesson.release_mode === 'scheduled' && !open && (
                        <span className="badge-soon hidden sm:inline-flex">
                          <CalendarClock size={11} /> agendada
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={busy || lesson.release_mode === 'free'}
                        onClick={() => toggleRelease(lesson)}
                        className={open ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'}
                        title={
                          lesson.release_mode === 'free'
                            ? 'Aula sempre aberta'
                            : open
                              ? 'Travar novamente'
                              : 'Liberar para todos os alunos'
                        }
                      >
                        {busy ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : open ? (
                          <Unlock size={13} />
                        ) : (
                          <Lock size={13} />
                        )}
                        <span className="hidden sm:inline">{open ? 'Liberada' : 'Liberar'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLessonFormFor(null);
                          setEditingLesson(lesson);
                        }}
                        className="btn-ghost btn-sm"
                        title="Editar aula"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeLesson(lesson)}
                        className="btn-danger btn-sm"
                        title="Excluir aula"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {!mod.lessons.length && !lessonFormFor && (
                <p className="px-5 py-6 text-center text-sm text-zinc-500">
                  Nenhuma aula neste modulo. Clique em &quot;Aula&quot; para adicionar.
                </p>
              )}

              {lessonFormFor === mod.id && (
                <LessonForm
                  moduleId={mod.id}
                  onDone={() => {
                    setLessonFormFor(null);
                    router.refresh();
                  }}
                  onCancel={() => setLessonFormFor(null)}
                />
              )}
            </div>
          </section>
        ))}
      </div>

      {/* novo modulo */}
      {showModuleForm ? (
        <form onSubmit={createModule} className="card flex flex-wrap gap-3 p-5">
          <input
            className="input flex-1"
            placeholder="Nome do modulo (ex: Modulo 4 - Bonus)"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
          />
          <button type="submit" disabled={busy} className="btn-primary btn-sm">
            {busy && <Loader2 size={14} className="animate-spin" />}
            Criar modulo
          </button>
          <button
            type="button"
            onClick={() => setShowModuleForm(false)}
            className="btn-ghost btn-sm"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setShowModuleForm(true)} className="btn-ghost w-full">
          <Plus size={15} /> Adicionar modulo
        </button>
      )}
    </div>
  );
}
