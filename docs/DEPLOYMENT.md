# PassKeyPer Production Deployment Guide

This guide covers deploying PassKeyPer to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Cloud Deployment Options](#cloud-deployment-options)
4. [Security Checklist](#security-checklist)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

- Docker & Docker Compose v2.0+
- Domain name with DNS access
- SSL certificate (or use Let's Encrypt)
- PostgreSQL 14+ (if not using Docker)
- Node.js 20+ (for local development)

---

## Quick Start with Docker

### 1. Clone and Configure

```bash
git clone https://github.com/donapart/PassKeyPer.git
cd PassKeyPer

# Copy environment template
cp .env.example .env

# Generate secure secrets
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)" >> .env
echo "REDIS_PASSWORD=$(openssl rand -base64 32)" >> .env
```

### 2. Start Services

```bash
# Development (with hot reload)
docker-compose up

# Production (with Nginx)
docker-compose --profile production up -d
```

### 3. Initialize Database

```bash
docker-compose exec api npx prisma migrate deploy
```

### 4. Verify Deployment

```bash
curl http://localhost:3000/health
# Expected: {"status":"healthy","timestamp":"..."}
```

---

## Cloud Deployment Options

### Option A: DigitalOcean App Platform

1. Create a new App from GitHub repo
2. Configure environment variables in App settings
3. Add managed PostgreSQL database
4. Enable auto-deploy on push

### Option B: AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URL
docker build -t passkeyper-api -f services/api/Dockerfile .
docker tag passkeyper-api:latest $ECR_URL/passkeyper-api:latest
docker push $ECR_URL/passkeyper-api:latest

# Deploy with ECS CLI or CloudFormation template
```

### Option C: Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/$PROJECT_ID/passkeyper-api

# Deploy
gcloud run deploy passkeyper-api \
  --image gcr.io/$PROJECT_ID/passkeyper-api \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

### Option D: Railway / Render

1. Connect GitHub repository
2. Select `Dockerfile` deployment
3. Add environment variables
4. Deploy automatically

---

## Security Checklist

### Before Production Launch

- [ ] **Secrets**: All secrets are unique and stored securely
- [ ] **HTTPS**: SSL/TLS enabled with valid certificate
- [ ] **CORS**: Restrict to known origins
- [ ] **Rate Limiting**: Enabled and configured
- [ ] **Database**: Strong password, SSL connection
- [ ] **Firewall**: Only necessary ports exposed
- [ ] **Updates**: All dependencies up to date
- [ ] **Backups**: Automated database backups configured
- [ ] **Monitoring**: Error tracking & uptime monitoring

### Generate Secure Secrets

```bash
# JWT Secret
openssl rand -base64 64

# Database Password
openssl rand -base64 32

# Session Secret
openssl rand -hex 32
```

---

## Monitoring & Maintenance

### Health Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Basic health check |
| `GET /health/db` | Database connectivity |
| `GET /health/redis` | Redis connectivity |

### Logs

```bash
# View API logs
docker-compose logs -f api

# View all logs
docker-compose logs -f
```

### Database Backups

```bash
# Manual backup
docker-compose exec postgres pg_dump -U passkeyper passkeyper > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U passkeyper passkeyper
```

### Updates

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy
```

---

## Troubleshooting

### Common Issues

**Container won't start**

```bash
docker-compose logs api
# Check for missing environment variables or port conflicts
```

**Database connection failed**

```bash
# Verify DATABASE_URL is correct
docker-compose exec api npx prisma db push --preview-feature
```

**High memory usage**

```bash
# Limit container memory
docker-compose up -d --scale api=2
```

---

## Support

- **Issues**: <https://github.com/donapart/PassKeyPer/issues>
- **Discussions**: <https://github.com/donapart/PassKeyPer/discussions>
- **Security**: <security@passkeyper.app>
