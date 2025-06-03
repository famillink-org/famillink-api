import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { MailsTemplateEntity } from '../data/mails/entities/mails-template.entity';
import { LiquidTemplateEngine } from './implementations/engines/liquid-template.engine';
import { BrevoProvider } from './implementations/providers/brevo.provider';
import { TestProvider } from './implementations/providers/test.provider';
import { MailsTemplateService } from '../data/mails/services/mails-template.service';
import { DataModule } from '../data/data.module';
import { INJECTION_TOKENS } from './injection-token';
import { MailsService } from './mails.service';

@Module({})
export class MailsModule {
  static forRoot(): DynamicModule {
    return {
      module: MailsModule,
      imports: [DataModule, TypeOrmModule.forFeature([MailsTemplateEntity])],
      providers: [
        {
          provide: INJECTION_TOKENS.EMAIL_PROVIDER,
          useFactory: (configService: ConfigService) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const provider = configService.get('EMAIL_PROVIDER');
            return provider === 'brevo'
              ? new BrevoProvider(configService)
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
        // Make implementations available for other modules
        LiquidTemplateEngine,
        BrevoProvider,
        TestProvider,
      ],
      exports: [MailsService],
    };
  }
}
