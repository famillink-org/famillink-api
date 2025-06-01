import { LogLevel } from '@nestjs/common';

export default () => ({
  environment: 'production',
  logging: {
    levels: ['error', 'warn'] as LogLevel[],
  },
  database: {
    logging: false,
  },
});
