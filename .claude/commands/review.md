# Code Review Assistant

Review the code I'm about to share or that's currently in context. Follow these guidelines:

## Security Checks

- Look for SQL injection vulnerabilities
- Check for hardcoded secrets or API keys
- Identify potential XSS attack vectors
- Flag any unsafe deserialization

## Performance Considerations

- Identify N+1 query patterns
- Look for unnecessary re-renders in React components
- Check for missing database indexes in queries
- Flag synchronous operations that should be async

## Code Quality

- Verify error handling is comprehensive
- Check that functions have single responsibilities
- Ensure naming follows our conventions (camelCase for functions, PascalCase for components)
- Look for code duplication that should be abstracted

## Output Format

Provide your review as:

1. **Critical Issues** (must fix before merge)

2. **Suggestions** (should consider)

3. **Nitpicks** (minor style preferences)

4. **Praise** (what was done well)
