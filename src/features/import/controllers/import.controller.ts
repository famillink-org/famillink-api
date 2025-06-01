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
  @ApiOperation({
    summary: 'Import members from CSV file',
    description: 'Imports members from a CSV file. Requires Admin role.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Import completed successfully',
    type: ImportResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or processing error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Admin role' })
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
        // Check file type
        if (
          file.mimetype !== 'text/csv' &&
          !file.originalname.endsWith('.csv')
        ) {
          return cb(
            new BadRequestException('Only CSV files are accepted'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
      },
    }),
  )
  async importMembers(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
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

      // Read and parse the CSV file
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => rows.push(data))
          .on('end', () => resolve())
          .on('error', (error) =>
            reject(
              new BadRequestException(
                `Error parsing CSV file: ${error.message}`,
              ),
            ),
          );
      });

      const codes: string[] = new Array<string>();

      // Process each row of the CSV
      for (let i = 0; i < rows.length; i++) {
        await this.importEngineService.createOrUpdateMember(i, rows[i], result);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        codes.push(rows[i].code);
      }

      // Process codes to create relationships between members
      for (let i = 0; i < rows.length; i++) {
        await this.importEngineService.addOrUpdateRelation(i, codes[i], result);
      }

      // Delete the temporary file
      fs.unlinkSync(filePath);

      return result;
    } catch (error) {
      // Clean up the temporary file in case of error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error importing members: ${error.message}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error importing members: ${error.message}`,
      );
    }
  }
}
