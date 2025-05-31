import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from '../../member/entities/member.entity';
import { NewsEntity } from './news.entity';
import { CommentEntity } from './comment.entity';

@Entity('smf3_votes')
export class VoteEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'author_id' })
  author!: MemberEntity;

  @ManyToOne(() => NewsEntity)
  @JoinColumn({ name: 'news_id' })
  news?: NewsEntity;

  @ManyToOne(() => CommentEntity)
  @JoinColumn({ name: 'comment_id' })
  comment?: CommentEntity;

  @Column({ type: 'smallint', nullable: false })
  value: number;

  @Column({ type: 'date', nullable: false })
  voteDate!: Date;
}
