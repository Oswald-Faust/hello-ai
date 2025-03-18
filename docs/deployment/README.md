# Guide de déploiement

## Prérequis

### Infrastructure requise

- Serveur Linux (Ubuntu 20.04 LTS recommandé)
- Docker et Docker Compose
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- Redis 6+
- Nginx

### Services cloud

- Compte Vercel (frontend)
- Compte MongoDB Atlas (base de données)
- Compte OpenAI (API)
- Compte Twilio (optionnel)
- Compte AWS (optionnel, pour S3 et autres services)

## Configuration de l'environnement

### Installation des dépendances système

```bash
# Mise à jour du système
sudo apt update
sudo apt upgrade -y

# Installation des dépendances
sudo apt install -y \
  curl \
  git \
  docker.io \
  docker-compose \
  nginx \
  certbot \
  python3-certbot-nginx
```

### Installation de Node.js

```bash
# Installation de Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

## Configuration des bases de données

### PostgreSQL

```bash
# Installation
sudo apt install -y postgresql postgresql-contrib

# Création de la base de données
sudo -u postgres psql
CREATE DATABASE lydia;
CREATE USER lydia_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lydia TO lydia_user;
```

### MongoDB

```bash
# Installation
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Démarrage du service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Redis

```bash
# Installation
sudo apt install -y redis-server

# Configuration
sudo nano /etc/redis/redis.conf
# Modifier : supervised systemd

# Redémarrage du service
sudo systemctl restart redis.service
```

## Configuration du serveur web

### Nginx

```nginx
# /etc/nginx/sites-available/lydia
server {
    listen 80;
    server_name api.lydia.ai;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL avec Let's Encrypt

```bash
# Installation du certificat
sudo certbot --nginx -d api.lydia.ai
```

## Déploiement

### Backend

```bash
# Cloner le repository
git clone https://github.com/votre-organisation/lydia.git
cd lydia/backend

# Installation des dépendances
npm ci --production

# Configuration
cp .env.example .env
nano .env  # Configurer les variables d'environnement

# Démarrage avec PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

### Frontend (Vercel)

1. Connectez-vous à Vercel
2. Importez le projet depuis GitHub
3. Configurez les variables d'environnement
4. Déployez

### Docker

```bash
# Construction des images
docker-compose build

# Démarrage des services
docker-compose up -d

# Vérification des logs
docker-compose logs -f
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Run tests
        run: npm test
        
      - name: Deploy to production
        if: success()
        run: |
          # Scripts de déploiement
```

## Monitoring

### Configuration de PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'lydia-api',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### Prometheus & Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
```

## Sauvegardes

### Script de backup

```bash
#!/bin/bash
# backup.sh

# Variables
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups"

# PostgreSQL
pg_dump lydia > "$BACKUP_DIR/postgres_$DATE.sql"

# MongoDB
mongodump --out "$BACKUP_DIR/mongo_$DATE"

# Compression
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" \
    "$BACKUP_DIR/postgres_$DATE.sql" \
    "$BACKUP_DIR/mongo_$DATE"

# Nettoyage
rm -rf "$BACKUP_DIR/postgres_$DATE.sql" "$BACKUP_DIR/mongo_$DATE"

# Upload vers S3 (optionnel)
aws s3 cp "$BACKUP_DIR/backup_$DATE.tar.gz" \
    "s3://lydia-backups/backup_$DATE.tar.gz"
```

## Sécurité

### Configuration du pare-feu

```bash
# UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### Fail2Ban

```ini
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
```

## Maintenance

### Scripts utilitaires

```bash
#!/bin/bash
# maintenance.sh

# Vérification de l'espace disque
check_disk_space() {
  df -h / | awk 'NR==2 {print $5}' | sed 's/%//'
}

# Rotation des logs
rotate_logs() {
  find /var/log -type f -name "*.log" -size +100M \
    -exec gzip {} \;
}

# Nettoyage des backups
clean_old_backups() {
  find /backups -type f -mtime +30 -delete
}

# Exécution
main() {
  disk_usage=$(check_disk_space)
  if [ "$disk_usage" -gt 80 ]; then
    echo "Alerte : Espace disque > 80%"
  fi
  
  rotate_logs
  clean_old_backups
}

main
```

## Rollback

### Procédure de rollback

```bash
#!/bin/bash
# rollback.sh

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./rollback.sh <version>"
  exit 1
fi

# Arrêt des services
pm2 stop all

# Retour à la version précédente
git checkout $VERSION

# Installation des dépendances
npm ci --production

# Migration de la base de données
npm run migrate:rollback

# Redémarrage des services
pm2 start all
```

## Monitoring des performances

### Configuration New Relic

```javascript
// newrelic.js
exports.config = {
  app_name: ['Lydia API'],
  license_key: 'your_license_key',
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
};
``` 