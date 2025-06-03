import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../entities/document.entity';
import { IDocumentService } from '../interfaces/document.service.interface';

@Injectable()
export class DocumentService implements IDocumentService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly repository: Repository<DocumentEntity>,
  ) {}

  async create(entity: DocumentEntity): Promise<number> {
    const res = await this.repository.save(entity);
    return res.id;
  }
}
