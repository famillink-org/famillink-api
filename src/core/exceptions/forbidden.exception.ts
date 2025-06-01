import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when a user is not authorized to access a resource
 */
export class ForbiddenException extends BaseException {
  /**
   * Creates a new ForbiddenException
   *
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super(message, HttpStatus.FORBIDDEN, errorCode);
  }
}
