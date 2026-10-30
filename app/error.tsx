"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  const isDbError =
    error.message?.includes("Prisma") ||
    error.message?.includes("database") ||
    error.message?.includes("connect");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center border-2 border-error bg-error/10">
        <AlertTriangle className="h-7 w-7 text-error" />
      </div>
      <h2 className="mt-5 text-headline text-ink">Algo deu errado</h2>
      <p className="mt-2 max-w-md text-body-sm text-ink-subtle">
        {isDbError
          ? "Não foi possível conectar ao banco de dados. Tente novamente em alguns instantes."
          : "Ocorreu um erro inesperado. Nossa equipe foi notificada."}
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-brutal-yellow px-5 py-2.5 text-button text-black shadow-[3px_3px_0px_#000] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#000]"
      >
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </button>
      {error.digest && (
        <p className="mt-4 text-caption text-ink-tertiary">
          Código: {error.digest}
        </p>
      )}
    </div>
  );
}
