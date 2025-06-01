import { LogLevel } from '@nestjs/common';

export default () => ({
  environment: 'development',
  logging: {
    levels: ['error', 'warn', 'log', 'debug', 'verbose'] as LogLevel[],
  },
  database: {
    logging: true,
  },
});
