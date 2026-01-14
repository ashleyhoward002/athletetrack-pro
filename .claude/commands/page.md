# Next.js Page Generator

Create a new page following Next.js App Router conventions:

## File Location
- Place in /app/[route]/page.tsx
- Create layout.tsx if needed for shared UI

## Page Structure
- Use TypeScript
- Include metadata export for SEO
- Handle loading and error states
- Use Suspense for async components

## Template
```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title | AthleteTrack Pro',
  description: 'Page description',
};

export default function PageName() {
  return (
    <main>
      {/* page content */}
    </main>
  );
}
```

## Checklist
- [ ] Route created in /app directory
- [ ] Metadata configured
- [ ] Protected with auth if needed
- [ ] Mobile responsive
- [ ] Loading state handled

Generate page for:
