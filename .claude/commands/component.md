# React Component Generator

Create a new React component following project conventions:

## File Location
- Place in /components/ directory
- Use PascalCase for filename (e.g., AthleteCard.tsx)

## Component Structure
- Use TypeScript with proper interface for props
- Use functional component with hooks
- Include JSDoc comment describing purpose
- Use Tailwind CSS for styling
- Export as default

## Template
```tsx
interface ComponentNameProps {
  // props here
}

/**
 * Brief description of what this component does
 */
export default function ComponentName({ }: ComponentNameProps) {
  return (
    <div>
      {/* component content */}
    </div>
  );
}
```

## After Creation
- Add to any barrel exports if needed
- Update CheckList.md if this completes a task

Generate component for:
