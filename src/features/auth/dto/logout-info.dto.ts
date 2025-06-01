import { ApiProperty } from '@nestjs/swagger';

export class LogoutInfoDto {
  @ApiProperty({
    description: 'Le token JWT',
    type: String,
  })
  token: string;

  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    type: Number,
  })
  userId: number;
}
