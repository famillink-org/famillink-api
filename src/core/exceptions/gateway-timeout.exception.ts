import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * Exception thrown when a gateway times out
 */
export class GatewayTimeoutException extends BaseException {
  /**
   * Creates a new GatewayTimeoutException
   *
   * @param message The error message
   * @param errorCode A custom error code for the client
   */
  constructor(message = 'Gateway timeout', errorCode = 'GATEWAY_TIMEOUT') {
    super(message, HttpStatus.GATEWAY_TIMEOUT, errorCode);
  }
}
