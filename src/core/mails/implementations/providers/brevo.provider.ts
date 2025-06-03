import {
  EmailResponse,
  IEmailsProvider,
} from '../../interfaces/mails-provider.interface';
import { TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import brevo = require('@getbrevo/brevo');
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class BrevoProvider implements IEmailsProvider {
  private readonly logger = new Logger(BrevoProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<EmailResponse> {
    const transactionalApi = new brevo.TransactionalEmailsApi();
    transactionalApi.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get<string>('BREVO_API_KEY') || '',
    );

    const emailData: brevo.SendSmtpEmail = {
      to: [{ email: to }],
      subject,
      sender: { name: "Krys'Info", email: 'dev-nau@krysinfo.fr' },
      htmlContent: content,
    };

    try {
      const result = await transactionalApi.sendTransacEmail(emailData);
      this.logger.log(`Email envoyé à ${to}`);
      return { success: true, messageId: result.body.messageId };
    } catch (error) {
      this.logger.error(`Erreur envoi email à ${to}`, error);
      console.dir(error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
}
