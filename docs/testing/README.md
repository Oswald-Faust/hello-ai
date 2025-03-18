# Guide des Tests

## Vue d'ensemble

Notre stratégie de test couvre plusieurs niveaux pour assurer la qualité du code :

- Tests unitaires
- Tests d'intégration
- Tests end-to-endmn run dev

- Tests de performance
- Tests de sécurité

## Tests Frontend

### Configuration

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
};
```

### Exemple de test de composant

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Test des hooks personnalisés

```typescript
// hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

## Tests Backend

### Configuration

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
};
```

### Test des contrôleurs

```typescript
// controllers/UserController.test.ts
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';

describe('UserController', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('creates a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### Test des services

```typescript
// services/OpenAIService.test.ts
import { OpenAIService } from './OpenAIService';
import { mockOpenAI } from '../__mocks__/openai';

jest.mock('openai', () => mockOpenAI);

describe('OpenAIService', () => {
  it('generates a response', async () => {
    const service = new OpenAIService();
    const response = await service.generateResponse('Hello');
    expect(response).toBeTruthy();
  });
});
```

## Tests E2E

### Configuration Cypress

```javascript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
  },
});
```

### Exemple de test E2E

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('logs in successfully', () => {
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Tests de Performance

### Configuration k6

```javascript
// k6/login.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.post('http://localhost:3001/api/auth/login', {
    email: 'test@example.com',
    password: 'password123',
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

## Tests de Sécurité

### Configuration OWASP ZAP

```yaml
# zap-config.yaml
---
env:
  contexts:
    - name: "Lydia API"
      urls: ["http://localhost:3001"]
      includePaths: ["^https?://localhost:3001.*"]
      excludePaths: []
      authentication:
        method: "form"
        parameters:
          loginUrl: "http://localhost:3001/api/auth/login"
          loginRequestData: "email={%email%}&password={%password%}"
```

## Intégration Continue

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Bonnes pratiques

### Organisation des tests

- Un fichier de test par composant/service
- Nommage clair et descriptif des tests
- Utilisation de fixtures pour les données de test
- Isolation des tests
- Nettoyage après chaque test

### Conventions de nommage

```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should behavior', () => {
      // test
    });
  });
});
```

### Mocking

```typescript
// __mocks__/axios.ts
export default {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
};
```

## Scripts NPM

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:perf": "k6 run k6/login.js",
    "test:security": "zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true'"
  }
}
``` 