import { MemberDto } from '../../members/dto/member.dto';
import { NewsDto } from './news.dto';

export class CommentDto {
  id?: number;
  author: MemberDto;
  news: NewsDto;
  parentComment?: CommentDto;
  content: string;
  publicationDate: Date;
  updateDate?: Date;
}
