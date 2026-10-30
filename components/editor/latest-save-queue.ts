interface LatestSaveQueueOptions<T> {
  save: (value: T) => Promise<void>;
  onError: (error: unknown, value: T, isLatest: boolean) => void;
  onSuccess?: (value: T, isLatest: boolean) => void;
  mergePending?: (previous: T, next: T) => T;
}

/** Saves in order, retaining only the latest selection waiting behind a request. */
export function createLatestSaveQueue<T>({
  save,
  onError,
  onSuccess,
  mergePending,
}: LatestSaveQueueOptions<T>) {
  let pending: { value: T } | undefined;
  let running = false;
  const idleWaiters: Array<() => void> = [];
  function readPending(): { value: T } | undefined {
    return pending;
  }

  async function drain() {
    running = true;
    try {
      while (pending) {
        const current = pending;
        pending = undefined;
        try {
          await save(current.value);
          onSuccess?.(current.value, pending === undefined);
        } catch (error) {
          // A pending edit in a different field still needs the failed patch.
          // Its newer values always take precedence when retrying the merge.
          const next = readPending();
          if (next && mergePending) {
            pending = { value: mergePending(current.value, next.value) };
          }
          onError(error, current.value, pending === undefined);
        }
      }
    } finally {
      running = false;
      if (pending) void drain();
      else idleWaiters.splice(0).forEach((resolve) => resolve());
    }
  }

  return {
    enqueue(value: T) {
      pending = {
        value:
          pending && mergePending ? mergePending(pending.value, value) : value,
      };
      if (!running) void drain();
    },
    isIdle() {
      return !running && !pending;
    },
    whenIdle(): Promise<void> {
      return running || pending
        ? new Promise((resolve) => idleWaiters.push(resolve))
        : Promise.resolve();
    },
  };
}
