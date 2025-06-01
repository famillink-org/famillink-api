import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    description: "l'id unique de l'adresse",
    type: 'number',
  })
  id?: number;

  @ApiProperty({
    description: "la rue de l'adresse",
    type: String,
  })
  street?: string;

  @ApiProperty({
    description:
      "Le complément de l'adresse, par exemple le numéro de bâtiment",
    type: String,
  })
  complement?: string;

  @ApiProperty({
    description: "Le code postal de l'adresse",
    type: String,
  })
  zipCode?: string;

  @ApiProperty({
    description:
      "La commune de l'adresse, par exemple Paris, Lyon, Marseille, ...",
    type: String,
  })
  city?: string;

  @ApiProperty({
    description: "Le pays de l'adresse",
    type: String,
  })
  country?: string;
}
