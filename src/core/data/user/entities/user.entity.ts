import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from '../../member/entities/member.entity';
import { ERole } from './enum-role';

@Entity('smf3_users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  userName!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ type: 'enum', enum: ERole, default: ERole.User })
  role!: ERole;

  @Column({ type: 'boolean', nullable: false, default: false })
  inactivated!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  causeOfInactivation?: string;

  @Column({ type: 'date', nullable: true })
  inactivatedDate?: Date;

  @OneToOne(() => MemberEntity, { nullable: true })
  @JoinColumn({ name: 'member_id' })
  member?: MemberEntity;
}
