"use client";

import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";

interface PasswordFormClientProps {
  slug: string;
}

export function PasswordFormClient({ slug }: PasswordFormClientProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/s/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError("Muitas tentativas. Aguarde 15 minutos e tente novamente.");
        } else if (res.status === 401) {
          setError("Senha incorreta");
        } else {
          setError(data.error || "Erro inesperado");
        }
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm border-2 border-hairline-strong bg-surface-1 p-8 shadow-[4px_4px_0px_var(--color-hairline-strong)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-hairline-strong bg-surface-2">
            <Lock className="h-6 w-6 text-ink-subtle" />
          </div>
          <h1 className="text-headline text-ink">Link protegido</h1>
          <p className="mt-1 text-body-sm text-ink-subtle">
            Digite a senha para acessar este link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-2 text-caption text-error">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="flex h-11 w-full items-center justify-center gap-2 border-2 border-black bg-primary text-button text-on-primary shadow-[3px_3px_0px_#000] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#000] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Acessar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
