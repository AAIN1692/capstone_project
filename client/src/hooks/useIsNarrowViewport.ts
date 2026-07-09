import { useEffect, useState } from "react";

/**
 * Returns true when the viewport width is below the given breakpoint (default 640px,
 * matching Tailwind's `sm`). Used to reduce chart tick-label clutter on narrow screens
 * without duplicating chart components for mobile vs desktop.
 */
export function useIsNarrowViewport(breakpoint = 640): boolean {
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    function handleResize() {
      setIsNarrow(window.innerWidth < breakpoint);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isNarrow;
}
