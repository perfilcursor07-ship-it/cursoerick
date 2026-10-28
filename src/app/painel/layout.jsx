import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import AppHeader from '@/components/AppHeader';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }) {
  const [user, settings] = await Promise.all([currentUser(), getSettings()]);
  if (!user) redirect('/login?next=/painel');

  return (
    <div className="min-h-screen bg-ink-950">
      <AppHeader
        siteName={settings['site.name']}
        user={user}
        homeHref="/painel"
        links={[{ href: '/painel', label: 'Minhas aulas' }]}
      />
      {children}
    </div>
  );
}
