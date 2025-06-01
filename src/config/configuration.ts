import developmentConfig from './environments/development.config';
import testingConfig from './environments/testing.config';
import productionConfig from './environments/production.config';

/**
 * Configuration loader that selects the appropriate configuration based on the NODE_ENV environment variable.
 * Defaults to development if NODE_ENV is not set or is invalid.
 */
export default () => {
  const environment = process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'production':
      return productionConfig();
    case 'testing':
    case 'test':
      return testingConfig();
    case 'development':
    case 'dev':
    default:
      return developmentConfig();
  }
};
