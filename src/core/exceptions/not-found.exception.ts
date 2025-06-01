import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when a requested resource is not found
 */
export class NotFoundException extends BaseException {
  /**
   * Creates a new NotFoundException
   *
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(
    message = 'Resource not found',
    errorCode = 'RESOURCE_NOT_FOUND',
  ) {
    super(message, HttpStatus.NOT_FOUND, errorCode);
  }
}
