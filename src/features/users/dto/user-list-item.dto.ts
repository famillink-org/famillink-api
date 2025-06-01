import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../core/data/user/entities/user.entity';
import { ERole } from '../../../core/data/user/entities/enum-role';

/**
 * DTO pour un élément de la liste des utilisateurs
 *
 * Ce DTO contient les informations essentielles d'un utilisateur
 * qui sera affiché dans la liste paginée.
 */
export class UserListItemDto {
  @ApiProperty({
    description: 'Identifiant unique du membre',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: "Le nom de l'utilisateur (son email)",
    type: String,
  })
  userName: string;

  @ApiProperty({
    description: 'Son rôle',
    type: String,
  })
  role: ERole;

  @ApiProperty({
    description: 'Indique que cet utilisateur est ou non inactif',
    type: Boolean,
  })
  inactivated: boolean;

  @ApiProperty({
    description: "La cause de l'inactivation",
    type: String,
    required: false,
  })
  causeOfInactivation?: string;

  @ApiProperty({
    description: "La date de l'inactivation",
    type: Date,
    required: false,
  })
  inactivationDate?: Date;

  @ApiProperty({
    description: "L'identifiant du membre associé à cet utilisateur",
    type: Number,
    required: false,
  })
  memberId?: number;

  /**
   * Crée un UserListItemDto à partir d'un Iuser
   *
   * @param user L'entité utilisateur source
   * @returns Une instance de UserListItemDto
   */
  static fromEntity(user: UserEntity): UserListItemDto {
    const dto = new UserListItemDto();
    dto.id = user.id;
    dto.userName = user.userName;
    dto.role = user.role;
    dto.inactivated = user.inactivated;
    dto.causeOfInactivation = user.causeOfInactivation;
    dto.inactivationDate = user.inactivatedDate;
    dto.memberId = user.member?.id;
    return dto;
  }
}
