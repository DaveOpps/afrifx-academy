import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:5173';

// Builds the certificate PDF entirely in memory and returns the raw bytes
// (Uint8Array). No filesystem writes — the PDF is streamed/regenerated on demand,
// so it works on hosts without persistent disk.
export async function generateCertBytes({ name, course, date, certId, verifyCode }) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([841.89, 595.28]); // A4 landscape
  const { width, height } = page.getSize();

  const boldFont   = await doc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);
  const italicFont  = await doc.embedFont(StandardFonts.HelveticaOblique);

  const gold  = rgb(0.784, 0.659, 0.298);
  const green = rgb(0.102, 0.420, 0.235);
  const dark  = rgb(0.051, 0.051, 0.051);
  const white = rgb(1, 1, 1);

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.97, 0.94) });

  // Gold border outer
  page.drawRectangle({ x: 12, y: 12, width: width - 24, height: height - 24, borderColor: gold, borderWidth: 3, color: rgb(0.98, 0.97, 0.94) });
  // Green border inner
  page.drawRectangle({ x: 22, y: 22, width: width - 44, height: height - 44, borderColor: green, borderWidth: 1.5, color: rgb(0.98, 0.97, 0.94) });

  // Header bar
  page.drawRectangle({ x: 22, y: height - 120, width: width - 44, height: 98, color: green });

  // Academy name
  page.drawText('AfriFX', { x: 60, y: height - 65, font: boldFont, size: 36, color: gold });
  page.drawText('ACADEMY', { x: 60, y: height - 90, font: boldFont, size: 14, color: white, characterSpacing: 6 });

  // Gold separator
  page.drawLine({ start: { x: 60, y: height - 132 }, end: { x: width - 60, y: height - 132 }, thickness: 1.5, color: gold });

  // CERTIFICATE title
  const certTitle = 'CERTIFICATE';
  const titleSize = 48;
  const titleWidth = boldFont.widthOfTextAtSize(certTitle, titleSize);
  page.drawText(certTitle, { x: (width - titleWidth) / 2, y: height - 185, font: boldFont, size: titleSize, color: green });

  const sub = 'OF PARTICIPATION';
  const subWidth = regularFont.widthOfTextAtSize(sub, 13);
  page.drawText(sub, { x: (width - subWidth) / 2, y: height - 205, font: regularFont, size: 13, color: gold, characterSpacing: 4 });

  // Subtitle line
  page.drawLine({ start: { x: 180, y: height - 218 }, end: { x: width - 180, y: height - 218 }, thickness: 0.5, color: gold });

  // Presented to
  const presText = 'This certificate is proudly presented to';
  const presWidth = regularFont.widthOfTextAtSize(presText, 12);
  page.drawText(presText, { x: (width - presWidth) / 2, y: height - 250, font: regularFont, size: 12, color: dark });

  // Recipient name
  const nameSize = 32;
  const nameWidth = boldFont.widthOfTextAtSize(name, nameSize);
  page.drawText(name, { x: (width - nameWidth) / 2, y: height - 295, font: boldFont, size: nameSize, color: green });

  // Name underline
  page.drawLine({ start: { x: (width - nameWidth) / 2 - 10, y: height - 300 }, end: { x: (width + nameWidth) / 2 + 10, y: height - 300 }, thickness: 1, color: gold });

  // Body text
  const bodyLines = [
    `for successfully participating in the`,
    `${course}`,
    `held on ${date}.`,
  ];
  let yBody = height - 330;
  bodyLines.forEach((line, i) => {
    const font = i === 1 ? boldFont : regularFont;
    const size = i === 1 ? 13 : 11;
    const lw = font.widthOfTextAtSize(line, size);
    page.drawText(line, { x: (width - lw) / 2, y: yBody, font, size, color: dark });
    yBody -= 20;
  });

  // Tagline
  const tagline = 'We commend your commitment to enhancing your knowledge and skills in the Forex market.';
  const tag2    = 'Keep Learning. Keep Growing. Keep Trading.';
  const tW = regularFont.widthOfTextAtSize(tagline, 10);
  const t2W = boldFont.widthOfTextAtSize(tag2, 11);
  page.drawText(tagline, { x: (width - tW) / 2, y: height - 395, font: regularFont, size: 10, color: dark });
  page.drawText(tag2,    { x: (width - t2W) / 2, y: height - 415, font: boldFont,   size: 11, color: green });

  // Separator
  page.drawLine({ start: { x: 60, y: height - 435 }, end: { x: width - 60, y: height - 435 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });

  // Signature area
  page.drawText('Nana Kwaku Owoahene', { x: width / 2 - 80, y: height - 460, font: boldFont, size: 11, color: dark });
  page.drawText('CEO, AFRIFX ACADEMY', { x: width / 2 - 68, y: height - 475, font: italicFont, size: 9, color: rgb(0.4, 0.4, 0.4) });
  page.drawLine({ start: { x: width / 2 - 90, y: height - 453 }, end: { x: width / 2 + 90, y: height - 453 }, thickness: 0.5, color: dark });

  // QR code → online verification page (bottom-right)
  if (verifyCode) {
    const verifyUrl = `${PUBLIC_URL}/verify/${verifyCode}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 240, color: { dark: '#0d3d24', light: '#fbfaf6' } });
    const qrImg = await doc.embedPng(qrDataUrl);
    const qrSize = 76;
    const qrX = width - 60 - qrSize;
    const qrY = 52;
    page.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize });
    const scanLabel = 'Scan to verify';
    const slW = regularFont.widthOfTextAtSize(scanLabel, 7);
    page.drawText(scanLabel, { x: qrX + (qrSize - slW) / 2, y: qrY + qrSize + 4, font: regularFont, size: 7, color: rgb(0.4, 0.4, 0.4) });
    const codeLabel = `Verify: ${verifyCode}`;
    const clW = regularFont.widthOfTextAtSize(codeLabel, 6.5);
    page.drawText(codeLabel, { x: qrX + (qrSize - clW) / 2, y: qrY - 10, font: regularFont, size: 6.5, color: rgb(0.5, 0.5, 0.5) });
  }

  // Cert ID
  page.drawText(`Certificate ID: ${certId}`, { x: 40, y: 32, font: regularFont, size: 7, color: rgb(0.6, 0.6, 0.6) });
  page.drawText(`Issued: ${date}`, { x: width / 2 - 40, y: 32, font: regularFont, size: 7, color: rgb(0.6, 0.6, 0.6) });

  return doc.save(); // Uint8Array of the PDF
}
