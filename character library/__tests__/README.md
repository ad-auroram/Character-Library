# Tests

This directory contains unit and integration tests for the application.

## Structure

```
__tests__/
├── components/       # Component tests
├── hooks/           # Custom hook tests
├── utils/           # Utility function tests
└── integration/     # Integration tests
```

## Running Tests

### Prerequisites
Install a test runner (Jest or Vitest):

```bash
# For Jest
npm install -D jest @testing-library/react @testing-library/jest-dom

# For Vitest (recommended for Next.js)
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Writing Tests

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Hook Tests
```typescript
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });
});
```

## Best Practices

1. Test behavior, not implementation
2. Use descriptive test names
3. Follow AAA pattern (Arrange, Act, Assert)
4. Mock external dependencies
5. Aim for high coverage of critical paths
6. Keep tests focused and isolated
