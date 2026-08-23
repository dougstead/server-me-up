import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Server Me Up -- questions, bug reports, or game suggestions.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Server Me Up
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">Contact</h1>

        <p className="mt-4 max-w-2xl text-slate-300">
          Have a question, spotted a bug, or want to suggest a game? Send us
          a message below.
        </p>

        <ContactForm />
      </div>
    </main>
  );
}
