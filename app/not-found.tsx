import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 text-center">
      <div className="border-2 border-hairline-strong bg-surface-1 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-tertiary">
        404
      </div>

      <h1 className="mt-6 text-display-md text-ink">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-body text-ink-subtle">
        A página que você está procurando não existe ou foi movida.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 border-2 border-black bg-brutal-yellow px-6 py-3 text-button text-black shadow-[4px_4px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000]"
        >
          Ir para o dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border-2 border-hairline-strong bg-surface-1 px-6 py-3 text-button text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
