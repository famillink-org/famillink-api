import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from './injection-token';
import {
  EmailResponse,
  IEmailsProvider,
} from './interfaces/mails-provider.interface';
import { IMailsTemplateEngine } from './interfaces/mails-template.engine.interface';
import { IMailsTemplateService } from './interfaces/mails-template.service.interface';

export interface EmailData {
  to: string;
  templateName: string;
  templateData: Record<string, any>;
}

@Injectable()
export class MailsService {
  constructor(
    @Inject(INJECTION_TOKENS.EMAIL_PROVIDER)
    private readonly emailProvider: IEmailsProvider,
    @Inject(INJECTION_TOKENS.TEMPLATE_ENGINE)
    private readonly templateEngine: IMailsTemplateEngine,
    @Inject(INJECTION_TOKENS.TEMPLATE_REPOSITORY)
    private readonly templateRepository: IMailsTemplateService,
  ) {}

  async sendTemplatedEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      const template = await this.templateRepository.findByName(
        emailData.templateName,
      );
      const [renderedSubject, renderedContent] = await Promise.all([
        this.templateEngine.renderSubject(
          template.subject,
          emailData.templateData,
        ),
        this.templateEngine.render(template.content, emailData.templateData),
      ]);
      return await this.emailProvider.sendEmail(
        emailData.to,
        renderedSubject,
        renderedContent,
      );
    } catch (error) {
      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        error: error.message,
      };
    }
  }
}
