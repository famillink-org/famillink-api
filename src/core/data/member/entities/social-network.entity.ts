import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from './member.entity';
import { ESocialNetworkType } from './enum-social-network-type';

@Entity('smf3_social_networks')
export class SocialNetworkEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => MemberEntity, (member) => member.socialsNetworks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member!: MemberEntity;

  @Column({
    type: 'enum',
    enum: ESocialNetworkType,
    default: ESocialNetworkType.Facebook,
  })
  socialNetworkType!: ESocialNetworkType;

  @Column({ type: 'varchar', length: 255, nullable: false })
  value!: string;
}
