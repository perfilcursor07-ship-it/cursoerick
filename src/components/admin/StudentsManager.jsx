'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Loader2,
  Lock,
  Search,
  ShieldBan,
  ShieldCheck,
  Trash2,
  Unlock,
} from 'lucide-react';
import { api } from '@/lib/client';
import { formatDate } from '@/lib/utils';

export default function StudentsManager({ students, lessons }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.phone.toLowerCase().includes(term)
    );
  }, [students, query]);

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

  const toggleStatus = (student) =>
    run(() =>
      api(`/api/admin/students/${student.id}`, {
        method: 'PATCH',
        body: { status: student.status === 'active' ? 'blocked' : 'active' },
      })
    );

  const removeStudent = (student) => {
    if (!window.confirm(`Excluir o aluno ${student.name}? Esta acao nao pode ser desfeita.`)) return;
    run(() => api(`/api/admin/students/${student.id}`, { method: 'DELETE' }));
  };

  const toggleAccess = (student, lessonId, granted) =>
    run(() =>
      api(`/api/admin/students/${student.id}/access`, {
        method: 'POST',
        body: { lesson_id: lessonId, granted },
      })
    );

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          className="input pl-11"
          placeholder="Buscar por nome, e-mail ou telefone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="hidden items-center gap-4 border-b border-ink-700 bg-ink-800/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 md:flex">
          <span className="flex-1">Aluno</span>
          <span className="w-32">Telefone</span>
          <span className="w-24">Cadastro</span>
          <span className="w-20 text-center">Aulas</span>
          <span className="w-[200px] text-right">Acoes</span>
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-zinc-500">
            {students.length ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado ainda.'}
          </p>
        ) : (
          <div className="divide-y divide-ink-700/70">
            {filtered.map((student) => (
              <div key={student.id}>
                <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-100">{student.name}</p>
                      {student.status === 'blocked' && (
                        <span className="badge-locked shrink-0">bloqueado</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-zinc-500">{student.email}</p>
                  </div>

                  <span className="w-32 shrink-0 text-xs text-zinc-400">{student.phone}</span>
                  <span className="w-24 shrink-0 text-xs text-zinc-500">
                    {formatDate(student.created_at)}
                  </span>
                  <span className="w-20 shrink-0 text-center text-xs text-zinc-400">
                    {student.completedCount}/{lessons.length}
                  </span>

                  <div className="flex w-[200px] shrink-0 justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(open === student.id ? null : student.id)}
                      className="btn-ghost btn-sm"
                      title="Liberar aulas individualmente"
                    >
                      Aulas
                      <ChevronDown
                        size={13}
                        className={open === student.id ? 'rotate-180 transition' : 'transition'}
                      />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleStatus(student)}
                      className="btn-ghost btn-sm"
                      title={student.status === 'active' ? 'Bloquear acesso' : 'Reativar acesso'}
                    >
                      {student.status === 'active' ? (
                        <ShieldBan size={13} />
                      ) : (
                        <ShieldCheck size={13} className="text-emerald-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeStudent(student)}
                      className="btn-danger btn-sm"
                      title="Excluir aluno"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* liberacao individual */}
                {open === student.id && (
                  <div className="border-t border-ink-700 bg-ink-900/60 px-5 py-4">
                    <p className="mb-3 text-xs text-zinc-500">
                      Libere uma aula apenas para <strong className="text-zinc-300">
                        {student.name.split(/\s+/)[0]}
                      </strong>
                      , antes da liberacao geral.
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {lessons.map((lesson) => {
                        const granted = student.grantedLessonIds.includes(lesson.id);
                        const alreadyOpen = lesson.openForAll;

                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-zinc-200">
                                {lesson.title}
                              </p>
                              <p className="truncate text-[11px] text-zinc-500">
                                {lesson.moduleTitle}
                              </p>
                            </div>

                            {alreadyOpen ? (
                              <span className="badge-open shrink-0">aberta</span>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => toggleAccess(student, lesson.id, !granted)}
                                className={granted ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'}
                              >
                                {busy ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : granted ? (
                                  <Unlock size={12} />
                                ) : (
                                  <Lock size={12} />
                                )}
                                {granted ? 'liberada' : 'liberar'}
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {!lessons.length && (
                        <p className="text-xs text-zinc-500">Nenhuma aula cadastrada.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
