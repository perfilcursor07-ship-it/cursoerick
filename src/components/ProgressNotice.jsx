import Link from 'next/link';
import { CalendarClock, Lock, PlayCircle, Trophy } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

/**
 * Aviso que fica acima das prateleiras e diz, em uma frase, o que o aluno
 * precisa fazer agora:
 *  - tem aula liberada e nao concluída -> assistir e marcar como concluída
 *  - concluiu tudo que esta aberto     -> a próxima aula ainda esta bloqueada
 *  - concluiu o curso                  -> parabéns
 */
export default function ProgressNotice({ stats, current, blocked, sequential = false }) {
  const shell =
    'flex flex-col gap-4 rounded-2xl border bg-ink-900/85 p-4 shadow-card backdrop-blur ' +
    'sm:flex-row sm:items-center sm:gap-5 sm:p-5';
  const icon = 'grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset';

  // 1) falta assistir / marcar como concluída
  if (current) {
    const started = current.lesson.state.secondsWatched > 0;
    const number = String(current.index).padStart(2, '0');

    return (
      <div className={`${shell} border-brand-400/30`}>
        <span className={`${icon} bg-brand-400/15 text-brand-200 ring-brand-300/30`}>
          <PlayCircle size={22} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">
            {started ? 'Você parou na Aula' : 'A sua vez: Aula'} {number}
            <span className="text-zinc-400"> - </span>
            <span className="break-words">{current.lesson.title}</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Assista a aula, faça a tarefa e clique em{' '}
            <span className="font-semibold text-zinc-200">Marcar como concluída</span>.{' '}
            {sequential
              ? 'A próxima aula só abre depois que esta for concluída.'
              : 'É assim que o seu progresso avança.'}
          </p>
        </div>

        <Link
          href={`/painel/aula/${current.lesson.slug}`}
          className="btn-primary btn-sm w-full shrink-0 sm:w-auto"
        >
          {started ? 'Continuar aula' : 'Assistir agora'}
        </Link>
      </div>
    );
  }

  // 2) tudo que estava liberado ja foi concluído, mas ainda falta conteudo
  if (blocked) {
    const scheduled = blocked.lesson.state.lock?.code === 'scheduled' && blocked.lesson.release_at;
    const number = String(blocked.index).padStart(2, '0');

    return (
      <div className={`${shell} border-ink-600`}>
        <span className={`${icon} bg-white/5 text-zinc-300 ring-white/10`}>
          {scheduled ? <CalendarClock size={22} /> : <Lock size={20} />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Aula bloqueada - em breve será liberada</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Você já concluiu tudo o que está liberado. A Aula {number}
            <span className="text-zinc-500"> - </span>
            <span className="text-zinc-300">{blocked.lesson.title}</span>{' '}
            {scheduled
              ? `abre em ${formatDateTime(blocked.lesson.release_at)}.`
              : blocked.lesson.state.lock?.code === 'pro'
                ? 'é exclusiva para assinantes.'
                : 'abre assim que o administrador liberar.'}
          </p>
        </div>

        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          {stats.totalCompleted}/{stats.totalLessons} concluídas
        </span>
      </div>
    );
  }

  // 3) curso concluído
  return (
    <div className={`${shell} border-brand-400/30`}>
      <span className={`${icon} bg-brand-400/15 text-brand-200 ring-brand-300/30`}>
        <Trophy size={20} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white">Você concluiu todas as aulas deste curso</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          Reveja quando quiser: o seu progresso fica salvo e as aulas continuam disponíveis.
        </p>
      </div>

      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-brand-200">
        100% concluído
      </span>
    </div>
  );
}
