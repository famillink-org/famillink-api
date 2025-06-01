import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when validation fails
 */
export class ValidationException extends BaseException {
  /**
   * Creates a new ValidationException
   *
   * @param errors The validation errors
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(
    public readonly errors: Record<string, string[]>,
    message = 'Validation failed',
    errorCode = 'VALIDATION_FAILED',
  ) {
    super(message, HttpStatus.BAD_REQUEST, errorCode);
  }
}
