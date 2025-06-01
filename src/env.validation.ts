import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  // Application settings
  @IsString()
  @IsNotEmpty()
  APP_VERSION: string;

  @IsString()
  @IsNotEmpty()
  APP_COPYRIGHT: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  APP_SUPPORT_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  APP_FRONTEND_URL: string;

  // Database configuration
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  // File storage
  @IsString()
  @IsNotEmpty()
  FILE_STORAGE_URL: string;

  // Security
  @IsString()
  @IsNotEmpty()
  ENCRYPT_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  INTERNAL_API_KEY: string;

  // Email configuration
  @IsString()
  @IsNotEmpty()
  BREVO_API_KEY: string;

  @IsString()
  @IsIn(['brevo']) // Add other providers as needed
  @IsNotEmpty()
  EMAIL_PROVIDER: string;

  // Link durations
  @IsNumber()
  @IsPositive()
  NEW_USER_LINK_DURATION: number;

  @IsNumber()
  @IsPositive()
  PASSWORD_RESET_LINK_DURATION: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
