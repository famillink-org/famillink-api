import { MailsTemplateEntity } from '../data/mails/entities/mails-template.entity';

export interface IMailsTemplateService {
  findByName(name: string): Promise<MailsTemplateEntity>;
}
