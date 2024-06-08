const nodemailer = require("nodemailer");

const sendEmail = (recipientEmail, otp) => {
  const emailConfig = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS if true
    auth: {
      user: process.env.USER, // your mail or SMTP server username
      // your mail password or app password for gmail
      // to generate search "app password" in manage your google account settings
      pass: process.env.PASSWORD,
    },
  };

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport(emailConfig);

  // Email options
  const mailOptions = {
    from: {
      name: "Sahil Khan",
      user: process.env.USER,
    }, // Sender address
    to: recipientEmail, // recipient email or array of emails
    subject: "Verify your Email", // Subject line
    html: `<p>Your One Time Password (OTP) to verify your action is ${otp}</p>`, // HTML body
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error:", error);
    }
    console.log("Email sent:", info.response);
  });
};

module.exports = { sendEmail };
