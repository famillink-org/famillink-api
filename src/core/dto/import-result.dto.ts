import { ApiProperty } from '@nestjs/swagger';

export class ImportErrorDto {
  @ApiProperty({ description: 'Numéro de ligne dans le fichier CSV' })
  line: number;

  @ApiProperty({ description: "Message d'erreur" })
  message: string;
}

export class ImportResultDto {
  @ApiProperty({ description: 'Nombre de membres créés' })
  membersCreated: number;

  @ApiProperty({ description: 'Nombre de membres mis à jour' })
  membersUpdated: number;

  @ApiProperty({ description: "Nombre d'utilisateurs créés" })
  usersCreated: number;

  @ApiProperty({ description: "Nombre d'utilisateurs mis à jour" })
  usersUpdated: number;

  @ApiProperty({
    description: "Liste des erreurs rencontrées lors de l'importation",
    type: [ImportErrorDto],
  })
  errors: ImportErrorDto[];
}
