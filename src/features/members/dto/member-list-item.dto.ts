import { ApiProperty } from '@nestjs/swagger';
import { MemberEntity } from '../../../core/data/member/entities/member.entity';

/**
 * DTO pour un élément de la liste des membres
 *
 * Ce DTO contient les informations essentielles d'un membre
 * qui sera affiché dans la liste paginée.
 */
export class MemberListItemDto {
  @ApiProperty({
    description: 'Identifiant unique du membre',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Code du membre',
    type: String,
  })
  code: string;

  @ApiProperty({
    description: 'Prénom du membre',
    type: String,
  })
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille du membre',
    type: String,
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'Surnom du membre',
    type: String,
    required: false,
  })
  nickName?: string;

  @ApiProperty({
    description: 'Date de naissance du membre',
    type: Date,
    required: false,
  })
  birthDate?: Date;

  @ApiProperty({
    description: 'Date de décès du membre',
    type: Date,
    required: false,
  })
  deathDate?: Date;

  @ApiProperty({
    description: 'Email du membre',
    type: String,
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Numéro de téléphone du membre',
    type: String,
    required: false,
  })
  phoneNumber?: string;

  /**
   * Crée un MemberListItemDto à partir d'un IMember
   *
   * @param member L'entité membre source
   * @returns Une instance de MemberListItemDto
   */
  static fromEntity(member: MemberEntity): MemberListItemDto {
    const dto = new MemberListItemDto();
    dto.id = member.id;
    dto.code = member.code;
    dto.firstName = member.firstName;
    dto.lastName = member.lastName;
    dto.nickName = member.nickName;
    dto.birthDate = member.birthDate;
    dto.deathDate = member.deathDate;
    dto.email = member.email;
    dto.phoneNumber = member.phoneNumber;
    return dto;
  }
}
