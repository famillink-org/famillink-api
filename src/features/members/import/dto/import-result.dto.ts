import { ImportErrorDto } from './import-error.dto';

export class IImportResult {
  membersCreated: number;
  membersUpdated: number;
  usersCreated: number;
  usersUpdated: number;
  errors: ImportErrorDto[];
}
