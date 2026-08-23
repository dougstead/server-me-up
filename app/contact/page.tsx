"use client";

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "servermeup@gmail.com";

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(message)}`;

    window.location.href = mailtoUrl;
  }

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

        <form onSubmit={handleSubmit} className="mt-10 max-w-xl space-y-6">
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-slate-200"
            >
              Subject
            </label>

            <input
              id="subject"
              type="text"
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="What's this about?"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-slate-200"
            >
              Message
            </label>

            <textarea
              id="message"
              required
              rows={8}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Let us know what's on your mind..."
              className="mt-2 w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
            >
              Send
            </button>

            <p className="mt-3 text-sm text-slate-400">
              Clicking Send opens your email app with this message pre-filled,
              addressed to {CONTACT_EMAIL}.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
