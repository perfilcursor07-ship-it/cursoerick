import { Suspense } from 'react';
import AuthShell from '@/components/AuthShell';
import LoginForm from '@/components/LoginForm';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Entrar' };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const settings = await getSettings();

  return (
    <AuthShell
      siteName={settings['site.name']}
      title="Bem-vindo de volta"
      subtitle="Entre para continuar de onde voce parou."
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-ink-800/50" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
