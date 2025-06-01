import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { MailsTemplateEntity } from '../data/mails/entities/mails-template.entity';
import { INJECTION_TOKENS } from './injection-token';
import { LiquidTemplateEngine } from '../mails-impl/engines/liquid-template.engine';
import { MailsService } from './mails.service';
import { BrevoProvider } from '../mails-impl/providers/brevo.provider';
import { TestProvider } from '../mails-impl/providers/test.provider';
import { MailsImplModule } from '../mails-impl/mails-impl.module';
import { MailsTemplateService } from '../data/mails/services/mails-template.service';
import { DataModule } from '../data/data.module';

@Module({})
export class MailsModule {
  static forRoot(): DynamicModule {
    return {
      module: MailsModule,
      imports: [
        DataModule,
        MailsImplModule,
        TypeOrmModule.forFeature([MailsTemplateEntity]),
      ],
      providers: [
        {
          provide: INJECTION_TOKENS.EMAIL_PROVIDER,
          useFactory: (configService: ConfigService) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const provider = configService.get('EMAIL_PROVIDER');
            return provider === 'brevo'
              ? new BrevoProvider()
              : new TestProvider();
          },
          inject: [ConfigService],
        },
        {
          provide: INJECTION_TOKENS.TEMPLATE_ENGINE,
          useClass: LiquidTemplateEngine,
        },
        MailsTemplateService,
        {
          provide: INJECTION_TOKENS.TEMPLATE_REPOSITORY,
          useExisting: MailsTemplateService,
        },
        MailsService,
      ],
      exports: [MailsService],
    };
  }
}
