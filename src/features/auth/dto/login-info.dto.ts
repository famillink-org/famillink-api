import { ApiProperty } from '@nestjs/swagger';

export class LoginInfoDto {
  @ApiProperty({
    description: "Le nom de l'utilisateur",
    type: String,
  })
  username: string;

  @ApiProperty({
    description: "Le mot de passe de l'utilisateur",
    type: String,
  })
  password: string;
}
