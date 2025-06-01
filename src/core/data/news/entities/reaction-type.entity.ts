import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('smf3_reaction_types')
export class ReactionTypeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  emoji?: string;
}
