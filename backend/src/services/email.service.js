const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'SponsorMetrics BD Verification OTP',
    text: `Your SponsorMetrics BD verification OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your SponsorMetrics BD verification OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTPEmail,
};
