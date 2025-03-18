# Documentation Backend

## Structure du projet

```
backend/
├── src/
│   ├── config/         # Configuration
│   ├── controllers/    # Contrôleurs
│   ├── middleware/     # Middleware
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes API
│   ├── services/       # Services métier
│   ├── utils/          # Utilitaires
│   └── index.js        # Point d'entrée
├── tests/              # Tests
└── scripts/            # Scripts utilitaires
```

## Configuration

### Variables d'environnement

```env
# Configuration du serveur
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001

# Base de données
DATABASE_URL=postgres://postgres:postgres@localhost:5432/lydia
MONGODB_URI=mongodb://localhost:27017/lydia

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=24h

# Services externes
OPENAI_API_KEY=sk-xxx
TWILIO_ACCOUNT_SID=AC-xxx
TWILIO_AUTH_TOKEN=xxx

# Redis
REDIS_URL=redis://localhost:6379
```

### Configuration des services

```javascript
// src/config/services.js
module.exports = {
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    maxTokens: 300,
    temperature: 0.7
  },
  twilio: {
    defaultVoice: 'Polly.Léa',
    defaultLanguage: 'fr-FR'
  }
};
```

## Base de données

### Modèles MongoDB

```javascript
// src/models/User.js
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Migrations PostgreSQL

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Services

### Service OpenAI

```javascript
// src/services/openaiService.js
const generateResponse = async (transcription, companyConfig, context = {}) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `Vous êtes Lydia, un assistant vocal pour ${companyConfig.companyName}.`
      },
      {
        role: 'user',
        content: transcription
      }
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages,
      max_tokens: 300
    });

    return completion.choices[0].message.content;
  } catch (error) {
    logger.error('Erreur OpenAI:', error);
    throw error;
  }
};
```

### Service Twilio

```javascript
// src/services/twilioService.js
const handleIncomingCall = async (req, res) => {
  const twiml = new VoiceResponse();
  
  twiml.say({
    voice: 'Polly.Léa',
    language: 'fr-FR'
  }, 'Bonjour, comment puis-je vous aider ?');

  twiml.gather({
    input: 'speech',
    language: 'fr-FR',
    action: '/api/calls/process'
  });

  res.type('text/xml');
  res.send(twiml.toString());
};
```

## Middleware

### Authentication

```javascript
// src/middleware/auth.js
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};
```

### Validation

```javascript
// src/middleware/validate.js
const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedData = validated;
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};
```

## Controllers

### Structure type

```javascript
// src/controllers/userController.js
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.validatedData;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    logger.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
```

## Routes

### Organisation

```javascript
// src/routes/index.js
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/calls', require('./callRoutes'));
router.use('/companies', require('./companyRoutes'));

module.exports = router;
```

### Exemple de route

```javascript
// src/routes/authRoutes.js
router.post('/login',
  validateSchema(loginSchema),
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  authController.login
);
```

## Tests

### Configuration Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/scripts/**'
  ]
};
```

### Exemple de test

```javascript
// tests/services/openai.test.js
describe('OpenAI Service', () => {
  it('génère une réponse appropriée', async () => {
    const response = await generateResponse(
      'Quel est le solde de mon compte ?',
      { companyName: 'Test Bank' }
    );
    
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });
});
```

## Logging

### Configuration Winston

```javascript
// src/utils/logger.js
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Cache

### Configuration Redis

```javascript
// src/config/redis.js
const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (error) => {
  logger.error('Redis error:', error);
});
```

## Scripts

### Migration

```javascript
// scripts/migrate.js
async function migrate() {
  try {
    const migrations = await fs.readdir('./migrations');
    for (const migration of migrations) {
      const sql = await fs.readFile(`./migrations/${migration}`, 'utf8');
      await db.query(sql);
      logger.info(`Migration ${migration} appliquée`);
    }
  } catch (error) {
    logger.error('Erreur migration:', error);
    process.exit(1);
  }
}
```

## Sécurité

### Headers de sécurité

```javascript
// src/middleware/security.js
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Rate Limiting

```javascript
// src/middleware/rateLimiter.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite par IP
});

app.use('/api/', limiter);
```

## Monitoring

### Métriques

```javascript
// src/utils/metrics.js
const metrics = new Metrics();

metrics.gauge('api_requests_total', async () => {
  const count = await Request.count();
  return count;
});

metrics.histogram('api_response_time', {
  buckets: [0.1, 0.5, 1, 2, 5]
});
```

## Déploiement

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    env_file: .env
    depends_on:
      - postgres
      - mongodb
      - redis
``` 