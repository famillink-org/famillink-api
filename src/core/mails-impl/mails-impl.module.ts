import { Module } from '@nestjs/common';
import { LiquidTemplateEngine } from './engines/liquid-template.engine';
import { BrevoProvider } from './providers/brevo.provider';
import { TestProvider } from './providers/test.provider';

@Module({
  exports: [LiquidTemplateEngine, BrevoProvider, TestProvider],
  providers: [LiquidTemplateEngine, BrevoProvider, TestProvider],
})
export class MailsImplModule {}
