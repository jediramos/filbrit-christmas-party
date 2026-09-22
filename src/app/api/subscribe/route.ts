import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  email?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT;

  if (formspreeEndpoint) {
    try {
      const res = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, _subject: "Stevenage FilBrit Christmas Party signup" }),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error("Formspree error:", detail);
        return NextResponse.json(
          { error: "Could not save your email. Please try again later." },
          { status: 502 },
        );
      }
    } catch (err) {
      console.error("Formspree request failed:", err);
      return NextResponse.json(
        { error: "Could not reach the signup service." },
        { status: 502 },
      );
    }
  } else {
    // Local / unset-provider fallback: accept and log so the UI works without secrets.
    console.info("[subscribe] email captured (no FORMSPREE_ENDPOINT set):", email);
  }

  return NextResponse.json({ ok: true });
}
