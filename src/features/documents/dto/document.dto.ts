import { DocumentEntity } from '../../../core/data/document/entities/document.entity';

export class DocumentDto {
  id?: number;
  documentType: string;
  documentUrl: string;

  static fromEntity(entity: DocumentEntity): DocumentDto {
    const dto = new DocumentDto();
    dto.id = entity.id;
    dto.documentType = entity.documentType;
    dto.documentUrl = entity.documentUrl;
    return dto;
  }

  static fromEntities(
    entities: DocumentEntity[] | undefined,
  ): DocumentDto[] | undefined {
    if (!entities) {
      return undefined;
    }
    return entities.map((entity) => DocumentDto.fromEntity(entity));
  }
}
