import { useEffect, useRef } from "preact/hooks";
import type { ComponentChildren } from "preact";

interface RoomProps {
  title: string;
  flare?: boolean;
  children: ComponentChildren;
}

let isFirstRoute = true;

export function Room({ title, flare, children }: RoomProps) {
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = title;
  }, [title]);

  // Route changes swap the whole page, so screen readers and keyboards restart at its content.
  useEffect(() => {
    if (!isFirstRoute) main.current?.focus({ preventScroll: true });
    isFirstRoute = false;
  }, []);

  return (
    <div class="room bg-radial-[at_50%_40%] from-emerald-900 to-emerald-950">
      <div class={`lamp-flare ${flare ? "is-on" : ""}`} />
      <a class="skip-link" href="#main" onClick={(e) => {
        e.preventDefault();
        main.current?.focus();
      }}>
        Skip to content
      </a>
      <main id="main" ref={main} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
