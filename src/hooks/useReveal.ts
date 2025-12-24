// src/hooks/useReveal.ts
import { useEffect, useRef } from "react";

/**
 * usage:
 * const ref = useReveal("animate-fade");
 * <div ref={ref}>...</div>
 *
 * Add the CSS classes in index.css / tailwind config (we use Tailwind utility classes in examples).
 */
export default function useReveal(className = "reveal-visible") {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add(className);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [className]);

  return ref;
}
