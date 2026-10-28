import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Eye,
  FileText,
  Flame,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Unlock,
  Wallet,
} from 'lucide-react';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { isGloballyReleased } from '@/lib/access';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import HeroArt from '@/components/HeroArt';
import CurriculumPreview from '@/components/CurriculumPreview';
import PricingSection from '@/components/PricingSection';

export const dynamic = 'force-dynamic';

/** Grade do curso para a vitrine da home (sem exigir login). */
async function loadCurriculum() {
  try {
    const course = await db('courses')
      .where({ is_published: true })
      .orderBy([{ column: 'position' }, { column: 'id' }])
      .first();
    if (!course) return null;

    const modules = await db('modules')
      .where({ course_id: course.id })
      .orderBy([{ column: 'position' }, { column: 'id' }]);

    const ids = modules.map((m) => m.id);
    const lessons = ids.length
      ? await db('lessons')
          .whereIn('module_id', ids)
          .where({ is_published: true })
          .orderBy([{ column: 'module_id' }, { column: 'position' }, { column: 'id' }])
      : [];

    return {
      course,
      modules: modules.map((m) => ({
        ...m,
        lessons: lessons.filter((l) => l.module_id === m.id),
      })),
      total: lessons.length,
      open: lessons.filter((l) => isGloballyReleased(l)).length,
      moduleCount: modules.length,
    };
  } catch {
    return null;
  }
}

const PILLARS = [
  { icon: DollarSign, label: 'Pagamento em dolar' },
  { icon: Eye, label: 'Sem aparecer no video' },
  { icon: Smartphone, label: 'Da para fazer do celular' },
  { icon: ShieldCheck, label: 'Sem investir em anuncios' },
];

const LEARN = [
  { icon: Rocket, title: 'Criar a pagina do jeito certo', text: 'Nome, nicho e configuracoes pensadas para monetizar depois.' },
  { icon: Target, title: 'Escolher um nicho que paga', text: 'Avalie demanda e concorrencia antes de perder meses no tema errado.' },
  { icon: Flame, title: 'Montar posts que performam', text: 'A estrutura do gancho ao final, para segurar a pessoa ate o fim.' },
  { icon: FileText, title: 'Produzir em escala', text: 'Seu fluxo com IA para publicar todo dia sem travar na producao.' },
  { icon: BarChart3, title: 'Ler as metricas certas', text: 'Alcance, retencao e RPM: o que olhar quando o numero cai.' },
  { icon: Wallet, title: 'Receber em dolar', text: 'Ativar a monetizacao e acompanhar o dinheiro ate a sua conta.' },
];

const FAQ = [
  {
    q: 'Preciso aparecer ou gravar minha voz?',
    a: 'Nao. O metodo e baseado em paginas de conteudo, entao da para produzir sem mostrar o rosto e sem narrar.',
  },
  {
    q: 'Preciso investir em anuncios?',
    a: 'Nao. O foco e alcance organico: conteudo que performa sozinho dentro do proprio Facebook.',
  },
  {
    q: 'Em quanto tempo a pagina monetiza?',
    a: 'Depende do seu ritmo, do nicho e dos criterios do Facebook, que podem mudar. O curso mostra o caminho, mas nao existe prazo garantido.',
  },
  {
    q: 'Serve para quem esta comecando do zero?',
    a: 'Sim. A primeira aula parte do zero absoluto e as etapas vao sendo construidas uma sobre a outra.',
  },
];

export default async function HomePage() {
  const [settings, user, curriculum] = await Promise.all([
    getSettings(),
    currentUser().catch(() => null),
    loadCurriculum(),
  ]);

  const siteName = settings['site.name'];
  const ctaHref = user ? '/painel' : '/cadastro';
  const ctaLabel = user ? 'Ir para minhas aulas' : settings['home.cta'];

  return (
    <div className="min-h-screen bg-ink-950">
      <SiteHeader siteName={siteName} user={user} />

      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[120px]" />

        <div className="container-page relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div className="text-center lg:text-left">
            <span className="badge-brand animate-fade-up">
              <Sparkles size={13} />
              {settings['home.badge']}
            </span>

            <h1 className="mt-5 animate-fade-up text-[2.5rem] font-extrabold leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              Ganhe{' '}
              <span className="bg-gradient-to-r from-brand-200 via-brand-300 to-brand-500 bg-clip-text text-transparent">
                em dolar
              </span>{' '}
              com paginas do Facebook
            </h1>

            <p className="mx-auto mt-5 max-w-xl animate-fade-up leading-relaxed text-zinc-400 lg:mx-0">
              {settings['home.subtitle']}
            </p>

            <div className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href={ctaHref} className="btn-primary w-full sm:w-auto">
                {ctaLabel}
                <ArrowRight size={16} />
              </Link>
              <a href="#planos" className="btn-ghost w-full sm:w-auto">
                Ver os planos
              </a>
            </div>

            <p className="mt-4 text-xs text-zinc-600">
              Cadastro rapido - a primeira aula abre na hora
            </p>
          </div>

          <div className="animate-fade-up">
            <HeroArt />
          </div>
        </div>

        {/* faixa de pilares */}
        <div className="relative border-y border-ink-700/70 bg-ink-900/50">
          <div className="container-page grid grid-cols-2 divide-ink-700/70 md:grid-cols-4 md:divide-x">
            {PILLARS.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-center gap-2.5 px-4 py-4 text-center"
              >
                <item.icon size={15} className="shrink-0 text-brand-400" />
                <span className="text-[12px] font-semibold text-zinc-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- o que voce vai aprender ---------------- */}
      <section id="metodo" className="py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Do primeiro post ao primeiro saque
            </h2>
            <p className="mt-3 text-zinc-400">
              Cada bloco e uma etapa pratica da construcao da sua pagina.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEARN.map((item) => (
              <div
                key={item.title}
                className="card flex gap-3.5 p-5 transition hover:border-brand-500/40"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-300">
                  <item.icon size={17} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- conteudo do curso ---------------- */}
      <section id="conteudo" className="border-t border-ink-700/70 bg-ink-900/40 py-16">
        <div className="container-page">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Conteudo do curso
              </h2>
              <p className="mt-3 text-zinc-400">
                A aula de apresentacao esta aberta. As demais sao liberadas aos poucos, para voce
                aplicar cada etapa antes de avancar.
              </p>
            </div>

            {curriculum && (
              <div className="flex shrink-0 gap-6">
                {[
                  { n: curriculum.moduleCount, l: 'modulos' },
                  { n: curriculum.total, l: 'aulas' },
                  { n: curriculum.open, l: 'liberadas', green: true },
                ].map((s) => (
                  <div key={s.l}>
                    <div
                      className={`text-3xl font-bold ${s.green ? 'text-brand-400' : 'text-white'}`}
                    >
                      {s.n}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-zinc-500">{s.l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {curriculum ? (
            <div className="mt-9">
              <CurriculumPreview curriculum={curriculum} />
            </div>
          ) : (
            <div className="card mt-9 p-8 text-center text-sm text-zinc-400">
              O conteudo sera publicado em breve.
            </div>
          )}

          {/* como funciona, em uma linha */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Sparkles, t: 'Comece pela aula aberta' },
              { icon: CheckCircle2, t: 'Aplique a tarefa da aula' },
              { icon: Unlock, t: 'Receba a proxima liberada' },
            ].map((s, i) => (
              <div
                key={s.t}
                className="flex items-center gap-3 rounded-xl border border-ink-700/80 bg-ink-850/60 px-4 py-3"
              >
                <span className="text-xs font-black text-ink-600">0{i + 1}</span>
                <s.icon size={15} className="shrink-0 text-brand-400" />
                <span className="text-[13px] font-medium text-zinc-300">{s.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- planos ---------------- */}
      <PricingSection settings={settings} loggedIn={Boolean(user)} />

      {/* ---------------- duvidas + cta ---------------- */}
      <section id="duvidas" className="border-t border-ink-700/70 py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Duvidas frequentes
            </h2>

            <div className="mt-6 space-y-2.5">
              {FAQ.map((item) => (
                <details key={item.q} className="card group px-5 py-3.5 [&_summary]:cursor-pointer">
                  <summary className="flex items-center justify-between gap-4 text-sm font-semibold text-zinc-100 marker:content-['']">
                    {item.q}
                    <span className="shrink-0 text-brand-400 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* cta final */}
          <div className="relative overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-900/30 via-ink-850 to-ink-900 p-7">
            <div className="absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="relative">
              <span className="badge-brand">
                <DollarSign size={12} />
                Comece pela aula 01
              </span>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
                Sua primeira pagina comeca hoje
              </h2>
              <p className="mt-2.5 text-sm text-zinc-400">
                Cadastro com nome, e-mail e telefone. Em menos de um minuto voce ja esta assistindo.
              </p>

              <Link href={ctaHref} className="btn-primary mt-6 w-full">
                {ctaLabel}
                <ArrowRight size={16} />
              </Link>

              <p className="mt-6 text-[11px] leading-relaxed text-zinc-600">
                Este curso ensina um metodo de trabalho. Os resultados dependem da sua dedicacao, do
                nicho escolhido e das regras do proprio Facebook, que podem mudar a qualquer
                momento. Nao ha promessa nem garantia de ganho.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter siteName={siteName} />
    </div>
  );
}
