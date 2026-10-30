"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function PublicPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public-page-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center border-2 border-error bg-error/10">
        <AlertTriangle className="h-6 w-6 text-error" />
      </div>
      <h2 className="mt-4 text-card-title text-ink">Página indisponível</h2>
      <p className="mt-2 max-w-sm text-body-sm text-ink-subtle">
        Não foi possível carregar esta página no momento. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 border-2 border-hairline-strong bg-surface-1 px-4 py-2.5 text-button text-ink transition-all hover:bg-surface-2 active:scale-95"
      >
        <RefreshCw className="h-4 w-4" />
        Recarregar
      </button>
    </div>
  );
}
