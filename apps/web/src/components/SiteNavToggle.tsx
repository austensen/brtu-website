import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const MOBILE_MQ = "(max-width: 47.9375rem)";

function subscribeMobile(onStoreChange: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  const onChange = () => onStoreChange();
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }
  mq.addListener(onChange);
  return () => mq.removeListener(onChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getMobileServerSnapshot() {
  return false;
}

export default function SiteNavToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);

  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  openRef.current = open;

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const btn = buttonRef.current;
    const header = btn?.closest("[data-site-header]");
    if (!header || !btn) return;
    if (isMobile) header.setAttribute("data-menu-enhanced", "");
    else header.removeAttribute("data-menu-enhanced");
  }, [isMobile]);

  useEffect(() => {
    const btn = buttonRef.current;
    const header = btn?.closest("[data-site-header]");
    if (!header || !btn) return;
    if (open) header.setAttribute("data-menu-open", "");
    else header.removeAttribute("data-menu-open");
  }, [open]);

  useEffect(() => {
    const toggle = buttonRef.current;
    if (!toggle) return;
    const header = toggle.closest("[data-site-header]");
    const nav = header?.querySelector<HTMLElement>("[data-site-nav]");
    if (!header || !nav) return;

    const onDocKeydown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !openRef.current) return;
      setOpen(false);
      toggle.focus();
    };

    const onNavClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.("a") && openRef.current) setOpen(false);
    };

    const onToggleClick = () => setOpen((v) => !v);

    document.addEventListener("keydown", onDocKeydown);
    nav.addEventListener("click", onNavClick);
    toggle.addEventListener("click", onToggleClick);
    return () => {
      document.removeEventListener("keydown", onDocKeydown);
      nav.removeEventListener("click", onNavClick);
      toggle.removeEventListener("click", onToggleClick);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="site-nav__toggle"
      aria-controls="site-nav"
      aria-expanded={open}
      hidden={!isMobile}
      data-site-nav-toggle
    >
      <span className="site-nav__toggle-icon" aria-hidden="true" />
      <span className="visually-hidden">Menu</span>
    </button>
  );
}
