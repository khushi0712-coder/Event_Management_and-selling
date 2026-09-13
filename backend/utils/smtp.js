import nodemailer from "nodemailer";

const normalize = (value = "") => String(value || "").trim();

export const getTransporter = () => {
  const host = normalize(process.env.SMTP_HOST);
  const port = Number.parseInt(normalize(process.env.SMTP_PORT || "587"), 10);
  const user = normalize(process.env.SMTP_USER);
  const pass = normalize(process.env.SMTP_PASSWORD || process.env.SMTP_PASS);
  const from = normalize(process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM || process.env.ADMIN_EMAIL || user);

  if (!host || !user || !pass) {
    return null;
  }

  const secure = port === 465;

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: !secure,
      auth: { user, pass },
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
      family: 4,
      tls: {
        rejectUnauthorized: true,
        servername: host,
      },
    }),
    from,
    to: user,
  };
};

export const sendMailWithTimeout = async (transporter, mailOptions, timeoutMs = 15000) => {
  return Promise.race([
    transporter.sendMail(mailOptions),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`SMTP connection timed out after ${Math.round(timeoutMs / 1000)} seconds.`)), timeoutMs);
    }),
  ]);
};
