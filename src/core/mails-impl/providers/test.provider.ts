import {
  EmailResponse,
  IEmailsProvider,
} from '../../mails-interface/mails-provider.interface';

export class TestProvider implements IEmailsProvider {
  async sendEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<EmailResponse> {
    console.log(`Email to ${to}: ${subject}`);
    return Promise.resolve({ success: true, messageId: 'test-123', content });
  }
}
