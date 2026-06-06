"use client";

import { useEffect, useRef } from "react";

export function RefractionCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.opacity = "1";
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
    };
    const onLeave = () => { el.style.opacity = "0"; };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="refraction-cursor"
      style={{ opacity: 0, left: "-999px", top: "-999px" }}
      aria-hidden="true"
    />
  );
}
