# API Endpoint Generator

Create a new API endpoint based on the specification provided. Follow these conventions:

## File Structure

- Place route handlers in /src/routes/
- Place business logic in /src/services/
- Place database queries in /src/repositories/

## Required Components

- OpenAPI documentation comments
- Input validation using Zod schemas
- Consistent error response format: { error: string, code: string, details?: object }
- Rate limiting decorator for public endpoints
- Authentication middleware for protected endpoints

## Testing Requirements

- Unit tests for the service layer
- Integration tests for the route handler
- Include at least one error case test

Generate the endpoint for:
