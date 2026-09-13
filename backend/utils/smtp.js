import nodemailer from "nodemailer";

const normalize = (value = "") => String(value || "").trim();

export const getTransporter = () => {
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

  if (!user || !pass) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });

  return {
    transporter,
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
      host: transporter?.options?.host || "smtp.gmail.com",
      port: transporter?.options?.port || 587,
    });
    throw error;
  }
};