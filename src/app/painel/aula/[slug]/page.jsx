import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarClock, ListChecks, Lock } from 'lucide-react';
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

/** Quebra a tarefa da aula (uma por linha) em itens limpos. */
function taskItems(task) {
  return String(task || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*\u2022]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
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

  const { lesson, module: mod, course, unlocked, completed, feedback, secondsWatched, lock } = data;
  const tasks = taskItems(lesson.task);
  const nav = await neighbours(course.id, lesson.id);
  const nextLesson = nav.next ? await getLessonForUser(nav.next.slug, user) : null;

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

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400 ring-1 ring-inset ring-white/10">
            <Lock size={11} />
            {lock?.code === 'sequence' ? 'Conclua a aula anterior' : 'Aula bloqueada'}
          </span>

          <h1 className="mt-3 text-xl font-bold text-white">{lesson.title}</h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
            {lock?.code === 'scheduled' && lesson.release_at
              ? `Esta aula será liberada automaticamente em ${formatDateTime(lesson.release_at)}.`
              : lock?.code === 'sequence'
                ? 'Assista as aulas anteriores e marque cada uma como concluída para liberar esta.'
                : 'Em breve esta aula será liberada. Você recebe um aviso assim que ela abrir.'}
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
    <main className="container-page min-w-0 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/painel" className="link-muted inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Minhas aulas
        </Link>
        <span className="text-xs text-zinc-500">
          Aula {nav.position} de {nav.total}
        </span>
      </div>

      <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <VideoPlayer
            slug={lesson.slug}
            videoType={lesson.video_type}
            src={src}
            startAt={secondsWatched}
            completed={completed}
            feedback={feedback}
          />

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
              {mod.title}
            </p>
            <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-white md:text-3xl">
              {lesson.title}
            </h1>

            {lesson.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                {lesson.description}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-700 pt-6">
            {nav.prev ? (
              <Link href={`/painel/aula/${nav.prev.slug}`} className="btn-ghost btn-sm min-w-0 max-w-[48%]">
                <ArrowLeft size={14} />
                <span className="min-w-0 max-w-[160px] truncate">{nav.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {nav.next && (
              nextLesson?.unlocked ? (
                <Link href={`/painel/aula/${nav.next.slug}`} className="btn-ghost btn-sm min-w-0 max-w-[48%]">
                  <span className="min-w-0 max-w-[160px] truncate">{nav.next.title}</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <span className="inline-flex min-w-0 max-w-[48%] cursor-not-allowed items-center gap-2 rounded-xl border border-ink-600 bg-ink-800/40 px-3 py-1.5 text-xs text-zinc-500">
                  <Lock size={14} className="shrink-0" />
                  <span className="min-w-0 truncate">
                    {!completed
                      ? 'Marque esta como concluída'
                      : nextLesson?.lock?.code === 'scheduled'
                        ? 'Liberação programada'
                        : 'Bloqueada - em breve'}
                  </span>
                </span>
              )
            )}
          </div>
        </div>

        {/* lateral com o resumo do curso */}
        <aside className="min-w-0 space-y-4">
          <div className="card p-5">
            <h2 className="break-words text-sm font-semibold text-white">{course.title}</h2>
            {course.subtitle && <p className="mt-1 text-xs text-zinc-500">{course.subtitle}</p>}
            <Link href="/painel" className="btn-ghost btn-sm mt-4 w-full">
              Ver todas as aulas
            </Link>
          </div>

          <div className="card p-5">
            <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-300">
              <ListChecks size={14} /> Tarefa desta aula
            </h3>

            {mod.description && (
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                <span className="font-semibold text-zinc-400">{mod.title}:</span> {mod.description}
              </p>
            )}

            {tasks.length ? (
              <ol className="mt-4 space-y-3">
                {tasks.map((item, index) => (
                  <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-zinc-300">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-brand-500/40 bg-brand-500/10 text-[10px] font-bold text-brand-200">
                      {index + 1}
                    </span>
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-xs leading-relaxed text-zinc-500">
                Aplique nesta semana o que voce acabou de ver antes de avancar para a proxima aula.
              </p>
            )}

            <p className="mt-4 border-t border-ink-700 pt-3 text-xs leading-relaxed text-zinc-600">
              Faca a tarefa e depois marque a aula como concluida.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
