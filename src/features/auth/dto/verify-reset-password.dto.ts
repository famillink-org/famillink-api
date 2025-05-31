import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetPasswordTokenDto {
  @ApiProperty({
    description: 'Le token de réinitialisation du mot de passe',
    type: String,
  })
  token: string;

  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    type: Number,
  })
  userId: number;
}
