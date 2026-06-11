const nodeMailer = require("nodemailer");
const systemConfig = require(__path_configs + "system");

const sendEmail = async (options) => {
  var transport = nodeMailer.createTransport({
    host: systemConfig.STMP_HOST,
    port: systemConfig.STMP_PORT,
    auth: {
      user: systemConfig.STMP_EMAIL,
      pass: systemConfig.STMP_PASSWORD,
    },
  });

  let info = await transport.sendMail({
    from: `${systemConfig.FORM_NAME} <${systemConfig.STMP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
