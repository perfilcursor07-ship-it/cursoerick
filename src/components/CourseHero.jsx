import Link from 'next/link';
import { ChevronDown, Play, Sparkles } from 'lucide-react';
import { PosterArt } from './PosterCard';

/** Posicao de cada cartaz no leque do lado direito (frente -> fundo). */
const FAN = [
  'left-0 top-6 z-30 -rotate-6',
  'left-[104px] top-2 z-20 rotate-[3deg] scale-[.9]',
  'left-[180px] top-8 z-10 rotate-[11deg] scale-[.8]',
];

/** Banner de destaque do curso, no estilo "billboard" das plataformas de streaming. */
export default function CourseHero({ course, stats, firstName, featured = [], moduleCount, courses = [] }) {
  const next = stats.nextLesson;
  const titleWords = String(course.title || '').trim().split(/\s+/);
  const titleAccent = titleWords.length > 1 ? titleWords.pop() : '';
  const titleLead = titleAccent ? titleWords.join(' ') : titleWords[0];
  const started = stats.totalCompleted > 0;

  return (
    <section className="relative isolate overflow-hidden">
      {/* fundo */}
      <div className="absolute inset-0 -z-10">
        {course.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.cover_url} alt="" className="h-full w-full object-cover object-center" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_75%_30%,rgba(16,185,129,.38),transparent_55%),radial-gradient(ellipse_at_100%_100%,rgba(250,204,21,.12),transparent_45%)]">
            <div className="absolute inset-0 bg-grid-dark bg-[size:48px_48px] opacity-50 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
            <span className="absolute -right-6 bottom-6 select-none font-brush text-[clamp(8rem,22vw,20rem)] uppercase leading-none text-white/[0.035]">
              {titleAccent || titleLead}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />
      </div>

      <div className="container-page grid min-h-[380px] grid-cols-1 items-center gap-10 pb-28 pt-10 md:min-h-[430px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="max-w-2xl animate-fade-up">
          {courses.length > 1 && (
            <nav className="mb-6 flex flex-wrap gap-2" aria-label="Seus cursos">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/painel?curso=${c.slug}`}
                  className={[
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                    c.slug === course.slug
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-zinc-300 backdrop-blur hover:bg-white/20 hover:text-white',
                  ].join(' ')}
                >
                  {c.title}
                </Link>
              ))}
            </nav>
          )}

          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            <span className="rounded bg-brand-400 px-1.5 py-0.5 text-[9px] tracking-[0.18em] text-black">Curso</span>
            Olá, {firstName}
          </p>

          <h1 className="mt-3 font-brush text-[clamp(1.9rem,4.2vw,3.1rem)] font-normal uppercase leading-[0.95] text-white drop-shadow-[0_6px_30px_rgba(0,0,0,.8)]">
            {titleLead} {titleAccent && <span className="text-brand-300">{titleAccent}</span>}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-zinc-300">
            <span className="text-brand-300">{started ? `${stats.percent}% concluído` : 'Novo pra você'}</span>
            <span className="text-zinc-600">•</span>
            <span>{stats.totalLessons} aulas</span>
            {moduleCount > 0 && (
              <>
                <span className="text-zinc-600">•</span>
                <span>
                  {moduleCount} {moduleCount === 1 ? 'módulo' : 'módulos'}
                </span>
              </>
            )}
            <span className="rounded border border-white/25 px-1.5 py-px text-[10px] text-zinc-200">
              {stats.totalUnlocked} {stats.totalUnlocked === 1 ? 'liberada' : 'liberadas'}
            </span>
          </div>

          {course.subtitle && (
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-300">{course.subtitle}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {next ? (
              <Link
                href={`/painel/aula/${next.slug}`}
                className="inline-flex items-center gap-2.5 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-black shadow-[0_10px_40px_-10px_rgba(255,255,255,.45)] transition hover:bg-white/85 active:scale-[.98]"
              >
                <Play size={17} className="fill-current" />
                {started ? 'Continuar' : 'Assistir'}
              </Link>
            ) : (
              <span className="badge-brand">
                <Sparkles size={13} />
                Novas aulas em breve
              </span>
            )}
            <a
              href="#aulas"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-500/40 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-zinc-500/60"
            >
              <ChevronDown size={17} />
              Ver aulas
            </a>
          </div>

          {next && (
            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
                <span className="truncate">
                  {started ? 'Próxima' : 'Comece por'}: <span className="text-zinc-200">{next.title}</span>
                </span>
                <span className="shrink-0 font-semibold text-zinc-300">
                  {stats.totalCompleted}/{stats.totalLessons}
                </span>
              </div>
              <div
                className="mt-2 h-1 overflow-hidden rounded-full bg-white/15"
                role="progressbar"
                aria-label="Progresso do curso"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={stats.percent}
              >
                <div className="h-full rounded-full bg-brand-400" style={{ width: `${stats.percent}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* leque com as proximas aulas */}
        {featured.length > 0 && (
          <div className="relative hidden h-[270px] lg:block" aria-hidden="true">
            {featured.map(({ lesson, index, tone }, i) => (
              <div
                key={lesson.id}
                className={`group absolute aspect-[2/3] w-[150px] overflow-hidden rounded-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] ring-1 ring-white/15 transition duration-500 hover:-translate-y-2 ${FAN[i]}`}
              >
                <PosterArt lesson={lesson} index={index} tone={tone} compact />
                {i > 0 && <div className={`absolute inset-0 ${i === 1 ? 'bg-black/45' : 'bg-black/65'}`} />}
                {i === 0 && (
                  <span className="absolute bottom-3 left-3 rounded bg-brand-400 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                    {started ? 'Próxima aula' : 'Comece aqui'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
