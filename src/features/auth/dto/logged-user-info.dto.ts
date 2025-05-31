import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '../../../core/data/user/entities/enum-role';

export class LoggedUserInfoDto {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: "Nom de l'utilisateur",
    type: String,
  })
  username: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    type: String,
  })
  fullName: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    type: String,
  })
  role: ERole;

  @ApiProperty({
    description: 'Identifiant unique du membre',
    type: Number,
  })
  memberId?: number;

  @ApiProperty({
    description: 'Token JWT',
    type: String,
  })
  token: string;
}
