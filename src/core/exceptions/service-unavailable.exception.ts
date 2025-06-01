import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when a service is unavailable
 */
export class ServiceUnavailableException extends BaseException {
  /**
   * Creates a new ServiceUnavailableException
   *
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(
    message = 'Service unavailable',
    errorCode = 'SERVICE_UNAVAILABLE',
  ) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, errorCode);
  }
}