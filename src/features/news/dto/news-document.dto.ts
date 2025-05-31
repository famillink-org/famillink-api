import { NewsDto } from './news.dto';
import { DocumentDto } from '../../documents/dto/document.dto';

export class NewsDocumentDto {
  id?: number;
  news: NewsDto;
  document: DocumentDto;
}
