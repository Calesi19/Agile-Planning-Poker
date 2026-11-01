import { useEffect, useRef } from "preact/hooks";
import type { ComponentChildren } from "preact";

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ComponentChildren;
}

// Native <dialog>: focus trap, Escape, and focus return all come with showModal().
export function Sheet({ title, onClose, children }: SheetProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      class="sheet"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
    >
      <h2 class="t-title mb-4">{title}</h2>
      {children}
    </dialog>
  );
}
