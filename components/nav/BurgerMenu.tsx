"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { guides } from "@/lib/guides";

// TODO: replace with the real PayPal donation link once it's set up.
const PAYPAL_DONATE_URL = "#";

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGuidesExpanded, setIsGuidesExpanded] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-700 hover:border-sky-500"
      >
        <span className="h-0.5 w-5 bg-white" />
        <span className="h-0.5 w-5 bg-white" />
        <span className="h-0.5 w-5 bg-white" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <nav
        aria-label="Site menu"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform border-r border-slate-800 bg-slate-900 p-6 transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Menu
          </span>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-lg leading-none hover:border-sky-500"
          >
            ×
          </button>
        </div>

        <ul className="mt-8 space-y-1">
          <li>
            <Link
              href="/"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-3 font-medium text-white hover:bg-slate-800"
            >
              Can My Machine Run It?
            </Link>
          </li>

          <li>
            <button
              type="button"
              onClick={() => setIsGuidesExpanded((expanded) => !expanded)}
              aria-expanded={isGuidesExpanded}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left font-medium text-white hover:bg-slate-800"
            >
              Guides
              <span className="text-slate-400">
                {isGuidesExpanded ? "−" : "+"}
              </span>
            </button>

            {isGuidesExpanded && (
              <ul className="ml-3 mt-1 space-y-1 border-l border-slate-800 pl-3">
                {guides.map((guide) => (
                  <li key={guide.id}>
                    <Link
                      href={guide.href}
                      onClick={closeMenu}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      {guide.title}
                    </Link>
                  </li>
                ))}

                {guides.length === 0 && (
                  <li className="px-3 py-2 text-sm text-slate-500">
                    Coming soon
                  </li>
                )}
              </ul>
            )}
          </li>

          <li>
            <Link
              href="/contact"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-3 font-medium text-white hover:bg-slate-800"
            >
              Contact
            </Link>
          </li>

          <li>
            <a
              href={PAYPAL_DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-3 font-medium text-white hover:bg-slate-800"
            >
              Support Me
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
