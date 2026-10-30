"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const english = usePathname().startsWith("/en/");
  useEffect(() => {
    console.error("[dashboard-error]", error);
  }, [error]);

  const isDbError =
    error.message?.includes("Prisma") ||
    error.message?.includes("database") ||
    error.message?.includes("connect");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-error/25 bg-error/10">
        <AlertTriangle className="h-6 w-6 text-error" />
      </div>
      <h2 className="mt-6 text-balance text-2xl font-semibold tracking-[-.04em] text-ink">
        {english
          ? isDbError
            ? "Service unavailable"
            : "Unexpected error"
          : isDbError
            ? "Serviço indisponível"
            : "Erro inesperado"}
      </h2>
      <p className="mt-2 max-w-md text-ink-subtle text-sm leading-[1.5]">
        {english
          ? "We couldn't load this page. Please try again."
          : "Não foi possível carregar esta página. Tente novamente."}
      </p>
      <button
        onClick={reset}
        className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-product-accent px-6 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-product-accent/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <RefreshCw className="h-4 w-4" />
        {english ? "Try again" : "Tentar novamente"}
      </button>
    </div>
  );
}
