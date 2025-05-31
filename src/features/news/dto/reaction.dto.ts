import { MemberDto } from '../../members/dto/member.dto';
import { NewsDto } from './news.dto';
import { CommentDto } from './comment.dto';

export class ReactionDto {
  id?: number;
  author: MemberDto;
  news?: NewsDto;
  comment?: CommentDto;
  reactionTypeId: number;
  reactionDate: Date;
}
