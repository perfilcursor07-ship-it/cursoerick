import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import CourseEditor from '@/components/admin/CourseEditor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const course = await db('courses').where({ id: params.id }).first();
  return { title: course?.title || 'Curso' };
}

export default async function AdminCoursePage({ params }) {
  const course = await db('courses').where({ id: params.id }).first();
  if (!course) notFound();

  const modules = await db('modules')
    .where({ course_id: course.id })
    .orderBy([{ column: 'position' }, { column: 'id' }]);

  const ids = modules.map((m) => m.id);
  const lessons = ids.length
    ? await db('lessons')
        .whereIn('module_id', ids)
        .orderBy([{ column: 'module_id' }, { column: 'position' }, { column: 'id' }])
    : [];

  const tree = modules.map((mod) => ({
    ...mod,
    lessons: lessons
      .filter((l) => l.module_id === mod.id)
      .map((l) => ({
        ...l,
        created_at: l.created_at ? String(l.created_at) : null,
        updated_at: l.updated_at ? String(l.updated_at) : null,
        release_at: l.release_at ? String(l.release_at) : null,
      })),
  }));

  return (
    <main className="container-page space-y-8 py-10">
      <div>
        <Link href="/admin/cursos" className="link-muted inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Todos os cursos
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">{course.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Monte os modulos, envie os videos e use o botao de liberar para soltar cada aula.
        </p>
      </div>

      <CourseEditor
        course={{
          id: course.id,
          title: course.title,
          subtitle: course.subtitle || '',
          cover_url: course.cover_url || '',
          is_published: Boolean(course.is_published),
          sequential: Boolean(course.sequential),
        }}
        modules={tree}
      />
    </main>
  );
}
