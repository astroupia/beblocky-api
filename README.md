# BeBlocky API

<p align="center">
  <img src="/public/images/logo.png" width="120" alt="Nest Logo" />
</p>

## Overview

BeBlocky is an innovative learning platform that makes programming fun and accessible for children. Our platform consists of three main applications:

- **code.beblocky.com**: The main learning platform where students interact with courses and lessons
- **admin.beblocky.com**: Administrative interface for managing courses, lessons, and content
- **ide.beblocky.com**: Integrated Development Environment for hands-on coding practice

This repository contains the core API that powers all three applications, built with NestJS and following Domain-Driven Design (DDD) principles.

## Architecture

### Domain-Driven Design (DDD)

The API follows strict DDD principles with clear separation of concerns:

```
src/
├── course/           # Course domain
│   ├── entities/     # Domain entities and schema definitions
│   ├── repositories/ # Data access layer
│   ├── services/     # Business logic
│   ├── dto/         # Data transfer objects
│   └── controllers/ # API endpoints
├── lesson/          # Lesson domain
└── slide/           # Slide domain
```

### Key Architectural Features

1. **Clean Architecture**

   - Clear separation between domain entities and infrastructure
   - Domain entities are pure TypeScript classes
   - Mongoose schemas are separate from domain models
   - Repository pattern for data access abstraction

2. **Type Safety**

   - Strict TypeScript configuration
   - Proper typing for all entities and DTOs
   - Mongoose document types properly separated from domain types

3. **Data Access Layer**

   - Repository pattern implementation
   - Centralized error handling
   - Proper population of related entities
   - Consistent sorting and filtering

4. **Business Logic Layer**
   - Service layer for orchestration
   - No direct database operations in services
   - Proper cascade operations
   - Cross-domain validations

## Core Domains

### Course Domain

- Manages course structure and metadata
- Handles course-lesson relationships
- Manages course-slide relationships
- Supports course ordering and organization

### Lesson Domain

- Manages lesson content and structure
- Handles lesson-slide relationships
- Supports lesson ordering within courses
- Manages lesson metadata

### Slide Domain

- Manages individual slide content
- Supports rich content types
- Handles slide ordering
- Manages relationships with courses and lessons

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB (v4.4 or later)
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
$ pnpm install

# Set up environment variables
$ cp .env.example .env
```

### Development

```bash
# Start development server
$ pnpm run start:dev

# Run tests
$ pnpm run test

# Run e2e tests
$ pnpm run test:e2e
```

### Production

```bash
# Build the application
$ pnpm run build

# Start production server
$ pnpm run start:prod
```

## API Documentation

The API documentation is available at `/api` when running the server. It provides detailed information about:

- Available endpoints
- Request/response schemas
- Authentication requirements
- Rate limiting
- Error codes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

We maintain a comprehensive test suite:

```bash
# Unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# Test coverage
$ pnpm run test:cov
```

## Deployment

The API is designed to be deployed in a containerized environment. We provide Docker configurations and deployment scripts for various environments.

### Docker Deployment

```bash
# Build the Docker image
$ docker build -t beblocky-api .

# Run the container
$ docker run -p 3000:3000 beblocky-api
```

## Support

For support, please contact our team at support@beblocky.com or join our [Discord community](https://discord.gg/beblocky).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
