import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarClock, Lock } from 'lucide-react';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { getLessonForUser } from '@/lib/access';
import { formatDateTime, toEmbedUrl } from '@/lib/utils';
import VideoPlayer from '@/components/VideoPlayer';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const lesson = await db('lessons').where({ slug: params.slug }).first();
  return { title: lesson?.title || 'Aula' };
}

/** Aula anterior e proxima dentro do mesmo curso. */
async function neighbours(courseId, lessonId) {
  const rows = await db('lessons')
    .join('modules', 'modules.id', 'lessons.module_id')
    .where('modules.course_id', courseId)
    .where('lessons.is_published', true)
    .orderBy([
      { column: 'modules.position' },
      { column: 'lessons.position' },
      { column: 'lessons.id' },
    ])
    .select('lessons.id', 'lessons.slug', 'lessons.title');

  const index = rows.findIndex((r) => r.id === lessonId);
  return {
    prev: index > 0 ? rows[index - 1] : null,
    next: index >= 0 && index < rows.length - 1 ? rows[index + 1] : null,
    position: index + 1,
    total: rows.length,
  };
}

export default async function AulaPage({ params }) {
  const user = await currentUser();
  const data = await getLessonForUser(params.slug, user);

  if (!data.lesson) notFound();

  const { lesson, module: mod, course, unlocked, completed, secondsWatched, lock } = data;
  const nav = await neighbours(course.id, lesson.id);

  if (!unlocked) {
    return (
      <main className="container-page py-12">
        <Link href="/painel" className="link-muted inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Voltar para minhas aulas
        </Link>

        <div className="card mx-auto mt-8 max-w-xl p-10 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-ink-600 bg-ink-800">
            {lock?.code === 'scheduled' ? (
              <CalendarClock size={26} className="text-amber-300" />
            ) : (
              <Lock size={24} className="text-zinc-500" />
            )}
          </span>

          <h1 className="mt-6 text-xl font-bold text-white">{lesson.title}</h1>

          <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
            {lock?.code === 'scheduled' && lesson.release_at
              ? `Esta aula sera liberada automaticamente em ${formatDateTime(lesson.release_at)}.`
              : lock?.code === 'sequence'
                ? 'Conclua a aula anterior para desbloquear este conteudo.'
                : 'Esta aula ainda nao foi liberada. Voce recebera um aviso assim que ela abrir.'}
          </p>

          <Link href="/painel" className="btn-primary mt-8">
            Ver aulas liberadas
          </Link>
        </div>
      </main>
    );
  }

  const src =
    lesson.video_type === 'upload'
      ? lesson.video_path
        ? `/api/video/${lesson.slug}`
        : null
      : toEmbedUrl(lesson.video_url);

  return (
    <main className="container-page py-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/painel" className="link-muted inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Minhas aulas
        </Link>
        <span className="text-xs text-zinc-500">
          Aula {nav.position} de {nav.total}
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <VideoPlayer
            slug={lesson.slug}
            videoType={lesson.video_type}
            src={src}
            startAt={secondsWatched}
            completed={completed}
          />

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
              {mod.title}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {lesson.title}
            </h1>

            {lesson.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                {lesson.description}
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-700 pt-6">
            {nav.prev ? (
              <Link href={`/painel/aula/${nav.prev.slug}`} className="btn-ghost btn-sm">
                <ArrowLeft size={14} />
                <span className="max-w-[160px] truncate">{nav.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {nav.next && (
              <Link href={`/painel/aula/${nav.next.slug}`} className="btn-ghost btn-sm">
                <span className="max-w-[160px] truncate">{nav.next.title}</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* lateral com o resumo do curso */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white">{course.title}</h2>
            {course.subtitle && <p className="mt-1 text-xs text-zinc-500">{course.subtitle}</p>}
            <Link href="/painel" className="btn-ghost btn-sm mt-4 w-full">
              Ver todas as aulas
            </Link>
          </div>

          <div className="card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Como funciona a liberacao
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-zinc-500">
              <li>- A aula de apresentacao fica sempre aberta.</li>
              <li>- As demais abrem conforme o administrador libera.</li>
              <li>- Aulas ja liberadas continuam disponiveis para rever.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
