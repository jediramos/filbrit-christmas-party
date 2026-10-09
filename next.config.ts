import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The confirmation email attaches these PDFs, which are read from disk at runtime.
  outputFileTracingIncludes: {
    "/api/stripe/webhook": [
      "./public/terms-and-conditions.pdf",
      "./src/emails/attachments/*.pdf",
    ],
  },
};

export default nextConfig;
