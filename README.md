# 📊 SOP Management System (openSOP)

**Sistem Pengelolaan Standar Operasional Prosedur untuk Badan Pusat Statistik (BPS) - IPDS OCID**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-brightgreen.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-Internal-red.svg)](LICENSE)

## 📑 Quick Navigation

- [🎯 Deskripsi](#-deskripsi-proyek)
- [🚀 Quick Start](#-quick-start) ← **Start Here!**
- [📊 Data SOP Real](#-data-sop-real)
- [🏗️ Arsitektur](#️-arsitektur-teknologi)
- [👥 User Roles](#-user-roles--permissions)
- [📚 Dokumentasi](#-dokumentasi)
- [🐳 Docker Deployment](#-deployment-dengan-docker)
- [🐛 Troubleshooting](#-troubleshooting)

## 🎯 Deskripsi Proyek

openSOP adalah sistem manajemen SOP berbasis web yang dirancang khusus untuk BPS IPDS OCID. Sistem ini mengelola 348 SOP real dari dokumen PDF yang telah diekstrak dan terstruktur dalam database. Mendukung siklus hidup lengkap dari perancangan hingga monitoring implementasi SOP.

### ✨ Fitur Utama

- **📚 348 Real SOP Data** - Data SOP real hasil ekstraksi dari PDF (348 ACTIVE)
- **🔍 Smart Search & Filter** - Pencarian cepat dengan filter kategori dan status
- **📊 Dashboard Monitoring** - Monitoring implementasi dan kepatuhan SOP
- **👥 Role-Based Access** - 7 level akses (Admin, Pimpinan, Supervisor, Staff, dll)
- **📄 Document Management** - Upload, versioning, dan management dokumen SOP
- **✅ Approval Workflow** - Workflow persetujuan untuk review dan aktivasi SOP
- **🎯 Actor & Evaluation** - Tracking pelaksana dan evaluasi SOP
- **📈 Reports & Analytics** - Laporan statistik dan analisis kepatuhan

## 🏗️ Arsitektur Teknologi

```javascript
{
  frontend: {
    framework: 'Vue.js 3.4.21',
    ui_library: 'PrimeVue 4.4.1',  // Modern UI components
    state_management: 'Pinia 2.x',
    http_client: 'Axios 1.x',
    router: 'Vue Router 4.x',
    build_tool: 'Vite 7.2.2'
  },
  backend: {
    runtime: 'Node.js 18+',
    framework: 'Express 4.18.2',
    authentication: 'JWT (jsonwebtoken)',
    validation: 'Joi 17.x',
    file_upload: 'Multer',
    logger: 'Winston',
    process_manager: 'PM2 (ecosystem.config.json)'
  },
  database: {
    primary: 'PostgreSQL 14+',
    orm: 'Prisma ORM 5.7.0',
    migrations: 'Prisma Migrate',
    source_import: 'SQLite (sop_v3_hybrid.db - 311 SOPs)'
  },
  deployment: {
    environment: 'On-premise server',
    containerization: 'Docker + Docker Compose',
    web_server: 'Nginx',
    ssl: 'SSL ready configuration'
  },
  data_sources: {
    real_sop_data: '311 SOPs extracted from PDF documents',
    categories: '6 main categories (Statistik, Administrasi, dll)',
    departments: 'IPDS and sub-units',
    status_types: '8 status (DRAFT, REVIEW, APPROVED, ACTIVE, etc.)'
  }
}
```

## 📁 Struktur Proyek

```
openSOP/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Database & app configuration
│   │   ├── controllers/       # API controllers (SOP, Actor, Evaluation, etc.)
│   │   ├── middleware/        # Auth, validation, error handler
│   │   ├── routes/            # API routes definition
│   │   └── server.js          # Main server file
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (311+ SOPs, Actors, Evaluations)
│   │   ├── seed.js            # Seed initial data (departments, categories, users)
│   │   ├── seed-real-sop.js   # Import 311 real SOPs from SQLite
│   │   ├── extracted-data.json # Extracted SOP metadata (8,154 lines)
│   │   └── migrations/        # Prisma migration history
│   ├── scripts/
│   │   └── extract-sop-metadata.js  # Extract SOPs from SQLite to JSON
│   ├── uploads/               # File storage for SOP documents
│   ├── logs/                  # Application logs
│   ├── ecosystem.config.json  # PM2 configuration
│   └── package.json
│
├── frontend/                  # Vue.js 3 + PrimeVue Application
│   ├── src/
│   │   ├── assets/           # Static assets (CSS, images)
│   │   ├── components/       # Reusable Vue components
│   │   ├── views/            # Page views
│   │   │   ├── SOP/          # SOP List, Detail, Create, Edit
│   │   │   ├── Dashboard/    # Dashboard & monitoring
│   │   │   ├── Monitoring/   # Monitoring implementation
│   │   │   └── MasterData/   # Categories, Departments, Users
│   │   ├── router/           # Vue Router configuration
│   │   ├── stores/           # Pinia stores (auth, sop, etc.)
│   │   ├── services/         # API service layer
│   │   │   ├── api.js        # Axios instance with interceptors
│   │   │   └── sopService.js # SOP API calls
│   │   ├── layout/           # Layout components
│   │   └── plugins/          # PrimeVue plugin setup
│   ├── nginx.conf            # Nginx configuration for production
│   └── package.json
│
├── docs/                     # Comprehensive documentation
│   ├── API.md               # API endpoints documentation
│   ├── ARCHITECTURE.md      # System architecture
│   ├── DEPLOYMENT.md        # Deployment guide
│   ├── USER_MANUAL.md       # User manual
│   └── QUICKSTART.md        # Quick start guide
│
├── nginx/                   # Nginx SSL configuration
│   └── nginx.conf
│
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Docker Compose for full stack
├── DATABASE_SETUP.md        # Database setup guide
├── PROJECT_STRUCTURE.md     # Detailed project structure
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **PostgreSQL 14+** - Database server
- **npm atau yarn** - Package manager
- **Git** - Version control
- **Docker & Docker Compose** (opsional, untuk deployment)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/ocidserver/openSOP.git
cd openSOP
```

### 2️⃣ Setup Database PostgreSQL

**Opsi A: Manual Setup (Windows)**

Lihat panduan lengkap di [DATABASE_SETUP.md](DATABASE_SETUP.md)

```bash
# Buat database
createdb sop_management
```

**Opsi B: Docker**

```bash
docker run --name postgres-sop \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=sop_management \
  -p 5432:5432 -d postgres:14
```

### 3️⃣ Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dengan konfigurasi database Anda
# DATABASE_URL="postgresql://user:password@localhost:5432/sop_management"

# Jalankan Prisma migrations
npx prisma migrate dev

# Seed data awal (departments, categories, users)
npx prisma db seed

# Import 348 real SOPs dari SQLite (PENTING!)
node prisma/seed-real-sop-v2.js

# Jalankan backend server
npm start
```

Backend akan berjalan di **http://localhost:3000**

✅ Endpoint tersedia: `http://localhost:3000/api`

### 4️⃣ Setup Frontend

```bash
# Buka terminal baru, masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Copy environment file (opsional)
cp .env.example .env

# Jalankan development server
npm run dev
```

Frontend akan berjalan di **http://localhost:5173** (atau 5174 jika port sudah dipakai)

### 5️⃣ Login ke Sistem

Default credentials (setelah seed):

```
Email: admin@bps.go.id
Password: admin123

atau

Email: user@bps.go.id
Password: user123
```

## 📊 Data SOP Real

Sistem ini sudah terisi dengan **348 SOP real** yang diekstrak dari dokumen PDF:

- **348 SOP ACTIVE** - SOP yang sudah tervalidasi dan aktif
- **Kategori:** Statistik (167), Pengadaan Barang/Jasa (52), Teknologi Informasi (73), Administrasi Umum (18), dll
- **Department:** IPDS dan unit terkait

### Ekstraksi Ulang Data SOP (jika diperlukan)

Jika Anda memiliki file `sop_v3_hybrid.db` (SQLite) dengan data SOP baru:

```bash
cd backend

# Ekstrak metadata dari SQLite ke JSON
node scripts/extract-sop-metadata.js

# Import ke PostgreSQL
node prisma/seed-real-sop.js
```

## 🐳 Deployment dengan Docker

```bash
# Build dan jalankan semua services
docker-compose up -d

# Jalankan database migrations
docker-compose exec backend npx prisma migrate deploy

# Lihat logs
docker-compose logs -f
```

Aplikasi akan tersedia di `http://localhost` (port 80)

## 👥 User Roles & Permissions

| Role                        | Level | Deskripsi                       | Akses                                      |
| --------------------------- | ----- | ------------------------------- | ------------------------------------------ |
| **ADMIN**                   | 1     | Administrator sistem            | Full access - CRUD semua data              |
| **PIMPINAN_TINGGI_UTAMA**   | 2     | Pimpinan tertinggi (Kepala BPS) | View all, approval akhir                   |
| **PIMPINAN_TINGGI_MADYA**   | 3     | Pimpinan madya (Deputi)         | View all, approval level tinggi            |
| **PIMPINAN_TINGGI_PRATAMA** | 4     | Pimpinan pratama (Direktur)     | View all, approval departemen              |
| **SUPERVISOR**              | 5     | Supervisor/Koordinator          | CRUD SOP, manage team, submit for approval |
| **STAFF**                   | 6     | Staff pelaksana                 | Create draft, view assigned SOPs           |
| **USER**                    | 7     | User umum/read-only             | Read-only access ke SOP ACTIVE             |

### Fitur per Role

**Admin:**

- Manage users, departments, categories
- Full CRUD SOP (semua status)
- System configuration
- View audit logs

**Pimpinan (Level 2-4):**

- View & review semua SOP
- Approve/reject SOP
- View monitoring & reports
- Add comments & feedback

**Supervisor:**

- Create & edit SOP
- Submit SOP for review
- Manage actors & evaluations
- View team performance

**Staff:**

- Create SOP draft
- Edit own draft SOPs
- View assigned SOPs
- Submit for supervisor review

**User:**

- View active SOPs
- Download SOP documents
- Search & filter SOPs

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder `/docs`:

- [📖 API Documentation](docs/API.md) - REST API endpoints & examples
- [🔧 Deployment Guide](docs/DEPLOYMENT.md) - Production deployment guide
- [👤 User Manual](docs/USER_MANUAL.md) - End-user guide
- [🏛️ Architecture Guide](docs/ARCHITECTURE.md) - System architecture & design
- [⚡ Quick Start](docs/QUICKSTART.md) - Quick start guide
- [🗄️ Database Setup](DATABASE_SETUP.md) - Database setup guide (Windows)
- [📊 Project Structure](PROJECT_STRUCTURE.md) - Detailed project structure

### Additional Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history & changes
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [SOP_AP_UPDATE_README.md](SOP_AP_UPDATE_README.md) - SOP Approval system update
- [MENU_STATUS_REPORT.md](MENU_STATUS_REPORT.md) - Menu implementation status

## 🔐 Keamanan

- **JWT-based authentication** - Secure token-based auth
- **Role-based access control (RBAC)** - 7-level role hierarchy
- **Password hashing** - bcrypt with salt rounds
- **File upload validation** - Type & size restrictions
- **SQL injection protection** - Prisma ORM prepared statements
- **XSS protection** - Input sanitization & output encoding
- **CORS configuration** - Cross-origin request handling
- **Rate limiting** - API request throttling (implementable)
- **HTTPS enforcement** - SSL/TLS in production
- **Environment variables** - Sensitive config in .env (not committed)
- **Audit logging** - Complete activity tracking

### Security Best Practices

1. **Change default passwords** after first deployment
2. **Use strong JWT secrets** (min 32 characters)
3. **Enable HTTPS** in production with valid SSL certificate
4. **Regular dependency updates** - Check `npm audit`
5. **Database backups** - Daily automated backups
6. **Access logs monitoring** - Review logs regularly

## 📊 Database Schema

**Core Tables:**

- **sop** - Master SOP documents (311 records)

  - Fields: sopNumber, title, purpose, scope, status, effectiveDate, versionNumber
  - Relations: department, createdBy, currentVersion, categories, actors, evaluations
  - Status: DRAFT, REVIEW, APPROVED, ACTIVE, REJECTED, REVISION, ARCHIVED, OBSOLETE

- **users** - User accounts & profiles

  - 7 role levels: ADMIN → PIMPINAN (3 levels) → SUPERVISOR → STAFF → USER
  - Auth: JWT token, password hashing (bcrypt)

- **departments** - Organizational units

  - Hierarchical structure (parent-child)
  - IPDS as main department

- **categories** - SOP categorization

  - 6+ categories: Statistik, Administrasi, Pengadaan, Penatausahaan, dll
  - Many-to-many with SOPs (SOPCategory junction)

- **sop_versions** - Version history & changes

  - Track all version changes with content
  - Created by & timestamp

- **actors** - SOP executors/actors

  - Link users to SOPs as actors
  - Track assignment & responsibility

- **evaluations** - SOP evaluation & compliance

  - Periodic evaluation records
  - Score, findings, recommendations

- **reports** - Implementation reports

  - SOPs implementation tracking
  - Submitted by actors

- **approval_flows** - Approval workflow tracking

  - Multi-level approval process
  - Status: PENDING, APPROVED, REJECTED

- **comments** - SOP comments & feedback
  - Discussion threads per SOP
  - Version-specific comments

**Supporting Tables:**

- `refresh_tokens` - JWT refresh token storage
- `sop_references` - External references per SOP
- `audit_logs` - Complete audit trail

📄 Lihat detail schema lengkap di [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend API tests
node test-sop-api.js

# Check database connection
npm run check-db

# Verify enum values
node check-enums.js

# Frontend unit tests
cd frontend
npm run test

# E2E tests (if configured)
npm run test:e2e
```

### API Testing dengan PowerShell

```powershell
# Test SOP endpoint
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/sop?page=1&limit=5" -Method GET
Write-Host "Total SOPs: $($response.data.pagination.total)"
Write-Host "First SOP: $($response.data.sops[0].title)"

# Test authentication
$body = @{ email = "admin@bps.go.id"; password = "admin123" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
Write-Host "Token: $($auth.data.token)"
```

## 🛠️ Maintenance

### Backup Database

```bash
# Manual backup PostgreSQL
pg_dump -U sop_user -d sop_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Docker backup
docker-compose exec postgres pg_dump -U sop_user sop_management > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Restore backup
psql -U sop_user -d sop_management < backup_20251114.sql
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Backend updates
cd backend
npm update
npm audit fix

# Frontend updates
cd frontend
npm update
npm audit fix

# Check for major version updates
npx npm-check-updates -u
npm install
```

### Database Maintenance

```bash
# Apply new migrations
cd backend
npx prisma migrate deploy

# Reset database (DANGER! Data will be lost)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio  # Opens at http://localhost:5555

# Generate fresh Prisma client
npx prisma generate
```

### Log Management

```bash
# View backend logs
cd backend
tail -f logs/combined.log
tail -f logs/error.log

# Clear old logs (older than 30 days)
find logs/ -name "*.log" -mtime +30 -delete

# PM2 logs (if using PM2)
pm2 logs sop-backend
pm2 flush  # Clear logs
```

### Performance Monitoring

```bash
# Check Node.js memory usage
node --max-old-space-size=4096 src/server.js

# Database query performance
# Use Prisma Studio or pg_stat_statements

# Monitor API response times
# Check logs/combined.log for slow queries
```

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**

```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Or kill all node processes
taskkill /F /IM node.exe
```

**2. Database connection error**

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U sop_user -d sop_management -c "SELECT 1"

# Check DATABASE_URL in .env
```

**3. Prisma migration issues**

```bash
# Reset migrations (DANGER!)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_issue
```

**4. Frontend not loading data**

- Check browser console for errors
- Verify backend is running on port 3000
- Check VITE_API_BASE_URL in frontend/.env
- Clear browser cache and refresh

**5. NPM dependency issues**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**6. JWT token expired**

```bash
# Clear localStorage in browser console
localStorage.removeItem('token')
localStorage.removeItem('user')

# Or adjust JWT expiry in backend/.env
JWT_EXPIRES_IN=7d
```

## 🚀 Performance Optimization

### Backend Optimization

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Add database indexes (in schema.prisma)
@@index([sopNumber])
@@index([status])
@@index([createdAt])

// Optimize Prisma queries
const sops = await prisma.sop.findMany({
  select: {
    id: true,
    sopNumber: true,
    title: true,
    // Only select needed fields
  },
  take: 100,
});
```

### Frontend Optimization

- Use lazy loading for routes
- Implement virtual scrolling for large lists
- Cache API responses
- Use production build: `npm run build`

## 📈 Statistics & Monitoring

### Current System Stats

- **Total SOPs:** 348 (348 ACTIVE)
- **Categories:** 9 main categories
- **Departments:** IPDS + sub-units
- **Users:** Multiple roles (Admin, Pimpinan, Staff, etc.)
- **API Endpoints:** 30+ endpoints
- **Database Tables:** 15+ tables

### Monitoring Dashboard

Access monitoring features at:

- **Frontend:** `http://localhost:5174/monitoring`
- **API Health:** `http://localhost:3000/api/health`
- **Database Studio:** `npx prisma studio` → `http://localhost:5555`

## 📞 Support

Untuk pertanyaan, bantuan, atau melaporkan bug:

- **Repository:** [github.com/ocidserver/openSOP](https://github.com/ocidserver/openSOP)
- **Issues:** [GitHub Issues](https://github.com/ocidserver/openSOP/issues)
- **Email:** ipds.ocid@bps.go.id
- **Tim Development:** BPS IPDS OCID

## 🤝 Contributing

Kami menerima kontribusi! Silakan baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk guidelines.

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 Lisensi

Proyek ini dikembangkan khusus untuk internal **Badan Pusat Statistik (BPS) - IPDS OCID**.  
All rights reserved © 2025 BPS.

## 🙏 Acknowledgments

- **BPS IPDS OCID** - Project sponsor & requirements
- **Vue.js & PrimeVue Team** - Frontend framework & UI components
- **Prisma Team** - Database ORM
- **PostgreSQL Community** - Database system

---

**Dikembangkan dengan ❤️ oleh Tim BPS IPDS OCID**

_Version 1.0.1 - November 2025_

📊 **System Status:** ✅ Production Ready | 348 Real SOPs | Active Development
