import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import PainelNavigation from '@/components/PainelNavigation';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }) {
  const user = await currentUser();
  if (!user) redirect('/login?next=/painel');

  return (
    <div className="min-h-screen bg-ink-950">
      <PainelNavigation user={user}>{children}</PainelNavigation>
    </div>
  );
}
