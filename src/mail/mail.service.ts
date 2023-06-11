import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

@Injectable()
export class MailService {
  private transporter;

  /**
   * all options in @createTransport for host/port must be taken from official mail webiste
   * password should be specific mail app password, not your account password
   */

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  async sendConfirmationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/confirmEmail/${token}`;

    try {
      await this.transporter.sendMail({
        from: EMAIL,
        to: email,
        subject: 'Email Confirmation',
        html: `Please click this url to confirm your email: <a href="${url}">${url}</a>`,
      });
    } catch (error) {
      console.log('error in sending confirmation email', error);
    }
  }
}
