import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsEntity } from '../entities/news.entity';
import { NewsDocumentsEntity } from '../entities/news-documents.entity';
import { INewsService } from '../interfaces/news.service.interface';

@Injectable()
export class NewsService implements INewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
    @InjectRepository(NewsDocumentsEntity)
    private readonly newsDocumentRepository: Repository<NewsDocumentsEntity>,
  ) {}

  async create(entity: NewsEntity): Promise<number> {
    const res = await this.newsRepository.save(entity);
    return res.id;
  }
}
