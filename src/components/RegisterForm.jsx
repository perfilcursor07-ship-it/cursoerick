'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, AtSign, Eye, EyeOff, Loader2, LockKeyhole, Phone, UserPlus, UserRound } from 'lucide-react';

function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1');
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function FieldIcon({ children }) {
  return <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">{children}</span>;
}

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key) {
    return (event) => {
      const raw = event.target.value;
      setForm((prev) => ({ ...prev, [key]: key === 'phone' ? maskPhone(raw) : raw }));
      setFields((prev) => ({
        ...prev,
        [key]: undefined,
        ...(['password', 'confirmPassword'].includes(key) ? { confirmPassword: undefined } : {}),
      }));
      setError('');
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setFields({});

    if (!form.confirmPassword) {
      setFields({ confirmPassword: 'Confirme sua senha' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFields({ confirmPassword: 'As senhas nao conferem' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
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

  const inputClass = (key, extra = '') =>
    ['input auth-input pl-11', fields[key] ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/15' : '', extra].join(' ');

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="name">Nome completo</label>
        <div className="relative">
          <FieldIcon><UserRound size={17} /></FieldIcon>
          <input id="name" className={inputClass('name')} autoComplete="name" placeholder="Maria Silva Santos" value={form.name} onChange={update('name')} />
        </div>
        {fields.name && <p className="field-error">{fields.name}</p>}
      </div>

      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <div className="relative">
          <FieldIcon><AtSign size={17} /></FieldIcon>
          <input id="email" type="email" className={inputClass('email')} autoComplete="email" placeholder="voce@email.com" value={form.email} onChange={update('email')} />
        </div>
        {fields.email && <p className="field-error">{fields.email}</p>}
      </div>

      <div>
        <label className="label" htmlFor="phone">Telefone / WhatsApp</label>
        <div className="relative">
          <FieldIcon><Phone size={17} /></FieldIcon>
          <input id="phone" inputMode="tel" className={inputClass('phone')} autoComplete="tel" placeholder="(11) 91234-5678" value={form.phone} onChange={update('phone')} />
        </div>
        {fields.phone && <p className="field-error">{fields.phone}</p>}
      </div>

      <div>
        <label className="label" htmlFor="password">Crie uma senha</label>
        <div className="relative">
          <FieldIcon><LockKeyhole size={17} /></FieldIcon>
          <input id="password" type={showPass ? 'text' : 'password'} className={inputClass('password', 'pr-11')} autoComplete="new-password" placeholder="mínimo de 6 caracteres" value={form.password} onChange={update('password')} />
          <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-brand-300" aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fields.password && <p className="field-error">{fields.password}</p>}
      </div>

      <div>
        <label className="label" htmlFor="confirmPassword">Confirmar senha</label>
        <div className="relative">
          <FieldIcon><LockKeyhole size={17} /></FieldIcon>
          <input id="confirmPassword" type="password" className={inputClass('confirmPassword')} autoComplete="new-password" placeholder="Digite sua senha novamente" value={form.confirmPassword} onChange={update('confirmPassword')} />
        </div>
        {fields.confirmPassword && <p className="field-error">{fields.confirmPassword}</p>}
      </div>

      <button type="submit" disabled={loading} className="btn-primary mt-2 h-12 w-full rounded-xl text-sm shadow-[0_14px_30px_-14px_rgba(52,211,153,.8)]">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        {loading ? 'Criando conta...' : 'Criar conta e assistir'}
      </button>

      <p className="pt-1 text-center text-sm text-zinc-500">
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold text-brand-300 transition hover:text-brand-200">Entrar</Link>
      </p>
    </form>
  );
}
