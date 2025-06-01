# FamilLink API Development Guidelines

This document provides guidelines and information for developers working on the FamilLink API project.

## Build and Configuration Instructions

### Prerequisites

- Node.js (latest LTS version recommended)
- pnpm package manager
- MySQL database

### Environment Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables by creating a `.env` file in the project root with the following required variables:

   ```
   # Application settings
   APP_VERSION=V1.0.1
   APP_COPYRIGHT=2024-2025
   APP_SUPPORT_EMAIL=support-msf@krysinfo.fr
   APP_FRONTEND_URL=http://localhost:4200

   # Database configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=mysmartfamily
   DB_USER=mysmartfamily
   DB_PASSWORD=your_password

   # File storage
   FILE_STORAGE_URL=http://dufs:5000

   # Security
   ENCRYPT_PASSWORD=your_encryption_key
   JWT_SECRET=your_jwt_secret
   INTERNAL_API_KEY=your_api_key

   # Email configuration
   BREVO_API_KEY=your_brevo_api_key
   EMAIL_PROVIDER=brevo

   # Link durations (in milliseconds)
   NEW_USER_LINK_DURATION=172800000
   PASSWORD_RESET_LINK_DURATION=900000
   ```

   Note: All environment variables are validated at application startup. The application will not start if required variables are missing or invalid.

### Build and Run

- Development mode:
  ```bash
  pnpm start:dev
  ```

- Debug mode:
  ```bash
  pnpm start:debug
  ```

- Production build:
  ```bash
  pnpm build
  pnpm start:prod
  ```

## Testing Information

### Test Configuration

The project uses Jest for testing with two configurations:

1. **Unit Tests**: Located in the same directory as the source files with the `.spec.ts` extension
2. **E2E Tests**: Located in the `test` directory with the `.e2e-spec.ts` extension

### Running Tests

- Run all tests:
  ```bash
  pnpm test
  ```

- Run tests with watch mode:
  ```bash
  pnpm test:watch
  ```

- Run tests with coverage:
  ```bash
  pnpm test:cov
  ```

- Run E2E tests:
  ```bash
  pnpm test:e2e
  ```

- Run a specific test file:
  ```bash
  pnpm test -- path/to/test/file.spec.ts
  ```

### Writing Tests

#### Unit Tests

Unit tests should be placed in the same directory as the file being tested with the `.spec.ts` extension. Here's an example:

```typescript
// src/utils/string-utils.spec.ts
import { capitalizeFirstLetter, truncate } from './string-utils';

describe('String Utils', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    // More test cases...
  });
});
```

#### E2E Tests

E2E tests should be placed in the `test` directory with the `.e2e-spec.ts` extension. They typically test the API endpoints using SuperTest:

```typescript
// test/example.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ExampleController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/example (GET)', () => {
    return request(app.getHttpServer())
      .get('/example')
      .expect(200);
  });
});
```

## Code Style and Development Guidelines

### Project Structure

The project follows the NestJS modular architecture:

- `src/core/`: Core modules (data, crypto, mails, tokens)
- `src/features/`: Feature modules (auth, users, members)
- `src/utils/`: Utility functions

### Code Style

The project uses ESLint and Prettier for code formatting and linting:

- Run linting:
  ```bash
  pnpm lint
  ```

- Format code:
  ```bash
  pnpm format
  ```

### Key Conventions

1. **Module Organization**: Each feature should be in its own module with controllers, services, DTOs, and entities
2. **Validation**: Use class-validator for DTO validation
3. **Documentation**: Use JSDoc comments for functions and classes
4. **Error Handling**: Use NestJS exception filters for consistent error responses
5. **Testing**: Write tests for all new functionality

### TypeORM Usage

The project uses TypeORM with MySQL. Entity definitions should include:

- Column types and constraints
- Relationships between entities
- Indexes for performance optimization

### Authentication

The application uses JWT for authentication. Protected routes should use the appropriate guards.

### Environment Validation

All required environment variables are validated at startup using class-validator. If you add new environment variables, update the `EnvironmentVariables` class in `src/env.validation.ts`.