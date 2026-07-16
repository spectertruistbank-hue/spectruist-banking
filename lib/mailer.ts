import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<void> => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Spectruist - Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">Spectruist Banking</h1>
        </div>
        <h2 style="color: #333;">Email Verification</h2>
        <p style="color: #666; font-size: 16px;">Your verification code is:</p>
        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; margin: 0;">${code}</p>
        </div>
        <p style="color: #666;">This code will expire in 24 hours.</p>
      </div>
    `
  });
};

export const sendTransferNotification = async (
  email: string,
  amount: number,
  senderName: string
): Promise<void> => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Spectruist - Money Received",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">Spectruist Banking</h1>
        </div>
        <h2 style="color: #333;">Money Received</h2>
        <p style="color: #666; font-size: 16px;"><strong>${senderName}</strong> sent you <strong style="color: #22c55e;">$${amount.toFixed(2)}</strong></p>
        <p style="color: #666;">Log in to your account to view the transfer details.</p>
      </div>
    `
  });
};

export const sendAdminDepositNotification = async (
  email: string,
  amount: number
): Promise<void> => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Spectruist - Balance Added",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">Spectruist Banking</h1>
        </div>
        <h2 style="color: #333;">Balance Updated</h2>
        <p style="color: #666; font-size: 16px;">An admin has added <strong style="color: #22c55e;">$${amount.toFixed(2)}</strong> to your account.</p>
      </div>
    `
  });
};
