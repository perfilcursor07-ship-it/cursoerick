import AuthShell from '@/components/AuthShell';
import RegisterForm from '@/components/RegisterForm';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Criar conta' };
export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const settings = await getSettings();

  return (
    <AuthShell
      siteName={settings['site.name']}
      title="Criar sua conta"
      subtitle="Leva menos de um minuto e a primeira aula abre na hora."
    >
      <RegisterForm />
    </AuthShell>
  );
}
