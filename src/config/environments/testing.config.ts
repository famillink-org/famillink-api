import { LogLevel } from '@nestjs/common';

export default () => ({
  environment: 'testing',
  logging: {
    levels: ['error', 'warn'] as LogLevel[],
  },
  database: {
    logging: false,
  },
});
