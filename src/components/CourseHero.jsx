import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';

/** Destaque compacto do curso e progresso do aluno. */
export default function CourseHero({ course, stats, firstName }) {
  const next = stats.nextLesson;
  const titleWords = String(course.title || '').trim().split(/\s+/);
  const titleAccent = titleWords.length > 1 ? titleWords.pop() : '';
  const titleLead = titleAccent ? titleWords.join(' ') : titleWords[0];

  return (
    <section className="relative isolate overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 -z-10">
        {course.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.cover_url}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-900/70 via-ink-950 to-black">
            <div className="absolute inset-0 bg-grid-dark bg-[size:52px_52px] opacity-40" />
            <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-brand-400/15 blur-[110px]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-ink-950/85 to-brand-900/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-black/45" />
        <div className="absolute -right-20 top-4 h-80 w-80 rounded-full bg-brand-400/10 blur-[110px]" />
      </div>

      <div className="container-page grid min-h-[330px] items-center gap-8 py-10 md:min-h-[350px] md:grid-cols-[minmax(0,1fr)_280px] md:py-12">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-300">
            <Sparkles size={14} />
            Olá, {firstName}. Sua jornada continua.
          </p>

          <h1 className="mt-4 max-w-2xl font-brush text-[clamp(2rem,4vw,2.75rem)] font-normal uppercase leading-[0.98] tracking-normal text-white drop-shadow-[0_4px_24px_rgba(0,0,0,.75)]">
            {titleLead}{' '}
            {titleAccent && <span className="text-brand-300">{titleAccent}</span>}
          </h1>

          {course.subtitle && (
            <p className="mt-4 max-w-xl border-l-2 border-brand-400/60 pl-3 text-sm leading-relaxed text-zinc-300">
              {course.subtitle}
            </p>
          )}

          {next ? (
            <div className="mt-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={`/painel/aula/${next.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200/50 bg-gradient-to-b from-brand-300 to-brand-500 px-5 py-3 text-sm font-bold text-black shadow-[0_12px_32px_-14px_rgba(245,158,11,.9)] transition hover:from-brand-200 hover:to-brand-400 active:scale-[.98]"
              >
                <Play size={15} className="fill-current" />
                {stats.totalCompleted > 0 ? 'Continuar assistindo' : 'Começar agora'}
              </Link>
              <p className="max-w-xs truncate text-xs text-zinc-400">
                Próxima aula: <span className="text-zinc-200">{next.title}</span>
              </p>
            </div>
          ) : (
            <span className="badge-brand mt-6">
              <Sparkles size={13} />
              Novas aulas em breve
            </span>
          )}
        </div>

        <aside className="rounded-2xl border border-brand-200/15 bg-black/65 p-5 shadow-[0_24px_80px_-32px_rgba(245,158,11,.3)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
              Seu progresso
            </p>
            <span className="rounded-full border border-brand-300/25 bg-brand-300/10 px-2.5 py-1 text-xs font-bold text-brand-200">
              {stats.percent}%
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold tracking-tight text-white">
            {stats.totalCompleted}
            <span className="ml-2 text-sm font-medium text-zinc-500">
              de {stats.totalLessons} aulas
            </span>
          </p>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Progresso do curso"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.percent}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-200 transition-all"
              style={{ width: `${stats.percent}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            {stats.totalCompleted === 1 ? 'Aula concluída' : 'Aulas concluídas'}
          </p>
        </aside>
      </div>
    </section>
  );
}
