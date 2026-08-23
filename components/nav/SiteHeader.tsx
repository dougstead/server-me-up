import Link from "next/link";
import BurgerMenu from "@/components/nav/BurgerMenu";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950">
      <div className="flex items-center gap-4 px-6 py-4">
        <BurgerMenu />

        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-widest text-sky-400"
        >
          Server Me Up
        </Link>
      </div>
    </header>
  );
}
