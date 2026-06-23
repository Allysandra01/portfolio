import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = typeof (e as any).matches === "boolean" ? (e as any).matches : mql.matches;
      setIsMobile(matches);
    };

    // initialize state from matchMedia
    setIsMobile(mql.matches);

    // add listener with feature-detection for older browsers
    if (typeof (mql as any).addEventListener === "function") {
      (mql as any).addEventListener("change", onChange);
      return () => (mql as any).removeEventListener("change", onChange);
    }

    if (typeof (mql as any).addListener === "function") {
      (mql as any).addListener(onChange);
      return () => (mql as any).removeListener(onChange);
    }
  }, []);

  return isMobile;
}
