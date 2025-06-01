import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when an internal server error occurs
 */
export class InternalServerErrorException extends BaseException {
  /**
   * Creates a new InternalServerErrorException
   *
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(
    message = 'Internal server error',
    errorCode = 'INTERNAL_SERVER_ERROR',
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode);
  }
}