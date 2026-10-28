import Link from 'next/link';
import { BookOpen, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { getCourseTree } from '@/lib/access';
import CourseHero from '@/components/CourseHero';
import LessonRow from '@/components/LessonRow';

export const metadata = { title: 'Minhas aulas' };
export const dynamic = 'force-dynamic';

/** Cursos que o aluno pode acessar (matriculados + publicos com auto_enroll). */
async function myCourses(user) {
  if (user.role === 'admin') {
    return db('courses').orderBy([{ column: 'position' }, { column: 'id' }]);
  }

  return db('courses')
    .leftJoin('enrollments', function joinEnrollments() {
      this.on('enrollments.course_id', 'courses.id').andOn(
        'enrollments.user_id',
        db.raw('?', [user.id])
      );
    })
    .where('courses.is_published', true)
    .where((qb) => qb.whereNotNull('enrollments.id').orWhere('courses.auto_enroll', true))
    .orderBy([{ column: 'courses.position' }, { column: 'courses.id' }])
    .select('courses.*');
}

function Stat({ icon: Icon, label, value, tone = 'gray' }) {
  const tones = {
    brand: 'bg-brand-300/10 text-brand-200',
    green: 'bg-emerald-400/10 text-emerald-300',
    gray: 'bg-white/5 text-zinc-300',
  };

  return (
    <article className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-ink-850/90 to-ink-900/70 p-4 shadow-card transition hover:border-amber-300/20">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon size={18} />
      </span>
      <div className="mt-5 text-3xl font-bold leading-none tracking-tight text-white">{value}</div>
      <div className="mt-2 truncate text-xs font-medium text-zinc-500">{label}</div>
    </article>
  );
}

export default async function PainelPage({ searchParams }) {
  const user = await currentUser();
  const courses = await myCourses(user);

  if (!courses.length) {
    return (
      <main className="container-page py-16">
        <div className="card p-10 text-center">
          <BookOpen size={36} className="mx-auto text-zinc-600" />
          <h1 className="mt-4 text-xl font-bold text-white">Nenhum curso disponivel ainda</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Assim que o conteudo for publicado ele aparece aqui. Fique de olho no seu e-mail.
          </p>
        </div>
      </main>
    );
  }

  const selectedSlug = searchParams?.curso || courses[0].slug;
  const data = await getCourseTree(selectedSlug, user);

  if (!data) {
    return (
      <main className="container-page py-16">
        <div className="card p-10 text-center text-sm text-zinc-400">Curso nao encontrado.</div>
      </main>
    );
  }

  const { course, modules, stats } = data;

  // numeracao continua das aulas entre os modulos
  let counter = 0;
  const rows = modules.map((mod) => {
    const startIndex = counter + 1;
    counter += mod.lessons.length;
    return { ...mod, startIndex };
  });

  return (
    <main className="pb-20">
      <CourseHero
        course={course}
        stats={stats}
        firstName={user.name.split(/\s+/)[0]}
      />

      {/* troca de curso */}
      {courses.length > 1 && (
        <div className="container-page flex flex-wrap gap-2 pt-6">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/painel?curso=${c.slug}`}
              className={[
                'rounded-full border px-4 py-2 text-xs font-semibold transition',
                c.slug === course.slug
                ? 'border-brand-300/35 bg-brand-300/10 text-brand-200'
                  : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white',
              ].join(' ')}
            >
              {c.title}
            </Link>
          ))}
        </div>
      )}

      {/* prateleiras de aulas */}
      <div className="mt-8 space-y-4">
        {rows.map((mod) =>
          mod.lessons.length ? (
            <LessonRow
              key={mod.id}
              title={mod.title}
              subtitle={mod.description}
              lessons={mod.lessons}
              startIndex={mod.startIndex}
            />
          ) : null
        )}
      </div>

      {!stats.totalLessons && (
        <div className="container-page">
          <div className="card p-10 text-center text-sm text-zinc-400">
            As aulas deste curso ainda nao foram publicadas.
          </div>
        </div>
      )}

      {/* resumo do progresso */}
      <section className="container-page mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">
              Sua evolução
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-white">Resumo do curso</h2>
          </div>
          <p className="hidden text-xs text-zinc-500 sm:block">Continue no seu ritmo</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={BookOpen} label="Aulas no curso" value={stats.totalLessons} />
          <Stat
            icon={Unlock}
            label="Liberadas para voce"
            value={stats.totalUnlocked}
            tone="brand"
          />
          <Stat
            icon={CheckCircle2}
            label="Aulas concluidas"
            value={stats.totalCompleted}
            tone="green"
          />
          <Stat
            icon={Lock}
            label="Ainda bloqueadas"
            value={stats.totalLessons - stats.totalUnlocked}
          />
        </div>
      </section>
    </main>
  );
}
