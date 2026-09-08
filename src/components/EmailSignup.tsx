"use client";

import { useState, type FormEvent } from "react";

type Props = {
  blurb: string;
};

type Status = "idle" | "loading" | "success" | "error";

export function EmailSignup({ blurb }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("You’re on the list — we’ll keep you posted.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="signup-panel mx-auto max-w-xl">
      <p className="text-center text-base leading-relaxed text-[var(--ivory-soft)]">
        {blurb}
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        noValidate
      >
        <label className="sr-only" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") setStatus("idle");
          }}
          placeholder="you@example.com"
          className="min-h-12 flex-1 border border-[var(--pine-line)] bg-[var(--evergreen-deep)]/60 px-4 text-[var(--ivory)] outline-none transition placeholder:text-[var(--mist)] focus:border-[var(--gold)]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-12 shrink-0 bg-[var(--crimson)] px-6 text-sm font-medium uppercase tracking-[0.14em] text-[var(--ivory)] transition hover:bg-[var(--crimson-soft)] disabled:cursor-wait disabled:opacity-70"
        >
          {status === "loading" ? "Sending…" : "Keep me updated"}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-[var(--mist)]">
        We’ll only email about this event. Unsubscribe anytime.
      </p>

      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            status === "success" ? "text-[var(--gold)]" : "text-[var(--crimson-soft)]"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
