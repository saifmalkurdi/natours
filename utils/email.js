const nodemailer = require('nodemailer');
const pug = require('pug');
const htmltotext = require('html-to-text');
const path = require('path');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Saif alkurdi <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // 1) Create a transporter
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          // user: process.env.SENDGRID_USERNAME,
          // pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const templatePath = path.join(__dirname, `../views/email/${template}.pug`);
    console.log('Template Path:', templatePath);
    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      //  To cnvert all the HTML to simple text
      text: htmltotext.fromString(html)
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);

    // 4) Send the actual email
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 min)'
    );
  }
};
