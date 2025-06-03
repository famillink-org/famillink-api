import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ValidationException } from '../exceptions';

/**
 * Global exception filter that handles all exceptions in the application
 *
 * This filter ensures that all exceptions are returned in a consistent format.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default values
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errors: Record<string, string[]> | null = null;
    let stack: string | undefined = undefined;

    // Handle HttpExceptions (including our custom exceptions)
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      // If the exception response is an object, extract the properties
      if (typeof exceptionResponse === 'object') {
        const exceptionResponseObj = exceptionResponse as Record<string, any>;
        statusCode = exception.getStatus();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message = exceptionResponseObj.message || message;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        errorCode = exceptionResponseObj.errorCode || errorCode;

        // Handle validation errors
        if (exception instanceof ValidationException) {
          errors = exception.errors;
        }
      } else {
        // If the exception response is a string, use it as the message
        statusCode = exception.getStatus();
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      // Handle standard Error objects
      message = exception.message;

      // Include stack trace in development mode
      if (this.configService.get<string>('NODE_ENV') !== 'production') {
        stack = exception.stack;
      }
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${statusCode}: ${message}`,
      stack,
    );

    // Return a consistent error response
    const errorResponse = {
      statusCode,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add errors if they exist
    if (errors) {
      Object.assign(errorResponse, { errors });
    }

    // Add stack trace in development mode
    if (stack && this.configService.get<string>('NODE_ENV') !== 'production') {
      Object.assign(errorResponse, { stack });
    }

    response.status(statusCode).json(errorResponse);
  }
}
