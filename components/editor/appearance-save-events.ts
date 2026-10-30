const APPEARANCE_SAVED_EVENT = "gatree:appearance-saved";

export function notifyAppearanceSaved(treeId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(APPEARANCE_SAVED_EVENT, { detail: { treeId } }),
  );
}

export function subscribeAppearanceSaved(treeId: string, onSaved: () => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ treeId?: string }>).detail;
    if (detail?.treeId === treeId) onSaved();
  };
  window.addEventListener(APPEARANCE_SAVED_EVENT, listener);
  return () => window.removeEventListener(APPEARANCE_SAVED_EVENT, listener);
}
