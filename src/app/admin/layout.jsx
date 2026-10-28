import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import AppHeader from '@/components/AppHeader';

export const dynamic = 'force-dynamic';

const LINKS = [
  { href: '/admin', label: 'Visao geral' },
  { href: '/admin/cursos', label: 'Cursos e aulas' },
  { href: '/admin/alunos', label: 'Alunos' },
  { href: '/admin/site', label: 'Pagina inicial' },
];

export default async function AdminLayout({ children }) {
  const [user, settings] = await Promise.all([currentUser(), getSettings()]);
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') redirect('/painel');

  return (
    <div className="min-h-screen bg-ink-950">
      <AppHeader
        siteName={settings['site.name']}
        user={user}
        homeHref="/admin"
        links={LINKS}
      />
      {children}
    </div>
  );
}
