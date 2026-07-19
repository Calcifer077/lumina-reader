import { type RefObject, useEffect } from "react";

/**
 * Calls `handler` when a mouse/touch event happens outside of `ref`'s element.
 * Pass `active = false` to disable the listener (e.g. when a modal is closed).
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  active: boolean = true,
) {
  useEffect(() => {
    if (!active) return;

    // 'ref' contains the element outside of which we will detect the click
    const listener = (event: MouseEvent | TouchEvent) => {
      // we can access that element using 'ref.current'
      const el = ref.current;

      // If there is no 'ref' or 'ref' contains the element that was just clicked, don't do anything.
      if (!el || el.contains(event.target as Node)) return;

      // Escaped the guard clause (above), remove the modal
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, active]);
}
