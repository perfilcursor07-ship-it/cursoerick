import { BookOpen } from 'lucide-react';
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
  const rows = modules.map((mod, moduleIndex) => {
    const startIndex = counter + 1;
    counter += mod.lessons.length;
    return { ...mod, startIndex, tone: moduleIndex };
  });

  // proximas aulas que aparecem em destaque no banner
  const flat = rows.flatMap((mod) =>
    mod.lessons.map((lesson, i) => ({ lesson, index: mod.startIndex + i, tone: mod.tone }))
  );
  const nextPos = Math.max(0, flat.findIndex((f) => f.lesson.id === stats.nextLesson?.id));
  const featured = flat.slice(nextPos, nextPos + 3);

  return (
    <main className="pb-16">
      <CourseHero
        course={course}
        stats={stats}
        firstName={user.name.split(/\s+/)[0]}
        featured={featured}
        moduleCount={rows.filter((mod) => mod.lessons.length).length}
        courses={courses}
      />

      {/* prateleiras de aulas (sobem por cima do banner, como no streaming) */}
      <div id="aulas" className="relative z-10 -mt-24 space-y-4 sm:space-y-8">
        {rows.map((mod) =>
          mod.lessons.length ? (
            <LessonRow
              key={mod.id}
              title={mod.title}
              subtitle={mod.description}
              lessons={mod.lessons}
              startIndex={mod.startIndex}
              tone={mod.tone}
            />
          ) : null
        )}

        {!stats.totalLessons && (
          <div className="container-page">
            <div className="card p-10 text-center text-sm text-zinc-400">
              As aulas deste curso ainda nao foram publicadas.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
