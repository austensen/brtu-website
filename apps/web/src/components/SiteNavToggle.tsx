import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavMobileMatches } from "../hooks/useMediaQuery";

export default function SiteNavToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const isMobile = useNavMobileMatches();

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  useLayoutEffect(() => {
    const header = buttonRef.current?.closest("[data-site-header]");
    if (!header) return;

    if (!isMobile) {
      header.removeAttribute("data-menu-enhanced");
      header.removeAttribute("data-menu-open");
      return;
    }

    header.setAttribute("data-menu-enhanced", "");
    if (open) {
      header.setAttribute("data-menu-open", "");
    } else {
      header.removeAttribute("data-menu-open");
    }
  }, [isMobile, open]);

  useEffect(() => {
    if (!open || !isMobile) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !isMobile) return;

    const toggle = buttonRef.current;
    const header = toggle?.closest("[data-site-header]");
    const nav = header?.querySelector<HTMLElement>("[data-site-nav]");
    if (!nav) return;

    const onNavClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.("a")) setOpen(false);
    };

    nav.addEventListener("click", onNavClick);
    return () => nav.removeEventListener("click", onNavClick);
  }, [open, isMobile]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="site-nav__toggle"
      aria-controls="site-nav"
      aria-expanded={open && isMobile}
      hidden={!isMobile}
      data-site-nav-toggle
      onClick={() => setOpen((v) => !v)}
    >
      <span className="site-nav__toggle-icon" aria-hidden="true" />
      <span className="visually-hidden">Menu</span>
    </button>
  );
}
