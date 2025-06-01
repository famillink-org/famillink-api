import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NewsEntity } from './news.entity';
import { DocumentEntity } from '../../document/entities/document.entity';

@Entity('smf3_news_documents')
export class NewsDocumentsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => NewsEntity)
  @JoinColumn({ name: 'news_id' })
  news!: NewsEntity;

  @ManyToOne(() => DocumentEntity)
  @JoinColumn({ name: 'document_id' })
  document!: DocumentEntity;
}
