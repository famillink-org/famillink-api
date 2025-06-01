import { ERelationType } from '../../../core/data/member/entities/enum-relation-type';
import { MemberDto } from './member.dto';
import { ApiProperty } from '@nestjs/swagger';

export class MembersRelationsDto {
  @ApiProperty({
    description: "L'id unique de cette relation",
    type: 'number',
  })
  id?: number;

  @ApiProperty({
    description: 'Le premier membre de la relation',
    type: MemberDto,
  })
  member1: MemberDto;

  @ApiProperty({
    description: 'Le second membre de la relation',
    type: MemberDto,
  })
  member2: MemberDto;

  @ApiProperty({
    description: 'le type de cette relation',
    enum: ERelationType,
    enumName: 'ERelationType',
  })
  relationType: ERelationType;

  @ApiProperty({
    description: 'Le rang de naissance pour les enfants ou le rang du conjoint',
    type: 'number',
  })
  rank?: number;
}
