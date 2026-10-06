import nodemailer from "nodemailer";

export function createGmailTransport() {
  const user = process.env.GMAIL_USER?.trim();
  // Google displays app passwords in spaced groups (often non-breaking spaces when copied); Gmail wants the bare 16 characters.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set to send emails.");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return { transporter, user };
}
