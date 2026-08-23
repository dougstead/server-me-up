"use client";

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "selfservr@gmail.com";

export default function ContactForm() {
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
  );
}
