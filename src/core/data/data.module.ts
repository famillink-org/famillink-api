import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document/services/document.service';
import { MemberService } from './member/services/member.service';
import { NewsService } from './news/services/news.service';
import { UserService } from './user/services/user.service';
import { USER_SERVICE_TOKEN } from './user/interfaces/user.service.token';
import { DOCUMENT_SERVICE_TOKEN } from './document/interfaces/document.service.token';
import { MEMBER_SERVICE_TOKEN } from './member/interfaces/member.service.token';
import { NEWS_SERVICE_TOKEN } from './news/interfaces/news.service.token';
import { TOKEN_SERVICE_TOKEN } from './user/interfaces/token.service.token';
import { MAILS_TEMPLATE_SERVICE_TOKEN } from '../mails/interfaces/mails-template.service.token';
import { AddressEntity } from './member/entities/address.entity';
import { MemberEntity } from './member/entities/member.entity';
import { MembersRelationsEntity } from './member/entities/member-relation.entity';
import { SocialNetworkEntity } from './member/entities/social-network.entity';
import { CommentEntity } from './news/entities/comment.entity';
import { CommentDocumentsEntity } from './news/entities/comment-document.entity';
import { NewsEntity } from './news/entities/news.entity';
import { NewsDocumentsEntity } from './news/entities/news-documents.entity';
import { ReactionEntity } from './news/entities/reaction.entity';
import { ReactionTypeEntity } from './news/entities/reaction-type.entity';
import { VoteEntity } from './news/entities/vote.entity';
import { TokenEntity } from './user/entities/token.entity';
import { UserEntity } from './user/entities/user.entity';
import { DocumentEntity } from './document/entities/document.entity';
import { CryptoModule } from '../crypto/crypto.module';
import { MailsTemplateEntity } from './mails/entities/mails-template.entity';
import { MailsTemplateService } from './mails/services/mails-template.service';
import { TokenService } from './user/services/token.service';

@Module({
  imports: [
    CryptoModule,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          DocumentEntity,
          MailsTemplateEntity,
          AddressEntity,
          MemberEntity,
          MembersRelationsEntity,
          SocialNetworkEntity,
          CommentEntity,
          CommentDocumentsEntity,
          NewsEntity,
          NewsDocumentsEntity,
          ReactionEntity,
          ReactionTypeEntity,
          VoteEntity,
          TokenEntity,
          UserEntity,
        ],
        synchronize: false,
        logging: 'all',
      }),
    }),
    TypeOrmModule.forFeature([
      DocumentEntity,
      MailsTemplateEntity,
      AddressEntity,
      MemberEntity,
      MembersRelationsEntity,
      SocialNetworkEntity,
      CommentEntity,
      CommentDocumentsEntity,
      NewsEntity,
      NewsDocumentsEntity,
      ReactionEntity,
      ReactionTypeEntity,
      VoteEntity,
      TokenEntity,
      UserEntity,
    ]),
  ],
  providers: [
    DocumentService,
    MailsTemplateService,
    MemberService,
    NewsService,
    UserService,
    TokenService,
    {
      provide: USER_SERVICE_TOKEN,
      useExisting: UserService,
    },
    {
      provide: DOCUMENT_SERVICE_TOKEN,
      useExisting: DocumentService,
    },
    {
      provide: MEMBER_SERVICE_TOKEN,
      useExisting: MemberService,
    },
    {
      provide: NEWS_SERVICE_TOKEN,
      useExisting: NewsService,
    },
    {
      provide: TOKEN_SERVICE_TOKEN,
      useExisting: TokenService,
    },
    {
      provide: MAILS_TEMPLATE_SERVICE_TOKEN,
      useExisting: MailsTemplateService,
    },
  ],
  exports: [
    DocumentService,
    MailsTemplateService,
    MemberService,
    NewsService,
    UserService,
    TokenService,
    USER_SERVICE_TOKEN,
    DOCUMENT_SERVICE_TOKEN,
    MEMBER_SERVICE_TOKEN,
    NEWS_SERVICE_TOKEN,
    TOKEN_SERVICE_TOKEN,
    MAILS_TEMPLATE_SERVICE_TOKEN,
  ],
})
export class DataModule {}
