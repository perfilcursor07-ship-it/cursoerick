'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { api } from '@/lib/client';

const GROUPS = [
  {
    title: 'Identidade e chamada',
    fields: [
      {
        key: 'site.name',
        label: 'Nome da plataforma',
        hint: 'Aparece no topo do site e na logo, em uma linha e com fonte de pincel. Em nomes com duas partes, a última fica laranja.',
      },
      {
        key: 'home.badge',
        label: 'Selo acima do titulo',
        hint: 'Ex: Turma aberta - comece hoje mesmo',
      },
      { key: 'home.title', label: 'Titulo principal da home', textarea: true },
      { key: 'home.subtitle', label: 'Texto de apoio', textarea: true },
      { key: 'home.cta', label: 'Texto do botao principal' },
    ],
  },
  {
    title: 'Plano Curso completo',
    fields: [
      { key: 'plan.full.price', label: 'Preco', hint: 'Ex: R$ 197 ou 12x R$ 19,70' },
      { key: 'plan.full.note', label: 'Observacao ao lado do preco', hint: 'Ex: pagamento unico' },
      {
        key: 'plan.full.url',
        label: 'Link de checkout',
        hint: 'Cole o link do seu gateway. Em branco, o botao leva para o cadastro.',
      },
    ],
  },
  {
    title: 'Plano Mentoria + ViralizeAI',
    fields: [
      { key: 'plan.pro.price', label: 'Preco', hint: 'Ex: R$ 497' },
      { key: 'plan.pro.note', label: 'Observacao ao lado do preco' },
      {
        key: 'plan.pro.url',
        label: 'Link de checkout',
        hint: 'Em branco, o botao leva para o cadastro.',
      },
      {
        key: 'plan.viralize.url',
        label: 'Link do ViralizeAI',
        hint: 'Aparece como "conhecer o ViralizeAI" no card. Deixe em branco para esconder.',
      },
    ],
  },
];

const FIELDS = GROUPS.flatMap((group) => group.fields);

export default function SettingsForm({ settings }) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: settings[field.key] || '' }), {})
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await api('/api/admin/settings', { method: 'PATCH', body: form });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {GROUPS.map((group, gi) => (
        <div key={group.title} className={gi > 0 ? 'border-t border-ink-700 pt-5' : ''}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-300">
            {group.title}
          </h2>

          <div className="space-y-4">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="label" htmlFor={field.key}>
                  {field.label}
                </label>
                {field.textarea ? (
                  <textarea
                    id={field.key}
                    rows={2}
                    className="input resize-y"
                    value={form[field.key]}
                    onChange={(e) => {
                      setForm({ ...form, [field.key]: e.target.value });
                      setSaved(false);
                    }}
                  />
                ) : (
                  <input
                    id={field.key}
                    className="input"
                    value={form[field.key]}
                    onChange={(e) => {
                      setForm({ ...form, [field.key]: e.target.value });
                      setSaved(false);
                    }}
                  />
                )}
                {field.hint && <p className="mt-1.5 text-xs text-zinc-600">{field.hint}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar alteracoes
        </button>

        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 size={15} /> Salvo
          </span>
        )}
      </div>
    </form>
  );
}
