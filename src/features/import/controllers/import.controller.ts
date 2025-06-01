import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ERole } from '../../../core/data/user/entities/enum-role';
import { ImportResultDto } from '../../../core/dto/import-result.dto';
import { ImportEngineService } from '../services/import.engine.service';

@ApiTags('Import')
@Controller('import')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ImportController {
  private readonly logger = new Logger(ImportController.name);

  constructor(private readonly importEngineService: ImportEngineService) {}

  @Post('members')
  @Roles(ERole.Admin)
  @ApiOperation({ summary: 'Importer des membres depuis un fichier CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Import réalisé avec succès',
    type: ImportResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Fichier invalide ou erreur de traitement',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueFilename = `${uuidv4()}-${file.originalname}`;
          cb(null, uniqueFilename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Vérifier le type de fichier
        if (
          file.mimetype !== 'text/csv' &&
          !file.originalname.endsWith('.csv')
        ) {
          return cb(
            new BadRequestException('Seuls les fichiers CSV sont acceptés'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 Mo
      },
    }),
  )
  async importMembers(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const result: ImportResultDto = {
      membersCreated: 0,
      membersUpdated: 0,
      usersCreated: 0,
      usersUpdated: 0,
      errors: [],
    };

    try {
      const filePath = file.path;
      const rows: any[] = [];

      // Lire et parser le fichier CSV
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => rows.push(data))
          .on('end', () => resolve())
          .on('error', (error) =>
            reject(
              new BadRequestException(
                `Erreur lors de l'analyse du CSV: ${error.message}`,
              ),
            ),
          );
      });

      const codes: string[] = new Array<string>();

      // Traiter chaque ligne du CSV
      for (let i = 0; i < rows.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        await this.importEngineService.createOrUpdateMember(i, rows[i], result);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        codes.push(rows[i].code);
      }

      // Traiter les codes pour créer les relations entre membres
      for (let i = 0; i < rows.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        await this.importEngineService.addOrUpdateRelation(i, codes[i], result);
      }

      // Supprimer le fichier temporaire
      fs.unlinkSync(filePath);

      return result;
    } catch (error) {
      // Nettoyer le fichier temporaire en cas d'erreur
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Erreur lors de l'importation des membres: ${error.message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Erreur lors de l'importation des membres: ${error.message}`,
      );
    }
  }
}
