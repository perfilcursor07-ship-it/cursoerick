import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const [user, settings] = await Promise.all([currentUser(), getSettings()]);
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') redirect('/painel');

  return (
    <div className="min-h-screen bg-ink-950 lg:pl-64">
      <AdminSidebar
        siteName={settings['site.name']}
        user={{ name: user.name, email: user.email }}
      />
      {children}
    </div>
  );
}
