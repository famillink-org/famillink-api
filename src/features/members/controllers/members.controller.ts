import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Logger,
  Query,
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
import { MembersEngineService } from '../services/members.engine.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ImportResultDto } from '../../../core/dto/import-result.dto';
import { PaginationParamsDto } from '../../../core/dto/pagination-params.dto';
import { PaginatedResponseDto } from '../../../core/dto/paginated-response.dto';
import { MemberListItemDto } from '../dto/member-list-item.dto';
import { ERole } from '../../../core/data/user/entities/enum-role';

@ApiTags('Membres')
@Controller('members')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class MembersController {
  private readonly logger = new Logger(MembersController.name);

  constructor(private readonly memberEngineService: MembersEngineService) {}

  @Post('import')
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
        await this.memberEngineService.createOrUpdateMember(i, rows[i], result);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        codes.push(rows[i].code);
      }

      // Traiter les codes pour créer les relations entre membres
      for (let i = 0; i < rows.length; i++) {
        await this.memberEngineService.addOrUpdateRelation(i, codes[i], result);
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

  @Get()
  @ApiOperation({ summary: 'Récupérer une liste paginée de membres' })
  @ApiResponse({
    status: 200,
    description: 'Liste des membres récupérée avec succès',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getMembers(
    @Query() paginationParams: PaginationParamsDto,
  ): Promise<PaginatedResponseDto<MemberListItemDto>> {
    try {
      // Apply default values if not provided
      const params: PaginationParamsDto = {
        page: paginationParams.page || 1,
        limit: paginationParams.limit || 10,
        sortBy: paginationParams.sortBy || 'id',
        sortDirection: paginationParams.sortDirection || 'ASC',
        search: paginationParams.search,
      };

      return await this.memberEngineService.getPaginatedMembers(params);
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Erreur lors de la récupération des membres: ${error.message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Erreur lors de la récupération des membres: ${error.message}`,
      );
    }
  }
}
