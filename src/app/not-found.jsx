import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-6">
      <div className="text-center">
        <p className="text-7xl font-black text-ink-700">404</p>
        <h1 className="mt-4 text-xl font-bold text-white">Pagina nao encontrada</h1>
        <p className="mt-2 text-sm text-zinc-500">
          O link que voce acessou nao existe ou foi removido.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Voltar para o inicio
        </Link>
      </div>
    </main>
  );
}
