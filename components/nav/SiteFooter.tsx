import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500">
        <span>
          &copy; {new Date().getFullYear()} Server Me Up
        </span>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/contact" className="hover:text-slate-300">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-slate-300">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-300">
            Terms of Use
          </Link>
        </nav>
      </div>
    </footer>
  );
}
