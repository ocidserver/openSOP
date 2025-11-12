# 🚀 Deployment Guide - SOP Management System

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **npm** or **yarn**
- **Git**

### For Docker Deployment

- **Docker** 20.10 or higher
- **Docker Compose** 2.0 or higher

### Server Requirements (Production)

- **OS:** Ubuntu 20.04 LTS or higher
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** Minimum 20GB
- **CPU:** 2 cores minimum

---

## Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd openSOP
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
notepad .env  # Windows
nano .env     # Linux/Mac

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with initial data
npx prisma db seed

# Start development server
npm run dev
```

Backend will run on http://localhost:3000

### 3. Frontend Setup

Open new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

---

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### 1. Prepare Environment

```bash
# Clone repository
git clone <repository-url>
cd openSOP

# Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment files for production
nano backend/.env
nano frontend/.env
```

#### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 3. Initialize Database

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed initial data
docker-compose exec backend npx prisma db seed
```

#### 4. Access Application

Application will be available at:

- **Frontend:** http://your-server-ip
- **API:** http://your-server-ip/api

Default credentials:

- **Admin:** admin@bps.go.id / admin123
- **Manager:** manager@bps.go.id / admin123

---

### Option 2: Manual Deployment

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

#### 2. Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE sop_db;
CREATE USER sop_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sop_db TO sop_user;
\q
```

#### 3. Deploy Backend

```bash
cd backend

# Install dependencies
npm ci --only=production

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Start with PM2
pm2 start ecosystem.config.json
pm2 save
pm2 startup
```

#### 4. Deploy Frontend

```bash
cd ../frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Copy build to web directory
sudo cp -r dist/* /var/www/html/
```

#### 5. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp ../nginx/nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Environment Configuration

### Backend (.env)

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://sop_user:password@localhost:5432/sop_db"

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://your-domain.com
```

### Frontend (.env)

```env
# API
VITE_API_BASE_URL=http://your-domain.com/api

# Application
VITE_APP_TITLE=SOP Management System
```

---

## Database Setup

### Initial Migration

```bash
cd backend
npx prisma migrate deploy
```

### Seed Data

```bash
npx prisma db seed
```

### Backup Database

```bash
# Backup
pg_dump -U sop_user sop_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U sop_user sop_db < backup_20250101.sql
```

---

## SSL/HTTPS Setup

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 2. Obtain Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

### 3. Auto-renewal

```bash
sudo certbot renew --dry-run
```

---

## Monitoring & Maintenance

### PM2 Commands

```bash
# View processes
pm2 list

# View logs
pm2 logs

# Restart application
pm2 restart sop-ms-backend

# Monitor resources
pm2 monit

# Stop application
pm2 stop sop-ms-backend
```

### Docker Commands

```bash
# View containers
docker-compose ps

# View logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Stop all services
docker-compose down

# Update and rebuild
docker-compose up -d --build
```

### Database Maintenance

```bash
# Vacuum database
sudo -u postgres vacuumdb -d sop_db -z -v

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('sop_db'));"
```

---

## Troubleshooting

### Backend not starting

1. Check logs: `pm2 logs` or `docker-compose logs backend`
2. Verify database connection
3. Check environment variables
4. Ensure migrations are applied

### Frontend not loading

1. Check Nginx configuration: `sudo nginx -t`
2. Verify build files exist in `/var/www/html/`
3. Check browser console for errors
4. Verify API URL in frontend .env

### Database connection issues

1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify credentials in .env
3. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-14-main.log`
4. Test connection: `psql -U sop_user -d sop_db`

### Port conflicts

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Restrict database access
- [ ] Update dependencies regularly
- [ ] Monitor logs for suspicious activity

---

## Support

For issues or questions:

- Check logs first
- Review this documentation
- Contact IT support team
- Email: support@bps.go.id

---

**Last Updated:** November 2025  
**Version:** 1.0.0
