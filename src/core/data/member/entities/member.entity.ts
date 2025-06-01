import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DocumentEntity } from '../../document/entities/document.entity';
import { AddressEntity } from './address.entity';
import { SocialNetworkEntity } from './social-network.entity';

@Entity('smf3_members')
export class MemberEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  code!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  firstName!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickName?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'date', nullable: true })
  deathDate?: Date;

  @OneToOne(() => AddressEntity, { cascade: true, nullable: true })
  @JoinColumn({ name: 'address_id' })
  address?: AddressEntity;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  mobileNumber?: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  website?: string;

  @OneToMany(
    () => SocialNetworkEntity,
    (socialNetwork) => socialNetwork.member,
    { cascade: ['insert', 'update', 'remove'], nullable: true },
  )
  socialsNetworks?: SocialNetworkEntity[];

  @Column({ type: 'text', nullable: true })
  biography?: string;

  @OneToOne(() => DocumentEntity, { nullable: true })
  @JoinColumn({ name: 'photo_id' })
  photo?: DocumentEntity;
}
