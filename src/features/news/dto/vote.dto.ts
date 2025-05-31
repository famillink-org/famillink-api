import { MemberDto } from '../../members/dto/member.dto';
import { NewsDto } from './news.dto';
import { CommentDto } from './comment.dto';

export interface VoteDto {
  id?: number;
  author: MemberDto;
  news?: NewsDto;
  comment?: CommentDto;
  voteDate: Date;
  value: number;
}
