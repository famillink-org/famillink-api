import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when a request is invalid
 */
export class BadRequestException extends BaseException {
  /**
   * Creates a new BadRequestException
   *
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(message = 'Bad request', errorCode = 'BAD_REQUEST') {
    super(message, HttpStatus.BAD_REQUEST, errorCode);
  }
}
