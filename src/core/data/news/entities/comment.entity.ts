import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from '../../member/entities/member.entity';
import { NewsEntity } from './news.entity';

@Entity('smf3_comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'author_id' })
  author!: MemberEntity;

  @ManyToOne(() => NewsEntity)
  @JoinColumn({ name: 'news_id' })
  news: NewsEntity;

  @ManyToOne(() => CommentEntity)
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: CommentEntity;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ type: 'date', nullable: false })
  publicationDate!: Date;

  @Column({ type: 'date', nullable: true })
  updateDate?: Date;
}
