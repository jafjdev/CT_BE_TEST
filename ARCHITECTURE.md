# Backend Architecture Documentation

## Overview
This document describes the improved backend architecture that follows industry best practices for scalability, maintainability, and separation of concerns.

## Architecture Layers

### 1. **Entry Point** (`main.ts`)
- **Purpose**: Application bootstrapping and server startup
- **Responsibilities**: 
  - Database connection initialization
  - Server configuration and startup
  - Error handling for startup failures

### 2. **Application Layer** (`app.ts`)
- **Purpose**: Express application setup and configuration
- **Responsibilities**:
  - Middleware registration (security, parsing, logging)
  - Route registration
  - Global error handling setup
  - Health check endpoint

### 3. **Routes Layer** (`routes/`)
- **Purpose**: API endpoint definitions and routing
- **Structure**:
  - `journeyRoutes.ts` - Journey-related endpoints
- **Responsibilities**:
  - Route definitions
  - Middleware application (validation, authentication)
  - Controller method binding

### 4. **Controllers Layer** (`controllers/`)
- **Purpose**: Request/response handling and orchestration
- **Structure**:
  - `journeyController.ts` - Journey-related request handlers
- **Responsibilities**:
  - Request parsing and validation
  - Service layer orchestration
  - Response formatting
  - Error handling

### 5. **Services Layer** (`services/`)
- **Purpose**: Business logic implementation
- **Structure**:
  - `journeyService.ts` - Journey-related business logic
- **Responsibilities**:
  - Business rules implementation
  - Data processing
  - External API integrations
  - Database operations orchestration

### 6. **Middleware Layer** (`middleware/`)
- **Purpose**: Request/response processing and cross-cutting concerns
- **Structure**:
  - `validateRequest.ts` - Input validation
  - `errorHandler.ts` - Global error handling
  - `notFoundHandler.ts` - 404 error handling
  - `requestLogger.ts` - Request logging
- **Responsibilities**:
  - Input validation
  - Error handling
  - Logging
  - Security enforcement

### 7. **Models Layer** (`models/`)
- **Purpose**: Data access layer and database schemas
- **Responsibilities**:
  - Database schema definitions
  - Data validation
  - Query methods

### 8. **Types Layer** (`types/`)
- **Purpose**: TypeScript type definitions and validation schemas
- **Responsibilities**:
  - Type definitions
  - Zod validation schemas
  - Interface definitions

### 9. **Configuration Layer** (`config/`)
- **Purpose**: Application configuration and setup
- **Responsibilities**:
  - Database configuration
  - Logger setup
  - Environment variables