import { Clock } from "lucide-react";

export default function ExpiredPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
          <Clock className="h-8 w-8 text-ink-subtle" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Este link expirou
        </h1>
        <p className="mt-2 text-sm text-ink-subtle">
          O link que você tentou acessar não está mais disponível.
        </p>
      </div>
    </div>
  );
}
