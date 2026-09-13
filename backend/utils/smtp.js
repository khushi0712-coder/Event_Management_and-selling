import nodemailer from "nodemailer";

const normalize = (value = "") => String(value || "").trim();

export const getAdminRecipient = () =>
  normalize(process.env.ADMIN_EMAIL || process.env.SMTP_USER || "");

export const getVerifiedSender = () =>
  normalize(
    process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_FROM ||
      process.env.ADMIN_EMAIL ||
      process.env.SMTP_USER ||
      ""
  );

export const getTransporter = () => {
  const host = normalize(process.env.SMTP_HOST);
  const port = normalize(process.env.SMTP_PORT || "465");
  const portNumber = Number.parseInt(port, 10) || 465;
  const user = normalize(process.env.SMTP_USER);
  const pass = normalize(process.env.SMTP_PASSWORD || process.env.SMTP_PASS);
  const from = getVerifiedSender();
  const to = getAdminRecipient();

  if (!host || !user || !pass || !from || !to) {
    return null;
  }

  if (host !== "smtp.gmail.com") {
    return null;
  }

  const secure = portNumber === 465;
  const transporter = nodemailer.createTransport({
    host,
    port: portNumber,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: { rejectUnauthorized: true },
  });

  return { transporter, from, to };
};