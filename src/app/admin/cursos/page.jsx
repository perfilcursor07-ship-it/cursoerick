import { db } from '@/lib/db';
import CoursesManager from '@/components/admin/CoursesManager';

export const metadata = { title: 'Cursos e aulas' };
export const dynamic = 'force-dynamic';

async function loadCourses() {
  const courses = await db('courses').orderBy([{ column: 'position' }, { column: 'id' }]);
  if (!courses.length) return [];

  const ids = courses.map((c) => c.id);

  const [modules, lessons] = await Promise.all([
    db('modules').whereIn('course_id', ids).select('id', 'course_id'),
    db('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .whereIn('modules.course_id', ids)
      .select('modules.course_id', 'lessons.release_mode', 'lessons.is_released'),
  ]);

  return courses.map((course) => {
    const courseLessons = lessons.filter((l) => l.course_id === course.id);
    return {
      ...course,
      modulesCount: modules.filter((m) => m.course_id === course.id).length,
      lessonsCount: courseLessons.length,
      releasedCount: courseLessons.filter(
        (l) => l.release_mode === 'free' || l.is_released
      ).length,
    };
  });
}

export default async function AdminCoursesPage() {
  const courses = await loadCourses();

  return (
    <main className="container-page space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Cursos e aulas</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Crie os modulos, envie os videos e libere as aulas quando quiser.
        </p>
      </div>

      <CoursesManager courses={courses} />
    </main>
  );
}
