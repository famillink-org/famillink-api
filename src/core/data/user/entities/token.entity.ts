import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ETokenType } from './enum-token-type';

@Entity('smf3_tokens')
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  token!: string;

  @Column({
    type: 'enum',
    enum: ETokenType,
    default: ETokenType.Initialisation,
  })
  tokenType!: ETokenType;

  @Column({ type: 'datetime', nullable: false })
  expirationDatetime!: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  used!: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity | null;
}
