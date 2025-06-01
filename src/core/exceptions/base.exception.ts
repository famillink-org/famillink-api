import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception class for all custom exceptions in the application
 *
 * This class extends NestJS's HttpException and provides a consistent structure
 * for all exceptions in the application.
 */
export class BaseException extends HttpException {
  /**
   * Creates a new BaseException
   *
   * @param message The error message
   * @param statusCode The HTTP status code
   * @param errorCode A custom error code for the client
   */
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly errorCode?: string,
  ) {
    super(
      {
        statusCode,
        message,
        errorCode,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
