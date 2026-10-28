import { BarChart3, DollarSign, Heart, MessageCircle, Share2, ThumbsUp } from 'lucide-react';

/**
 * Ilustracao do topo da home: um recorte de feed com o selo de monetizacao.
 * E so arte, nao mostra valores nem resultados de ninguem.
 */
export default function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* brilho atras */}
      <div className="absolute -inset-8 -z-10 rounded-[40px] bg-brand-500/20 blur-3xl" />

      <div className="rounded-3xl border border-white/10 bg-ink-850/90 p-4 shadow-card backdrop-blur">
        {/* cabecalho da pagina */}
        <div className="flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-900/80 p-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-black text-white">
            SP
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">Sua Pagina</p>
            <p className="truncate text-[11px] text-zinc-500">conteudo original - publica todo dia</p>
          </div>
          <span className="shrink-0 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-300">
            monetizada
          </span>
        </div>

        {/* post */}
        <div className="mt-3 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/80">
          <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-600/40 via-ink-800 to-black">
            <div className="absolute inset-0 bg-grid-dark bg-[size:22px_22px] opacity-50" />
            <div className="absolute inset-0 grid place-items-center">
              <BarChart3 size={34} className="text-white/25" />
            </div>
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
              0:42
            </span>
          </div>

          <div className="flex items-center gap-4 px-3 py-2.5 text-zinc-500">
            <ThumbsUp size={14} />
            <Heart size={14} />
            <MessageCircle size={14} />
            <Share2 size={14} className="ml-auto" />
          </div>
        </div>

        {/* linha do pagamento */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
            <DollarSign size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-200">Pagamento em dolar</p>
            <p className="truncate text-[11px] text-zinc-500">
              do Facebook direto para a sua conta
            </p>
          </div>
        </div>
      </div>

      {/* etiqueta flutuante */}
      <div className="absolute -right-3 -top-4 rotate-6 rounded-xl border border-brand-400/40 bg-ink-900/95 px-3 py-2 shadow-glow backdrop-blur">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-300">USD</p>
        <p className="text-[11px] font-semibold text-white">pago pelo Facebook</p>
      </div>
    </div>
  );
}
