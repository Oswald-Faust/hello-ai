# Documentation Frontend

## Structure du projet

```
frontend/
├── public/          # Assets statiques
├── src/
│   ├── app/        # Pages et layouts Next.js
│   ├── components/ # Composants React
│   │   ├── ui/    # Composants UI réutilisables
│   │   └── ...    # Composants spécifiques
│   ├── hooks/     # Hooks React personnalisés
│   ├── lib/       # Utilitaires et configurations
│   ├── styles/    # Styles globaux et thèmes
│   └── utils/     # Fonctions utilitaires
└── tests/         # Tests unitaires et d'intégration
```

## Composants UI

### Design System

Notre design system est basé sur Tailwind CSS et shadcn/ui. Les composants sont organisés comme suit :

#### Composants de base
- `Button` : Boutons avec variantes
- `Input` : Champs de saisie
- `Card` : Conteneurs de carte
- `Alert` : Messages d'alerte
- `Label` : Labels pour formulaires

#### Composants composés
- `Form` : Composants de formulaire
- `Dialog` : Boîtes de dialogue modales
- `Dropdown` : Menus déroulants
- `Table` : Tables de données

### Exemple d'utilisation

```tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginForm() {
  return (
    <form>
      <Input
        type="email"
        placeholder="Email"
        leftIcon={<EmailIcon />}
      />
      <Button variant="primary" size="lg">
        Se connecter
      </Button>
    </form>
  );
}
```

## État global

### Context API

Nous utilisons React Context pour gérer l'état global :

```tsx
// src/contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType>({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // ... logique d'authentification

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Hooks personnalisés

```tsx
// src/hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Routing

### Structure des routes

```
/                   # Page d'accueil
/auth
  /login           # Connexion
  /register        # Inscription
/dashboard         # Tableau de bord
  /calls           # Historique des appels
  /analytics       # Analyses et statistiques
/settings          # Paramètres
  /profile        # Profil utilisateur
  /company        # Configuration entreprise
```

### Middleware d'authentification

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}
```

## Gestion des formulaires

### Validation avec Zod

```typescript
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court')
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema)
  });
  
  // ... logique du formulaire
}
```

## Gestion des erreurs

### Boundary d'erreur

```tsx
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Tests

### Configuration Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Exemple de test

```typescript
// src/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('appelle onClick quand cliqué', () => {
    const onClick = jest.fn();
    const { getByRole } = render(
      <Button onClick={onClick}>Cliquez-moi</Button>
    );
    
    fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Performance

### Optimisations

1. **Images**
```tsx
import Image from 'next/image';

export function Avatar({ src }) {
  return (
    <Image
      src={src}
      width={64}
      height={64}
      alt="Avatar"
      placeholder="blur"
    />
  );
}
```

2. **Code splitting**
```tsx
const DashboardChart = dynamic(() => import('./DashboardChart'), {
  loading: () => <ChartSkeleton />
});
```

## Internationalisation

### Configuration i18n

```typescript
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  }
};
```

### Utilisation

```tsx
import { useTranslation } from 'next-i18next';

export function Welcome() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

## Sécurité

### Headers HTTP

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'"
          }
        ]
      }
    ];
  }
};
```

## Déploiement

### Configuration Vercel

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

## Style Guide

### Conventions de nommage

- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase avec prefix use (`useAuth.ts`)
- Utils: camelCase (`formatDate.ts`)
- Constants: SNAKE_CASE (`API_ENDPOINTS.ts`)

### Structure des composants

```tsx
// Template de composant
interface Props {
  // Props typées
}

export function ComponentName({ prop1, prop2 }: Props) {
  // État local
  const [state, setState] = useState();
  
  // Hooks personnalisés
  const { data } = useCustomHook();
  
  // Effets
  useEffect(() => {
    // Logique d'effet
  }, [dependencies]);
  
  // Handlers
  const handleEvent = () => {
    // Logique de l'événement
  };
  
  // Rendu conditionnel
  if (condition) {
    return <Loading />;
  }
  
  // JSX principal
  return (
    <div>
      {/* Contenu */}
    </div>
  );
} 