/**
 * Generate a QR code PNG for the live site URL.
 * Usage: NEXT_PUBLIC_SITE_URL=https://example.vercel.app npm run qr
 */
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

async function main() {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) {
    console.error(
      "Set NEXT_PUBLIC_SITE_URL to your deployed HTTPS URL, then re-run npm run qr",
    );
    process.exit(1);
  }

  const outDir = path.join(__dirname, "..", "public");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "qr-code.png");

  await QRCode.toFile(outFile, url, {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0c2e24", light: "#f3ebe0" },
  });

  console.log(`QR code written to ${outFile}`);
  console.log(`Encodes: ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
