import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from './member.entity';
import { ERelationType } from './enum-relation-type';

@Entity('smf3_members_relations')
export class MembersRelationsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_1_id' })
  member1!: MemberEntity;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_2_id' })
  member2!: MemberEntity;

  @Column({
    type: 'enum',
    enum: ERelationType,
    default: ERelationType.Children,
  })
  relationType!: ERelationType;

  @Column({ type: 'int', nullable: true })
  rank?: number | null;
}
