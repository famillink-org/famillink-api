import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DocumentEntity } from '../../document/entities/document.entity';
import { CommentEntity } from './comment.entity';

@Entity('smf3_comments_documents')
export class CommentDocumentsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => CommentEntity)
  @JoinColumn({ name: 'comment_id' })
  comment!: CommentEntity;

  @ManyToOne(() => DocumentEntity)
  @JoinColumn({ name: 'document_id' })
  document!: DocumentEntity;
}
