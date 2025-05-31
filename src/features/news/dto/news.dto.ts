import { MemberDto } from '../../members/dto/member.dto';

export class NewsDto {
  id?: number;
  author: MemberDto;
  title: string;
  content: string;
  publicationDate: Date;
  updateDate?: Date;
}
