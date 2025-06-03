import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailsTemplateEntity } from '../entities/mails-template.entity';
import { NotFoundException } from '../../../exceptions';
import { IMailsTemplateService } from '../../../mails/interfaces/mails-template.service.interface';

@Injectable()
export class MailsTemplateService implements IMailsTemplateService {
  constructor(
    @InjectRepository(MailsTemplateEntity)
    private readonly repository: Repository<MailsTemplateEntity>,
  ) {}

  async findByName(name: string): Promise<MailsTemplateEntity> {
    const template = await this.repository.findOne({ where: { name } });
    if (!template) {
      throw new NotFoundException(`Template ${name} not found`);
    }
    return template;
  }
}
