import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
  @ApiProperty({
    description: "Le nom de l'utilisateur",
    type: String,
  })
  userName: string;
}
