'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';

/** Mascara de telefone brasileiro: (11) 91234-5678 */
function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1');
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key) {
    return (event) => {
      const raw = event.target.value;
      setForm((prev) => ({ ...prev, [key]: key === 'phone' ? maskPhone(raw) : raw }));
      setFields((prev) => ({ ...prev, [key]: undefined }));
      setError('');
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setFields({});

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFields(data.fields || {});
        setError(data.error || 'Nao foi possivel criar sua conta');
        return;
      }

      router.replace(data.redirect || '/painel');
      router.refresh();
    } catch {
      setError('Falha de conexao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="name">
          Nome completo
        </label>
        <input
          id="name"
          className="input"
          autoComplete="name"
          placeholder="Maria Silva Santos"
          value={form.name}
          onChange={update('name')}
        />
        {fields.name && <p className="field-error">{fields.name}</p>}
      </div>

      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          className="input"
          autoComplete="email"
          placeholder="voce@email.com"
          value={form.email}
          onChange={update('email')}
        />
        {fields.email && <p className="field-error">{fields.email}</p>}
      </div>

      <div>
        <label className="label" htmlFor="phone">
          Telefone / WhatsApp
        </label>
        <input
          id="phone"
          inputMode="tel"
          className="input"
          autoComplete="tel"
          placeholder="(11) 91234-5678"
          value={form.phone}
          onChange={update('phone')}
        />
        {fields.phone && <p className="field-error">{fields.phone}</p>}
      </div>

      <div>
        <label className="label" htmlFor="password">
          Crie uma senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? 'text' : 'password'}
            className="input pr-11"
            autoComplete="new-password"
            placeholder="minimo de 6 caracteres"
            value={form.password}
            onChange={update('password')}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
            aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fields.password && <p className="field-error">{fields.password}</p>}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        {loading ? 'Criando conta...' : 'Criar conta e assistir'}
      </button>

      <p className="pt-2 text-center text-sm text-zinc-500">
        Ja tem conta?{' '}
        <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
          Entrar
        </Link>
      </p>
    </form>
  );
}
