"use client";

import { useEffect, useRef, useState } from "react";
import { uiText } from "../content/strings.js";

const NAV_LINKS = [
  { href: "/", label: uiText.nav.links.home },
  { href: "/practice", label: uiText.nav.links.practice },
  { href: "/practice/tags", label: uiText.nav.links.tagPractice },
  { href: "/dashboard", label: uiText.nav.links.dashboard },
  { href: "/collections", label: uiText.nav.links.collections },
];

export default function PageHeader({ title, subtitle = "", children = null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    // `auth_session` is HttpOnly and not readable in JS. UI gating uses metadata cookie.
    setHasSession(document.cookie.includes("user_email="));
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    function onPointerDown(event) {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <section className="card">
      <div className="page-header-main">
        <div className="page-header-text">
          <h1>{title}</h1>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
        <div className="page-menu" ref={menuRef}>
          <button
            type="button"
            className="page-menu-button"
            aria-label={uiText.nav.menuAriaLabel}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="page-menu-icon" aria-hidden="true">
              &#9776;
            </span>
          </button>
          {menuOpen ? (
            <nav className="page-menu-panel" aria-label={uiText.nav.menuAriaLabel}>
              {NAV_LINKS.filter((link) => {
                const isPrivate = link.href === "/dashboard" || link.href === "/collections";
                return hasSession || !isPrivate;
              }).map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
