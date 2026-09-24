"use client";

import { useEffect, useRef } from "react";

/**
 * Measures .page-shell and exposes --shell-w / --shell-h so the rotated
 * sun watermark can cover tall mobile layouts (width must grow with height).
 */
export function PageAtmosphere() {
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = anchorRef.current?.closest(".page-shell");
    if (!(shell instanceof HTMLElement)) return;

    const sync = () => {
      shell.style.setProperty("--shell-w", `${shell.scrollWidth}px`);
      shell.style.setProperty("--shell-h", `${shell.scrollHeight}px`);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(shell);
    window.addEventListener("resize", sync);
    // Fonts / late layout can change height after first paint
    window.addEventListener("load", sync);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("load", sync);
    };
  }, []);

  return (
    <>
      <div ref={anchorRef} className="page-watermark" aria-hidden="true" />
      <div className="page-gold-blur" aria-hidden="true" />
    </>
  );
}
