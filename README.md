# 📊 SOP Management System (SOP-MS)

**Sistem Pengelolaan Standar Operasional Prosedur untuk Badan Pusat Statistik (BPS)**

## 🎯 Deskripsi Proyek

SOP-MS adalah sistem manajemen SOP berbasis web yang dirancang khusus untuk BPS tingkat Provinsi. Sistem ini berfungsi sebagai _single source of truth_ untuk semua dokumen SOP, mendukung siklus hidup lengkap dari perancangan hingga pelacakan kepatuhan.

### ✨ Fitur Utama

- **📝 Visual BPMN Editor** - Editor visual untuk memodelkan alur kerja SOP
- **📄 Document Generator** - Generate dokumen SOP formal (PDF/DOCX) dari BPMN
- **🔄 Version Control** - Pelacakan perubahan lengkap dengan audit trail
- **✅ Approval Workflow** - Alur persetujuan terstruktur dan dapat dikonfigurasi
- **🔍 Search & Categorization** - Pencarian cepat dengan sistem kategorisasi fleksibel
- **📊 Compliance Tracking** - Pelacakan kepatuhan dan implementasi SOP

## 🏗️ Arsitektur Teknologi

```javascript
{
  frontend: {
    framework: 'Vue.js 3',
    ui_components: 'Vuetify 3',
    state_management: 'Pinia',
    http_client: 'Axios'
  },
  backend: {
    framework: 'Node.js + Express',
    authentication: 'JWT',
    validation: 'Joi',
    file_processing: 'Multer'
  },
  database: {
    primary: 'PostgreSQL',
    orm: 'Prisma ORM',
    migrations: 'Prisma Migrate'
  },
  deployment: {
    environment: 'On-premise server',
    containerization: 'Docker + Docker Compose',
    web_server: 'Nginx',
    process_manager: 'PM2'
  }
}
```

## 📁 Struktur Proyek

```
openSOP/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Konfigurasi aplikasi
│   │   ├── controllers/ # Controller API
│   │   ├── middleware/  # Middleware (auth, validation, dll)
│   │   ├── routes/      # Definisi route API
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Helper functions
│   │   └── prisma/      # Prisma schema & migrations
│   ├── uploads/         # File storage
│   └── package.json
│
├── frontend/            # Vue.js 3 Application
│   ├── src/
│   │   ├── assets/     # Static assets
│   │   ├── components/ # Vue components
│   │   ├── views/      # Page views
│   │   ├── router/     # Vue Router
│   │   ├── stores/     # Pinia stores
│   │   ├── services/   # API services
│   │   └── plugins/    # Vuetify & other plugins
│   └── package.json
│
├── nginx/              # Nginx configuration
├── docs/               # Dokumentasi lengkap
├── docker-compose.yml  # Docker Compose configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (untuk deployment)
- npm atau yarn

### 1️⃣ Setup Database

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Setup database dengan Prisma
npx prisma migrate dev --name init

# Seed data awal (opsional)
npx prisma db seed
```

### 2️⃣ Setup Backend

```bash
# Masih di folder backend
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Jalankan development server
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### 3️⃣ Setup Frontend

```bash
# Buka terminal baru, masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

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

| Role         | Deskripsi                          | Akses                       |
| ------------ | ---------------------------------- | --------------------------- |
| **Admin**    | Administrator sistem               | Full access ke semua fitur  |
| **Manager**  | Pengelola SOP (Department Manager) | CRUD SOP, approval workflow |
| **Reviewer** | Reviewer SOP                       | Review & comment pada SOP   |
| **User**     | Pegawai biasa                      | Read-only access ke SOP     |

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder `/docs`:

- [📖 API Documentation](docs/API.md)
- [🔧 Deployment Guide](docs/DEPLOYMENT.md)
- [👤 User Manual](docs/USER_MANUAL.md)
- [🏛️ Architecture Guide](docs/ARCHITECTURE.md)

## 🔐 Keamanan

- JWT-based authentication
- Role-based access control (RBAC)
- File upload validation
- SQL injection protection (via Prisma ORM)
- XSS protection
- HTTPS enforcement (production)

## 📊 Database Schema

**Core Tables:**

- `users` - User accounts & profiles
- `departments` - Departemen/Unit kerja
- `sop_documents` - Master SOP documents
- `sop_versions` - Version history
- `sop_categories` - Kategorisasi SOP
- `approval_workflows` - Workflow persetujuan
- `audit_logs` - Audit trail lengkap

Lihat detail schema di `backend/prisma/schema.prisma`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 🛠️ Maintenance

### Backup Database

```bash
# Backup database PostgreSQL
docker-compose exec postgres pg_dump -U sop_user sop_db > backup_$(date +%Y%m%d).sql
```

### Update Dependencies

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

## 📞 Support

Untuk pertanyaan atau bantuan, hubungi:

- **Email:** support@bps.go.id
- **Tim IT BPS Provinsi**

## 📄 Lisensi

Proyek ini dikembangkan khusus untuk internal Badan Pusat Statistik (BPS).

---

**Dikembangkan dengan ❤️ untuk BPS**

_Version 1.0.0 - November 2025_
