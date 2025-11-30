import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

export function getMailer(cnf, log) {
  const transport = nodemailer.createTransport({
    host: cnf.smtpHost,
    port: cnf.smtpPort,
    auth: {
      user: cnf.smtpUser,
      pass: cnf.smtpPass,
    },
  });

  return {
    sendMail: async (options) => {
      const mailGenerator = new Mailgen({
        theme: 'default',
        product: { name: 'My App', link: 'https://myapplink.com' },
      });
      const emailText = mailGenerator.generatePlaintext(options.mailGenContent);
      const emailHtml = mailGenerator.generate(options.mailGenContent);
      const info = await transport.sendMail({
        from: 'support.myapp.com',
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml,
      });
      log.debug(info, 'email sent');
    },
  };
}

export const accountVerificationEmailContent = (userName, verificationURL) => {
  return {
    body: {
      name: userName,
      intro: 'Welcome to the app! We are exited that you joined. ',
      action: {
        instructions: 'Click on the button to verify your email.',
        button: {
          color: '#22BC66',
          text: 'Verify your Email',
          link: verificationURL,
        },
      },
      outro: 'Need help, or have questions? Just reply to this email.',
    },
  };
};

export const forgotPasswordEmailContent = (userName, passwordResetUrl) => {
  return {
    body: {
      name: userName,
      intro: 'We got a request to reset your password. ',
      action: {
        instructions: 'To reset your password. Click on the button to verify your email.',
        button: {
          color: '#22BC66',
          text: 'Reset password',
          link: passwordResetUrl,
        },
      },
      outro: 'Need help, or have questions? Just reply to this email.',
    },
  };
};
