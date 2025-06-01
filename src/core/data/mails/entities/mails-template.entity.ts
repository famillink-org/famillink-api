import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('smf3_mails_templates')
export class MailsTemplateEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  subject!: string;

  @Column({ type: 'text', nullable: false })
  content: string;
}
