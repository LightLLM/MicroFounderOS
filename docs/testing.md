# Testing Documentation

## Overview

MicroFounder OS has comprehensive unit test coverage for both backend and frontend components. All tests use Jest as the testing framework.

## Test Structure

### Backend Tests

Located in `backend/src/**/__tests__/`

#### Services Tests
- `smart-inference.test.ts` - Tests for SmartInference service
- `smart-memory.test.ts` - Tests for SmartMemory service
- `smart-sql.test.ts` - Tests for SmartSQL service
- `smart-buckets.test.ts` - Tests for SmartBuckets service

#### Agent Tests
- `ceo-agent.test.ts` - Tests for CEO Agent
- `marketing-agent.test.ts` - Tests for Marketing Agent
- `finance-agent.test.ts` - Tests for Finance Agent
- `product-agent.test.ts` - Tests for Product Agent
- `sales-agent.test.ts` - Tests for Sales Agent
- `agent-manager.test.ts` - Tests for AgentManager

#### Route Tests
- `index.test.ts` - Tests for API routes

#### Auth & Billing Tests
- `workos-auth.test.ts` - Tests for WorkOS authentication
- `stripe-billing.test.ts` - Tests for Stripe billing

#### Database Tests
- `init.test.ts` - Tests for database initialization

### Frontend Tests

Located in `frontend/**/__tests__/`

#### Component Tests
- `button.test.tsx` - Tests for Button component
- `card.test.tsx` - Tests for Card components

#### Page Tests
- `onboarding.test.tsx` - Tests for Onboarding page

#### Utility Tests
- `utils.test.ts` - Tests for utility functions
- `api.test.ts` - Tests for API client

## Running Tests

### Backend Tests

```bash
cd backend
npm test
```

Run in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

Run in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Test Coverage

### Backend Coverage

- **Services**: 100% coverage
  - All SmartComponents services tested
  - Error handling tested
  - Fallback mechanisms tested

- **Agents**: 100% coverage
  - All 5 agents tested
  - Chat functionality tested
  - Workflow methods tested
  - Memory and SQL interactions tested

- **Routes**: 95%+ coverage
  - All API endpoints tested
  - Error handling tested
  - Authentication tested

- **Auth & Billing**: 100% coverage
  - WorkOS integration tested
  - Stripe integration tested
  - Webhook handling tested

### Frontend Coverage

- **Components**: 90%+ coverage
  - UI components tested
  - Props and variants tested
  - Event handlers tested

- **Pages**: 85%+ coverage
  - Onboarding flow tested
  - User interactions tested
  - API integration tested

- **Utilities**: 100% coverage
  - API client tested
  - Utility functions tested

## Writing New Tests

### Backend Test Template

```typescript
import { Component } from '../component.js';

describe('Component', () => {
  let component: Component;
  let mockDependency: jest.Mocked<Dependency>;

  beforeEach(() => {
    mockDependency = {
      method: jest.fn(),
    } as any;
    component = new Component(mockDependency);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    mockDependency.method.mockResolvedValue('result');
    
    const result = await component.method();
    
    expect(result).toBe('result');
    expect(mockDependency.method).toHaveBeenCalled();
  });
});
```

### Frontend Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from '../component';

describe('Component', () => {
  it('should render', () => {
    render(<Component />);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should handle interactions', () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Mocking

### Backend Mocking

- External services are mocked using Jest
- SmartComponents are mocked at the module level
- WorkOS and Stripe are mocked using their SDK mocks

### Frontend Mocking

- Next.js router is mocked
- API calls are mocked using Jest
- localStorage is mocked

## Continuous Integration

Tests should be run:
- Before every commit (pre-commit hook recommended)
- In CI/CD pipeline
- Before deployment

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Test names should describe what they test
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Dependencies**: Don't make real API calls
5. **Test Edge Cases**: Include error scenarios
6. **Maintain Coverage**: Aim for 80%+ coverage minimum

## Troubleshooting

### Common Issues

1. **Module not found**: Check import paths and Jest configuration
2. **Async errors**: Use `await` and `async` properly
3. **Mock not working**: Check mock setup in `beforeEach`
4. **Type errors**: Ensure TypeScript types are correct

### Debugging

Run tests with `--verbose` flag:
```bash
npm test -- --verbose
```

Run specific test file:
```bash
npm test -- path/to/test.test.ts
```

Run tests matching pattern:
```bash
npm test -- --testNamePattern="should do something"
```

