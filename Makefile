# PassKeyPer Makefile
# Common commands for development and deployment

.PHONY: help install dev build test docker-build docker-up docker-down deploy clean

# Default target
help:
	@echo "PassKeyPer - Available Commands"
	@echo "================================"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development servers"
	@echo "  make build       - Build all packages"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linting"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build  - Build Docker images"
	@echo "  make docker-up     - Start Docker containers"
	@echo "  make docker-down   - Stop Docker containers"
	@echo "  make docker-logs   - View Docker logs"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate    - Run database migrations"
	@echo "  make db-seed       - Seed database with test data"
	@echo "  make db-reset      - Reset database"
	@echo ""
	@echo "Production:"
	@echo "  make deploy-staging    - Deploy to staging"
	@echo "  make deploy-production - Deploy to production"
	@echo ""

# ===========================================
# DEVELOPMENT
# ===========================================

install:
	npm ci
	cd services/api && npx prisma generate

dev:
	npm run dev

build:
	npm run build

test:
	npm test

lint:
	npm run lint

type-check:
	npm run type-check

# ===========================================
# DOCKER
# ===========================================

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

docker-clean:
	docker-compose down -v --rmi all

# ===========================================
# DATABASE
# ===========================================

db-migrate:
	cd services/api && npx prisma migrate deploy

db-migrate-dev:
	cd services/api && npx prisma migrate dev

db-seed:
	cd services/api && npx prisma db seed

db-reset:
	cd services/api && npx prisma migrate reset --force

db-studio:
	cd services/api && npx prisma studio

# ===========================================
# PRODUCTION
# ===========================================

deploy-staging:
	@echo "Deploying to staging..."
	git push origin develop

deploy-production:
	@echo "Deploying to production..."
	@read -p "Enter version (e.g., v0.7.0): " version; \
	git tag $$version && git push origin $$version

# ===========================================
# UTILITIES
# ===========================================

clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf coverage
	rm -rf .next
	find . -name "*.log" -delete

generate-secret:
	@openssl rand -base64 64

check-deps:
	npm outdated

update-deps:
	npm update
