const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  /* Creamos un transportador */
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  /* Definimos las opciones del email */
  const mailOptions = {
    from: "Jorge Mosqueda <mosqueda.ing@icloud.com>",
    to: options.email,
    subejct: options.subejct,
    text: options.message,
  };
  /* Enviamos el email */
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
