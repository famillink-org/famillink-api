import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsEntity } from '../entities/news.entity';
import { NewsDocumentsEntity } from '../entities/news-documents.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
    @InjectRepository(NewsDocumentsEntity)
    private readonly newsDocumentRepository: Repository<NewsDocumentsEntity>,
  ) {}
}
