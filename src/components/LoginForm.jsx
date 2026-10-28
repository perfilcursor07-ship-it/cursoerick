'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  // So aceitamos caminhos internos aqui. Sem isso, um link como
  // /login?next=https://site-falso.com levaria o aluno para fora apos o login.
  const rawNext = params.get('next') || '';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key) {
    return (event) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFields(data.fields || {});
        setError(data.error || 'Nao foi possivel entrar');
        return;
      }

      router.replace(next || data.redirect || '/painel');
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
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input"
          placeholder="voce@email.com"
          value={form.email}
          onChange={update('email')}
        />
        {fields.email && <p className="field-error">{fields.email}</p>}
      </div>

      <div>
        <label className="label" htmlFor="password">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            className="input pr-11"
            placeholder="sua senha"
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
        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="pt-2 text-center text-sm text-zinc-500">
        Ainda nao tem conta?{' '}
        <Link href="/cadastro" className="font-semibold text-brand-300 hover:text-brand-200">
          Criar conta gratis
        </Link>
      </p>
    </form>
  );
}
