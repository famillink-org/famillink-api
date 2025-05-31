import { Module } from '@nestjs/common';
import * as process from 'node:process';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document/services/document.service';
import { MemberService } from './member/services/member.service';
import { NewsService } from './news/services/news.service';
import { UserService } from './user/services/user.service';
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
      useFactory: () => ({
        type: 'mysql',
        host: process.env['DB_HOST'],
        port: process.env['DB_PORT']
          ? parseInt(process.env['DB_PORT']) || 3306
          : 3306,
        username: process.env['DB_USER'],
        password: process.env['DB_PASSWORD'],
        database: process.env['DB_NAME'],
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
  ],
  exports: [
    DocumentService,
    MailsTemplateService,
    MemberService,
    NewsService,
    UserService,
    TokenService,
  ],
})
export class DataModule {}
