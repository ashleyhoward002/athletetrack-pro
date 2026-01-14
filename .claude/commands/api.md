# Next.js API Route Generator

Create API endpoints following project conventions:

## File Location
- Place in /app/api/[endpoint]/route.ts

## Route Structure
- Export named functions: GET, POST, PUT, DELETE
- Use TypeScript with proper types
- Validate input with Zod
- Return consistent JSON responses
- Handle errors gracefully

## Template
```tsx
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // logic here
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

## Checklist
- [ ] Input validation
- [ ] Auth check if protected
- [ ] Error handling
- [ ] Proper HTTP status codes
- [ ] TypeScript types

Generate endpoint for:
