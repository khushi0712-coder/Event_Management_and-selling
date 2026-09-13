import nodemailer from "nodemailer";

const normalize = (value = "") => String(value || "").trim();

export const getTransporter = () => {
  const host = normalize(process.env.SMTP_HOST);
  const port = Number.parseInt(
    normalize(process.env.SMTP_PORT || "587"),
    10
  );

  const user = normalize(process.env.SMTP_USER);
  const pass = normalize(
    process.env.SMTP_PASSWORD || process.env.SMTP_PASS
  );

  const from = normalize(
    process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_FROM ||
      process.env.ADMIN_EMAIL ||
      user
  );

  if (!host || !user || !pass) {
    return null;
  }

  const secure = port === 465;

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      family: 4,
    }),
    from,
    to: user,
  };
};

export const sendMailWithTimeout = async (
  transporter,
  mailOptions,
  timeoutMs = 30000
) => {
  try {
    await transporter.verify();
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("[smtp] Gmail connection/send failed", {
      code: error?.code,
      command: error?.command,
      message: error?.message,
      name: error?.name,
      timeoutMs,
    });
    throw error;
  }
};