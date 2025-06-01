import { Module } from '@nestjs/common';
import { MembersController } from './controllers/members.controller';
import { MembersEngineService } from './services/members.engine.service';
import { CryptoModule } from '../../core/crypto/crypto.module';
import { DataModule } from '../../core/data/data.module';
import { TokensModule } from '../../core/token/tokens.module';
import { MailsModule } from '../../core/mails/mails.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CryptoModule,
    DataModule,
    TokensModule,
    MailsModule.forRoot(),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MembersController],
  providers: [MembersEngineService],
  exports: [MembersEngineService],
})
export class MembersModule {}
