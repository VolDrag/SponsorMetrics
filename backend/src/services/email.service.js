const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = async (email, otp, name) => {
  const mailOptions = {
    from: `"SponsorMetrics BD" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your SponsorMetrics Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to SponsorMetrics BD!</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"SponsorMetrics BD" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to SponsorMetrics BD!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">You're all set, ${name}!</h2>
        <p>Your account has been verified successfully.</p>
        <p>You can now log in and start using SponsorMetrics BD.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Log In Now</a>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};