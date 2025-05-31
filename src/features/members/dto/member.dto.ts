import { AddressDto } from './address.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SocialNetworkDto } from './social-network.dto';
import { DocumentDto } from '../../documents/dto/document.dto';
import { MemberEntity } from '../../../core/data/member/entities/member.entity';

export class MemberDto {
  @ApiProperty({
    description: "L'id unique du membre",
    type: 'number',
  })
  id?: number;

  @ApiProperty({
    description: 'Le code unique du membre',
    type: 'string',
  })
  code?: string;

  @ApiProperty({
    description: 'Le prénom du membre',
    type: 'string',
  })
  firstName?: string;

  @ApiProperty({
    description: 'Le nom de famille du membre',
    type: 'string',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Le surnom du membre',
    type: 'string',
  })
  nickName?: string;

  @ApiProperty({
    description: 'La date de naissance du membre',
    type: 'string',
  })
  birthDate?: Date;

  @ApiProperty({
    description: 'La date de décès du membre',
    type: 'string',
  })
  deathDate?: Date;

  @ApiProperty({
    description: "L'adresse du membre",
    type: AddressDto,
  })
  address?: AddressDto;

  @ApiProperty({
    description: 'Le numéro de téléphone du membre',
    type: 'string',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Le numéro de mobile du membre',
    type: 'string',
  })
  mobileNumber?: string;

  @ApiProperty({
    description: "L'email du membre",
    type: 'string',
  })
  email?: string;

  @ApiProperty({
    description: 'Le site web du membre',
    type: 'string',
  })
  website?: string;

  @ApiProperty({
    description: 'Les réseaux sociaux du membre',
    type: [SocialNetworkDto],
  })
  socialsNetworks?: SocialNetworkDto[];

  @ApiProperty({
    description: 'La biographie du membre',
    type: 'string',
  })
  biography?: string;

  @ApiProperty({
    description: 'La photo de profil du membre',
    type: DocumentDto,
  })
  photo?: DocumentDto;

  static fromEntity(entity: MemberEntity): MemberDto {
    const dto = new MemberDto();
    dto.id = entity.id;
    dto.code = entity.code;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.nickName = entity.nickName;
    dto.birthDate = entity.birthDate;
    dto.deathDate = entity.deathDate;
    dto.address = entity.address;
    dto.phoneNumber = entity.phoneNumber;
    dto.mobileNumber = entity.mobileNumber;
    dto.email = entity.email;
    dto.website = entity.website;
    dto.socialsNetworks = SocialNetworkDto.fromEntities(entity.socialsNetworks);
    dto.biography = entity.biography;
    if (entity.photo) {
      dto.photo = DocumentDto.fromEntity(entity.photo);
    }
    return dto;
  }

  static fromEntities(
    entities: MemberEntity[] | undefined,
  ): MemberDto[] | undefined {
    if (!entities) {
      return undefined;
    }
    return entities.map((entity) => MemberDto.fromEntity(entity));
  }
}
