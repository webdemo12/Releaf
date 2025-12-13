import nodemailer from "nodemailer";

export const sendOTP = async (email, otp, type) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.trim() === "" || process.env.EMAIL_PASS.trim() === "") {
    console.error("Missing or invalid EMAIL_USER or EMAIL_PASS environment variables for email service");
    throw new Error("Email service not configured: Missing or invalid EMAIL_USER or EMAIL_PASS");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `OTP for ${type} Registration`,
      text: `Your OTP for ${type} registration is: ${otp}. It expires in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};
