import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when a user is not authenticated
 */
export class UnauthorizedException extends BaseException {
  /**
   * Creates a new UnauthorizedException
   *
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(message, HttpStatus.UNAUTHORIZED, errorCode);
  }
}
