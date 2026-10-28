'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ compact = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="btn-ghost btn-sm"
      title="Sair da conta"
    >
      <LogOut size={14} />
      {!compact && <span>{loading ? 'Saindo...' : 'Sair'}</span>}
    </button>
  );
}
