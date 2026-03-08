import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.UKRNET_EMAIL,
    pass: process.env.UKRNET_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, verificationToken) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/auth/verify/${verificationToken}`;

  await transporter.sendMail({
    from: process.env.UKRNET_EMAIL,
    to: email,
    subject: "Please verify your email",
    html: `<p>Click the link below to verify your email address:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>`,
  });
};
