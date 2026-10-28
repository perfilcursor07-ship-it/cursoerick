import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';

const HIGHLIGHTS = [
  'Primeira aula liberada na hora do cadastro',
  'Novas aulas liberadas aos poucos, no seu ritmo',
  'Acompanhe seu progresso em cada modulo',
  'Assista pelo celular, tablet ou computador',
];

export default function AuthShell({ siteName, title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* coluna de apresentacao (somente em telas grandes) */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden border-r border-ink-700/70 bg-ink-900/60 p-10 lg:flex">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-grid-dark bg-[size:44px_44px] opacity-60" />

        <div className="relative">
          <Logo name={siteName} />
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Aprenda com um passo por vez.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            As aulas sao liberadas gradualmente para voce aplicar o conteudo antes de avancar.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} {siteName}
        </p>
      </aside>

      {/* coluna do formulario */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="lg:hidden">
            <Logo name={siteName} />
          </div>
          <Link href="/" className="btn-ghost btn-sm ml-auto">
            <ArrowLeft size={14} />
            Inicio
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm animate-fade-up">
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
