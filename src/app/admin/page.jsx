import Link from 'next/link';
import { BookOpen, GraduationCap, Lock, Unlock, UserPlus, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Visao geral' };
export const dynamic = 'force-dynamic';

async function loadStats() {
  const [students, blocked, courses, lessons, released, newThisWeek, latest, topCourses] =
    await Promise.all([
      db('users').where({ role: 'student' }).count({ c: '*' }).first(),
      db('users').where({ role: 'student', status: 'blocked' }).count({ c: '*' }).first(),
      db('courses').count({ c: '*' }).first(),
      db('lessons').count({ c: '*' }).first(),
      db('lessons')
        .where((qb) => qb.where('release_mode', 'free').orWhere('is_released', true))
        .count({ c: '*' })
        .first(),
      db('users')
        .where({ role: 'student' })
        .where('created_at', '>=', db.raw('DATE_SUB(NOW(), INTERVAL 7 DAY)'))
        .count({ c: '*' })
        .first(),
      db('users')
        .where({ role: 'student' })
        .orderBy('created_at', 'desc')
        .limit(8)
        .select('id', 'name', 'email', 'phone', 'status', 'created_at'),
      db('courses')
        .leftJoin('modules', 'modules.course_id', 'courses.id')
        .leftJoin('lessons', 'lessons.module_id', 'modules.id')
        .groupBy('courses.id')
        .orderBy('courses.position')
        .select('courses.id', 'courses.title', 'courses.slug', 'courses.is_published')
        .count({ lessons: 'lessons.id' }),
    ]);

  return {
    students: Number(students?.c || 0),
    blocked: Number(blocked?.c || 0),
    courses: Number(courses?.c || 0),
    lessons: Number(lessons?.c || 0),
    released: Number(released?.c || 0),
    newThisWeek: Number(newThisWeek?.c || 0),
    latest,
    topCourses,
  };
}

function Stat({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const tones = {
    brand: 'border-brand-500/30 bg-brand-500/10 text-brand-300',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    gray: 'border-ink-600 bg-ink-800 text-zinc-400',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl border ${tones[tone]}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className="mt-4 text-3xl font-bold leading-none text-white">{value}</div>
      <div className="mt-1.5 text-sm text-zinc-400">{label}</div>
      {hint && <div className="mt-1 text-xs text-zinc-600">{hint}</div>}
    </div>
  );
}

export default async function AdminHome() {
  const stats = await loadStats();

  return (
    <main className="container-page space-y-8 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Visao geral</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Acompanhe os alunos e controle a liberacao das aulas.
          </p>
        </div>
        <Link href="/admin/cursos" className="btn-primary shrink-0">
          Gerenciar aulas
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Users}
          label="Alunos cadastrados"
          value={stats.students}
          hint={stats.blocked ? `${stats.blocked} bloqueado(s)` : 'nenhum bloqueado'}
        />
        <Stat
          icon={UserPlus}
          label="Novos nos ultimos 7 dias"
          value={stats.newThisWeek}
          tone="green"
        />
        <Stat
          icon={Unlock}
          label="Aulas liberadas"
          value={stats.released}
          hint={`de ${stats.lessons} aulas no total`}
        />
        <Stat
          icon={Lock}
          label="Aulas bloqueadas"
          value={Math.max(0, stats.lessons - stats.released)}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ultimos cadastros */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4">
            <h2 className="font-semibold text-white">Ultimos cadastros</h2>
            <Link href="/admin/alunos" className="text-xs font-semibold text-brand-300">
              ver todos
            </Link>
          </div>

          {stats.latest.length ? (
            <div className="divide-y divide-ink-700/70">
              {stats.latest.map((student) => (
                <div key={student.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-700 text-xs font-bold text-zinc-300">
                    {student.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">{student.name}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {student.email} - {student.phone}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-zinc-500">{formatDate(student.created_at)}</p>
                    {student.status === 'blocked' && (
                      <span className="badge-locked mt-1">bloqueado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              Nenhum aluno cadastrado ainda.
            </p>
          )}
        </section>

        {/* cursos */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4">
            <h2 className="font-semibold text-white">Cursos</h2>
            <Link href="/admin/cursos" className="text-xs font-semibold text-brand-300">
              gerenciar
            </Link>
          </div>

          {stats.topCourses.length ? (
            <div className="divide-y divide-ink-700/70">
              {stats.topCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/admin/cursos/${course.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-ink-800/40"
                >
                  <BookOpen size={16} className="shrink-0 text-brand-300" />
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-100">
                    {course.title}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">{course.lessons} aulas</span>
                  {course.is_published ? (
                    <span className="badge-open shrink-0">no ar</span>
                  ) : (
                    <span className="badge-locked shrink-0">rascunho</span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <GraduationCap size={30} className="mx-auto text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-500">Crie seu primeiro curso.</p>
              <Link href="/admin/cursos" className="btn-primary btn-sm mt-4">
                Criar curso
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
