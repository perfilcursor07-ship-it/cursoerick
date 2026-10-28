import { db } from '@/lib/db';
import { isGloballyReleased } from '@/lib/access';
import StudentsManager from '@/components/admin/StudentsManager';

export const metadata = { title: 'Alunos' };
export const dynamic = 'force-dynamic';

async function loadData() {
  const students = await db('users')
    .where({ role: 'student' })
    .orderBy('created_at', 'desc')
    .select('id', 'name', 'email', 'phone', 'status', 'created_at');

  const lessonRows = await db('lessons')
    .join('modules', 'modules.id', 'lessons.module_id')
    .join('courses', 'courses.id', 'modules.course_id')
    .orderBy([
      { column: 'courses.position' },
      { column: 'modules.position' },
      { column: 'lessons.position' },
      { column: 'lessons.id' },
    ])
    .select(
      'lessons.id',
      'lessons.title',
      'lessons.release_mode',
      'lessons.is_released',
      'lessons.release_at',
      'modules.title as moduleTitle'
    );

  const lessons = lessonRows.map((l) => ({
    id: l.id,
    title: l.title,
    moduleTitle: l.moduleTitle,
    openForAll: isGloballyReleased(l),
  }));

  const ids = students.map((s) => s.id);
  const [grants, completed] = ids.length
    ? await Promise.all([
        db('lesson_access').whereIn('user_id', ids).select('user_id', 'lesson_id'),
        db('lesson_progress')
          .whereIn('user_id', ids)
          .where({ completed: true })
          .select('user_id')
          .count({ c: '*' })
          .groupBy('user_id'),
      ])
    : [[], []];

  const completedMap = new Map(completed.map((row) => [row.user_id, Number(row.c)]));

  return {
    lessons,
    students: students.map((student) => ({
      ...student,
      created_at: student.created_at ? String(student.created_at) : null,
      completedCount: completedMap.get(student.id) || 0,
      grantedLessonIds: grants.filter((g) => g.user_id === student.id).map((g) => g.lesson_id),
    })),
  };
}

export default async function AdminStudentsPage() {
  const { students, lessons } = await loadData();

  return (
    <main className="container-page space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Alunos</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {students.length} aluno(s) cadastrado(s). Aqui voce bloqueia acessos e libera aulas
          individualmente.
        </p>
      </div>

      <StudentsManager students={students} lessons={lessons} />
    </main>
  );
}
