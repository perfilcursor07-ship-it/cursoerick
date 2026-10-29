import { Check, DollarSign, Pointer, Heart, MessageCircle, Play, Share2, ThumbsUp } from 'lucide-react';

function FeedPost({ second = false }) {
  return (
    <div className="flex h-1/2 flex-col px-1.5 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-400 text-[6px] font-black text-black">SP</span>
        <div className="flex-1">
          <div className="h-1 w-11 rounded-full bg-white/70" />
          <div className="mt-1 h-[3px] w-8 rounded-full bg-white/20" />
        </div>
        <span className="text-[9px] leading-none text-white/40">···</span>
      </div>
      <div className="relative mt-1.5 min-h-0 flex-1 overflow-hidden rounded-lg bg-[#18382f]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={second ? '/videos/chamada-capa.jpg' : '/images/sua-pagina-poster.webp'}
          alt=""
          className={second ? 'h-full w-full object-cover object-center' : 'h-full w-full object-cover object-[22%_center]'}
          loading="lazy"
        />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur-sm">
            <Play size={12} className="translate-x-px fill-current" />
          </span>
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-white/40">
        <Heart size={9} />
        <MessageCircle size={9} />
        <span className="ml-auto h-[3px] w-8 rounded-full bg-white/15" />
      </div>
    </div>
  );
}

/** Cena ilustrativa: a pessoa rola o feed e vê o pagamento do conteúdo. */
export default function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[44px] bg-brand-500/15 blur-3xl" />
      <div className="rounded-[30px] border border-brand-400/25 bg-gradient-to-br from-brand-300/20 via-white/5 to-transparent p-[1px] shadow-[0_30px_80px_-28px_rgba(0,0,0,.9)]">
        <div className="rounded-[29px] bg-[#0b1211] p-3.5 sm:p-4">
          <div className="flex items-center gap-3 px-1 pb-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-700 text-sm font-black text-ink-950 ring-2 ring-brand-300/25">SP</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">Sua Página</p>
              <p className="truncate text-[11px] text-zinc-400">conteúdo original · publica todo dia</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-400/25 bg-brand-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-200 sm:px-2.5 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />monetizada
            </span>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#080f0e]">
            <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_28%_50%,rgba(16,185,129,.17),transparent_45%),linear-gradient(145deg,#0b1917,#07100f_58%,#10251e)]">
              <div aria-hidden="true" className="absolute inset-0 bg-grid-dark bg-[size:28px_28px] opacity-25" />
              <div className="absolute left-[15%] top-1/2 w-[32%] max-w-[150px] -translate-y-1/2 -rotate-[7deg]">
                <div className="aspect-[9/16] rounded-[24px] border-[3px] border-zinc-600 bg-[#050908] p-[4px] shadow-[0_20px_45px_-12px_rgba(0,0,0,.95),0_0_24px_rgba(16,185,129,.2)]">
                  <div className="relative h-full w-full overflow-hidden rounded-[17px] bg-[#0c1512]">
                    <div className="absolute inset-x-0 top-0 z-10 flex h-[15%] items-center gap-1.5 border-b border-white/10 bg-[#101c18] px-2">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#3273cf] font-sans text-[11px] font-black text-white">f</span>
                      <span className="text-[7px] font-bold text-white/85">Feed</span>
                      <span className="ml-auto text-[9px] text-white/40">•••</span>
                    </div>
                    <div className="absolute inset-x-[3px] bottom-[5%] top-[15%] overflow-hidden">
                      <div className="hero-feed-track absolute inset-x-0 top-0 h-[200%]">
                        <FeedPost />
                        <FeedPost second />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-[5%] bg-[#101c18]">
                      <span className="absolute bottom-1 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-white/35" />
                    </div>
                  </div>
                </div>
              </div>

              <span aria-hidden="true" className="hero-swipe-hand absolute left-[41%] top-[68%] z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-[#d8b18f] text-[#2e241d] shadow-[0_12px_24px_rgba(0,0,0,.5)] sm:h-12 sm:w-12">
                <Pointer size={24} strokeWidth={1.8} />
              </span>

              <div className="hero-earnings absolute right-[7%] top-1/2 w-[41%] max-w-[185px] rounded-2xl border border-brand-300/35 bg-[#10231d]/95 p-3 shadow-[0_18px_42px_-10px_rgba(0,0,0,.85),0_0_22px_rgba(52,211,153,.15)] backdrop-blur-sm sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-brand-300 sm:text-[9px]">Ganhos da página</span>
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-400/15 text-brand-300"><Check size={11} /></span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-brand-200">
                  <DollarSign size={22} className="shrink-0 sm:h-7 sm:w-7" />
                  <span className="font-brush text-2xl leading-none sm:text-3xl">USD</span>
                </div>
                <p className="mt-1.5 text-[9px] leading-tight text-zinc-300 sm:text-[10px]">Seu conteúdo gerou pagamento</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <span className="hero-earnings-progress block h-full rounded-full bg-brand-400" />
                </div>
              </div>
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:text-[10px]">
                <Play size={11} className="fill-current text-brand-300" />vídeo monetizado
              </span>
              <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">0:42</span>
            </div>
            <div className="flex items-center gap-4 px-3.5 py-3 text-zinc-500">
              <ThumbsUp size={15} /><Heart size={15} /><MessageCircle size={15} /><Share2 size={15} className="ml-auto" />
            </div>
          </div>

          <div className="relative mt-3.5 flex items-center gap-3 overflow-hidden rounded-2xl border border-brand-400/25 bg-gradient-to-r from-brand-500/15 via-brand-500/[0.07] to-transparent p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-300/20 bg-brand-400/15 text-brand-200"><DollarSign size={19} /></span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-100">Pagamento em dólar</p>
              <p className="truncate text-[11px] text-zinc-400">do Facebook direto para a sua conta</p>
            </div>
            <span className="ml-auto hidden rounded-full bg-brand-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-300 sm:inline-flex">USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
