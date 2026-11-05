import { useCallback, useRef } from 'react';

/**
 * Shakes an element to say "you can't continue yet".
 * Attach `ref` to the element and call `shake()`.
 */
export function useShake<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const shake = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // restart the animation
    el.classList.add('shake');
  }, []);

  return { ref, shake };
}
