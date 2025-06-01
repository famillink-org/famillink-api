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
import { ReactionTypeEntity } from './reaction-type.entity';

@Entity('smf3_reactions')
export class ReactionEntity {
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
  Comment?: CommentEntity;

  @ManyToOne(() => ReactionTypeEntity)
  @JoinColumn({ name: 'reaction_type_id' })
  reactionType: ReactionTypeEntity;

  @Column({ type: 'date', nullable: false })
  reactionDate!: Date;
}
