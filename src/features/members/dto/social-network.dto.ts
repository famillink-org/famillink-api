import { ESocialNetworkType } from '../../../core/data/member/entities/enum-social-network-type';
import { MemberDto } from './member.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SocialNetworkEntity } from '../../../core/data/member/entities/social-network.entity';

export class SocialNetworkDto {
  @ApiProperty({
    description: "l'id unique",
    type: 'number',
  })
  id?: number;

  @ApiProperty({
    description: 'le membre associé à ce réseau social',
    type: MemberDto,
  })
  member: MemberDto;

  @ApiProperty({
    description: 'le type de ce réseau social',
    enum: ESocialNetworkType,
    enumName: 'ESocialNetworkType',
  })
  socialNetworkType: ESocialNetworkType;

  @ApiProperty({
    description: 'La valeur du réseau social',
    type: 'string',
  })
  value: string;

  static fromEntity(entity: SocialNetworkEntity): SocialNetworkDto {
    const dto = new SocialNetworkDto();
    dto.id = entity.id;
    dto.member = MemberDto.fromEntity(entity.member);
    dto.socialNetworkType = entity.socialNetworkType;
    dto.value = entity.value;
    return dto;
  }

  static fromEntities(
    entities: SocialNetworkEntity[] | undefined,
  ): SocialNetworkDto[] | undefined {
    if (!entities) {
      return undefined;
    }
    return entities.map((entity) => SocialNetworkDto.fromEntity(entity));
  }
}
