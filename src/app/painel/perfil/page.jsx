import { redirect } from 'next/navigation';
import { ChevronLeft, UserRound } from 'lucide-react';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import ProfileForm from '@/components/ProfileForm';

export const metadata = { title: 'Meu perfil' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect('/login?next=/painel/perfil');

  return (
    <main className="container-page max-w-4xl py-8 sm:py-12">
      <Link href="/painel" className="link-muted inline-flex items-center gap-1.5 text-sm">
        <ChevronLeft size={16} /> Voltar para minhas aulas
      </Link>

      <div className="mb-7 mt-7 flex items-start gap-4 sm:mb-9">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
          <UserRound size={22} />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">Conta</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Meu perfil</h1>
          <p className="mt-2 text-sm text-zinc-400">Gerencie seu telefone e sua senha de acesso.</p>
        </div>
      </div>

      <ProfileForm user={user} />
    </main>
  );
}
