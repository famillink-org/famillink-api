import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('smf3_addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  street?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  complement?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  country?: string;
}
