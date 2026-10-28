import Link from 'next/link';
import { ArrowRight, Check, ExternalLink, Minus, Sparkles } from 'lucide-react';

/**
 * Planos exibidos na home.
 *
 * Os beneficios ficam aqui no codigo; preco, observacao e link de checkout vem
 * das configuracoes (editaveis em /admin/site).
 *
 * Importante: estes cards sao a vitrine comercial. Quem decide o que cada aluno
 * enxerga continua sendo a liberacao das aulas no painel do administrador.
 */
export default function PricingSection({ settings, loggedIn }) {
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      tagline: 'Para conhecer o metodo',
      price: 'Gratis',
      note: 'sem cartao',
      href: loggedIn ? '/painel' : '/cadastro',
      cta: loggedIn ? 'Ir para minhas aulas' : 'Criar conta gratis',
      highlight: false,
      features: [
        { label: 'Aula de apresentacao liberada na hora', ok: true },
        { label: 'Acesso a plataforma e ao seu progresso', ok: true },
        { label: 'Novas aulas gratuitas quando forem abertas', ok: true },
        { label: 'Curso completo', ok: false },
        { label: 'Mentoria', ok: false },
        { label: 'Sistema ViralizeAI', ok: false },
      ],
    },
    {
      id: 'full',
      name: 'Curso completo',
      tagline: 'Todo o passo a passo',
      price: settings['plan.full.price'],
      note: settings['plan.full.note'],
      href: settings['plan.full.url'] || '/cadastro',
      cta: 'Quero o curso completo',
      highlight: false,
      features: [
        { label: 'Todas as aulas dos 3 modulos liberadas', ok: true },
        { label: 'Da criacao da pagina ate o saque em dolar', ok: true },
        { label: 'Acesso as atualizacoes do curso', ok: true },
        { label: 'Assista quantas vezes quiser', ok: true },
        { label: 'Mentoria', ok: false },
        { label: 'Sistema ViralizeAI', ok: false },
      ],
    },
    {
      id: 'pro',
      name: 'Mentoria + ViralizeAI',
      tagline: 'Curso, acompanhamento e a ferramenta',
      price: settings['plan.pro.price'],
      note: settings['plan.pro.note'],
      href: settings['plan.pro.url'] || '/cadastro',
      cta: 'Quero a mentoria',
      highlight: true,
      features: [
        { label: 'Tudo do plano Curso completo', ok: true },
        { label: 'Mentoria para tirar duvidas e revisar sua pagina', ok: true },
        { label: '30 dias gratis no ViralizeAI, o sistema de postagem', ok: true, strong: true },
        { label: 'Redacao com IA, arte e agendamento em um painel', ok: true },
        { label: 'Piloto automatico publicando a fila sozinho', ok: true },
        { label: 'Paginas do Facebook e Instagram, Reels 9:16', ok: true },
      ],
    },
  ];

  return (
    <section id="planos" className="border-t border-ink-700/70 py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge-brand">Planos</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Escolha por onde comecar
          </h2>
          <p className="mt-3 text-zinc-400">
            Comece de graca pela primeira aula. Quando quiser o caminho inteiro, e so subir de
            plano.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={[
                'relative flex h-full flex-col rounded-2xl border p-6 transition',
                plan.highlight
                  ? 'border-brand-500/50 bg-gradient-to-b from-brand-900/30 via-ink-850 to-ink-900 shadow-glow lg:-mt-4 lg:pb-8 lg:pt-10'
                  : 'border-ink-700 bg-ink-850/80 shadow-card hover:border-ink-600',
              ].join(' ')}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-950">
                  <Sparkles size={11} />
                  Mais completo
                </span>
              )}

              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="mt-1 text-xs text-zinc-500">{plan.tagline}</p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-black leading-none tracking-tight text-white">
                  {plan.price}
                </span>
                {plan.note && <span className="pb-1 text-xs text-zinc-500">{plan.note}</span>}
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2.5 text-sm">
                    {feature.ok ? (
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-400" />
                    ) : (
                      <Minus size={16} className="mt-0.5 shrink-0 text-zinc-700" />
                    )}
                    <span
                      className={
                        !feature.ok
                          ? 'text-zinc-600 line-through'
                          : feature.strong
                            ? 'font-semibold text-brand-200'
                            : 'text-zinc-300'
                      }
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 w-full ${plan.highlight ? 'btn-primary' : 'btn-ghost'}`}
              >
                {plan.cta}
                <ArrowRight size={15} />
              </Link>

              {plan.id === 'pro' && settings['plan.viralize.url'] && (
                <a
                  href={settings['plan.viralize.url']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-500 transition hover:text-brand-300"
                >
                  conhecer o ViralizeAI
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-[11px] leading-relaxed text-zinc-600">
          O acesso as aulas e liberado pelo administrador apos a confirmacao do pagamento. O
          ViralizeAI e um sistema separado: os 30 dias comecam quando o seu acesso e criado e,
          depois desse periodo, a ferramenta segue como assinatura a parte.
        </p>
      </div>
    </section>
  );
}
