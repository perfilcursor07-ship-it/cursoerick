'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, KeyRound, Loader2, Save, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '@/lib/client';

const emptySecrets = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ProfileForm({ user }) {
  const router = useRouter();
  const [form, setForm] = useState({ phone: user.phone || '', ...emptySecrets });
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFields((previous) => ({ ...previous, [key]: '' }));
    setError('');
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    setSaved(false);

    try {
      await api('/api/profile', { method: 'PATCH', body: form });
      setForm((previous) => ({ phone: previous.phone, ...emptySecrets }));
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-ink-700 px-5 py-4 sm:px-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
            <UserRound size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-white">Dados da conta</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Confira seu contato e atualize o telefone.</p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label className="label" htmlFor="profile-name">Nome</label>
            <input id="profile-name" className="input cursor-not-allowed text-zinc-400" value={user.name} readOnly />
          </div>
          <div>
            <label className="label" htmlFor="profile-email">E-mail</label>
            <input id="profile-email" type="email" className="input cursor-not-allowed text-zinc-400" value={user.email} readOnly />
            <p className="mt-1.5 text-xs text-zinc-600">O e-mail não pode ser alterado.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="profile-phone">Telefone / WhatsApp</label>
            <input
              id="profile-phone"
              inputMode="tel"
              autoComplete="tel"
              className="input"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              aria-invalid={Boolean(fields.phone)}
            />
            {fields.phone && <p className="field-error">{fields.phone}</p>}
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-ink-700 px-5 py-4 sm:px-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
            <KeyRound size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-white">Segurança</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Confirme a senha atual para salvar qualquer alteração.</p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="label" htmlFor="current-password">Senha atual</label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              className="input"
              value={form.currentPassword}
              onChange={(event) => update('currentPassword', event.target.value)}
              aria-invalid={Boolean(fields.currentPassword)}
              required
            />
            {fields.currentPassword && <p className="field-error">{fields.currentPassword}</p>}
          </div>

          <div className="border-t border-ink-700 pt-5">
            <h3 className="text-sm font-semibold text-zinc-200">Trocar senha</h3>
            <p className="mt-1 text-xs text-zinc-500">Deixe os campos abaixo vazios se quiser alterar somente o telefone.</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="new-password">Nova senha</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  value={form.newPassword}
                  onChange={(event) => update('newPassword', event.target.value)}
                  aria-invalid={Boolean(fields.newPassword)}
                />
                {fields.newPassword && <p className="field-error">{fields.newPassword}</p>}
              </div>
              <div>
                <label className="label" htmlFor="confirm-password">Confirme a nova senha</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  value={form.confirmPassword}
                  onChange={(event) => update('confirmPassword', event.target.value)}
                  aria-invalid={Boolean(fields.confirmPassword)}
                />
                {fields.confirmPassword && <p className="field-error">{fields.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {saved && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
              <Check size={16} /> Perfil atualizado com sucesso.
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-ink-700 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck size={15} className="shrink-0 text-brand-400" />
              Sua senha é armazenada com segurança.
            </p>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {busy ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
