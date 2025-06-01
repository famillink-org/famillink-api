import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from '../../member/entities/member.entity';

@Entity('smf3_news')
export class NewsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'author_id' })
  author!: MemberEntity;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ type: 'date', nullable: false })
  publicationDate!: Date;

  @Column({ type: 'date', nullable: true })
  updateDate?: Date;
}
