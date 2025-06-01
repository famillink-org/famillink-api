import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataModule } from './core/data/data.module';
import { CryptoModule } from './core/crypto/crypto.module';
import { MailsModule } from './core/mails/mails.module';
import { TokensModule } from './core/token/tokens.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { MembersModule } from './features/members/members.module';
import { validate } from './env.validation';
import { AppController } from './app.controller';
import { ImportModule } from './features/import/import.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [configuration],
    }),
    // Logger is configured in main.ts based on environment
    CryptoModule,
    DataModule,
    MailsModule.forRoot(),
    TokensModule,
    AuthModule,
    MembersModule,
    ImportModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
