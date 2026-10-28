import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import SettingsForm from '@/components/admin/SettingsForm';

export const metadata = { title: 'Pagina inicial' };
export const dynamic = 'force-dynamic';

export default async function AdminSitePage() {
  const settings = await getSettings();

  return (
    <main className="container-page space-y-8 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Pagina inicial</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Edite os textos que aparecem na tela de apresentacao do curso.
          </p>
        </div>

        <Link href="/" target="_blank" className="btn-ghost shrink-0">
          Ver o site
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="max-w-2xl">
        <SettingsForm settings={settings} />
      </div>
    </main>
  );
}
