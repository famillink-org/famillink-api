import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when a resource already exists
 */
export class ConflictException extends BaseException {
  /**
   * Creates a new ConflictException
   *
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(message = 'Resource already exists', errorCode = 'CONFLICT') {
    super(message, HttpStatus.CONFLICT, errorCode);
  }
}