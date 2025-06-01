import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration
  const configService = app.get(ConfigService);
  const appVersion = configService.get<string>('APP_VERSION');
  const appCopyright = configService.get<string>('APP_COPYRIGHT');
  const appSupportEmail = configService.get<string>('APP_SUPPORT_EMAIL');

  // Configure logger based on environment
  const loggingLevels = configService.get<string[]>('logging.levels') as (
    | 'verbose'
    | 'debug'
    | 'log'
    | 'warn'
    | 'error'
    | 'fatal'
  )[];
  if (loggingLevels) {
    Logger.log(
      `Setting log levels to: ${loggingLevels.join(', ')}`,
      'Bootstrap',
    );
    app.useLogger(loggingLevels);
  }

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Register global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configure API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('FamilLink API')
    .setDescription('The FamilLink API documentation')
    .setVersion(appVersion || '1.0.0')
    .addBearerAuth()
    .setContact('Support', '', appSupportEmail || '')
    .setLicense('Proprietary', '')
    .setTermsOfService(
      `© ${appCopyright || '2025'} KrysInfo. All rights reserved.`,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start the application
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
