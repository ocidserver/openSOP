# ⚡ Quick Start Guide - SOP Management System

**Panduan cepat untuk memulai menggunakan SOP Management System dalam 5 menit!**

---

## 🎯 Pilih Metode Setup Anda

### 🐳 Option 1: Docker (Recommended - Paling Mudah!)

**Prerequisites:** Docker Desktop terinstall

```bash
# 1. Clone project
git clone <repository-url>
cd openSOP

# 2. Start semua services
docker-compose up -d

# 3. Initialize database
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# 4. Buka browser
# http://localhost
```

**Login credentials:**

- Email: `admin@bps.go.id`
- Password: `admin123`

✅ **Selesai! Sistem sudah berjalan!**

---

### 💻 Option 2: Manual Setup (Development)

**Prerequisites:** Node.js 18+, PostgreSQL 14+

#### Step 1: Setup Database (5 menit)

```bash
# Install PostgreSQL (jika belum)
# Windows: Download dari postgresql.org
# Linux: sudo apt install postgresql

# Buat database
sudo -u postgres psql
CREATE DATABASE sop_db;
CREATE USER sop_user WITH PASSWORD 'sop_password_2025';
GRANT ALL PRIVILEGES ON DATABASE sop_db TO sop_user;
\q
```

#### Step 2: Setup Backend (3 menit)

```bash
# Clone project
git clone <repository-url>
cd openSOP/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env:
# DATABASE_URL="postgresql://sop_user:sop_password_2025@localhost:5432/sop_db"

# Setup database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Start server
npm run dev
```

✅ **Backend running di http://localhost:3000**

#### Step 3: Setup Frontend (2 menit)

```bash
# Buka terminal baru
cd openSOP/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

✅ **Frontend running di http://localhost:5173**

---

## 🎓 First Steps Tutorial

### 1️⃣ Login (30 detik)

1. Buka http://localhost:5173 (atau http://localhost jika pakai Docker)
2. Masukkan credentials:
   - Email: `admin@bps.go.id`
   - Password: `admin123`
3. Klik **"Masuk"**

### 2️⃣ Explore Dashboard (1 menit)

Anda akan melihat:

- 📊 **Statistik** - Total SOP, SOP Aktif, Draft, Pengguna
- 📄 **SOP Terbaru** - Daftar SOP yang baru dibuat
- 📝 **Aktivitas Terbaru** - Log aktivitas sistem
- ⚡ **Aksi Cepat** - Shortcut ke fitur utama

### 3️⃣ Lihat Daftar SOP (30 detik)

1. Klik **"Daftar SOP"** di sidebar
2. Anda akan melihat 1 sample SOP
3. Klik pada SOP untuk melihat detail

### 4️⃣ Buat SOP Baru (2 menit)

1. Klik **"Buat SOP Baru"** di sidebar atau dashboard
2. Isi form:
   ```
   Nomor SOP: SOP/BPS/2025/002
   Judul: Prosedur Input Data
   Deskripsi: Panduan untuk input data survei
   Tujuan: Memastikan data input akurat
   Ruang Lingkup: Tim data entry
   Departemen: Pilih "IPDS"
   Kompleksitas: Menengah
   ```
3. Klik **"Simpan Draft"**

✅ **SOP baru telah dibuat!**

### 5️⃣ Kelola Kategori (1 menit)

1. Klik **"Kategori"** di sidebar
2. Lihat kategori yang tersedia
3. Klik **"+ Tambah Kategori"** untuk membuat baru

### 6️⃣ Kelola Pengguna (1 menit)

1. Klik **"Pengguna"** di sidebar
2. Lihat daftar pengguna
3. Klik **"+ Tambah Pengguna"** untuk membuat akun baru

---

## 🔧 Common Tasks

### Menambah User Baru

```bash
# Via API (gunakan Postman/curl)
POST http://localhost:3000/api/auth/register
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "username": "newuser",
  "email": "user@bps.go.id",
  "password": "password123",
  "fullName": "User Baru",
  "role": "USER",
  "departmentId": "<department-uuid>"
}
```

### Backup Database

```bash
# Docker
docker-compose exec postgres pg_dump -U sop_user sop_db > backup.sql

# Manual
pg_dump -U sop_user sop_db > backup.sql
```

### Restore Database

```bash
# Docker
cat backup.sql | docker-compose exec -T postgres psql -U sop_user sop_db

# Manual
psql -U sop_user sop_db < backup.sql
```

### Restart Services

```bash
# Docker
docker-compose restart

# Manual - Backend
pm2 restart sop-ms-backend

# Manual - Frontend
# Ctrl+C lalu npm run dev lagi
```

---

## 📱 API Quick Reference

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bps.go.id","password":"admin123"}'

# Response akan berisi token, simpan untuk request selanjutnya
```

### Get SOPs

```bash
curl http://localhost:3000/api/sop \
  -H "Authorization: Bearer <your-token>"
```

### Create SOP

```bash
curl -X POST http://localhost:3000/api/sop \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sopNumber": "SOP/BPS/2025/003",
    "title": "Test SOP",
    "departmentId": "<department-uuid>"
  }'
```

---

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database

**Solusi:**

```bash
# Check PostgreSQL running
sudo systemctl status postgresql  # Linux
# atau cek Services di Windows

# Test connection
psql -U sop_user -d sop_db -h localhost

# Check .env file
cat backend/.env  # Pastikan DATABASE_URL benar
```

### Frontend tidak bisa hit API

**Solusi:**

```bash
# Check backend running
curl http://localhost:3000/health

# Check frontend .env
cat frontend/.env
# VITE_API_BASE_URL harus http://localhost:3000
```

### Docker container tidak start

**Solusi:**

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up --build -d

# Check ports not in use
netstat -an | grep 3000
netstat -an | grep 5432
```

### Migration error

**Solusi:**

```bash
# Reset database (WARNING: deletes all data!)
cd backend
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

---

## 📚 Next Steps

Setelah sistem berjalan:

1. **Baca User Manual** - `docs/USER_MANUAL.md`
2. **Pelajari API** - `docs/API.md`
3. **Setup Production** - `docs/DEPLOYMENT.md`
4. **Pahami Arsitektur** - `docs/ARCHITECTURE.md`

---

## 💡 Tips & Tricks

### Development Tips

```bash
# Watch mode untuk auto-restart backend
cd backend
npm run dev  # sudah include nodemon

# Clear Prisma cache jika ada masalah
npx prisma generate --force

# Reset dan seed database
npx prisma migrate reset --force

# View database dengan Prisma Studio
npx prisma studio
```

### Production Tips

```bash
# Check system health
curl http://your-server/health

# Monitor PM2 processes
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Database backup script (crontab)
0 2 * * * pg_dump -U sop_user sop_db > /backup/sop_$(date +\%Y\%m\%d).sql
```

---

## 🎯 Success Checklist

Setelah setup, verify:

- [ ] Backend API responding di `/health`
- [ ] Frontend loading di browser
- [ ] Bisa login dengan credentials default
- [ ] Dashboard menampilkan data
- [ ] Bisa membuat SOP baru
- [ ] Bisa melihat daftar SOP
- [ ] Database berisi seed data

---

## 📞 Get Help

**Stuck? Ada pertanyaan?**

1. Check [Troubleshooting](#troubleshooting) section
2. Read full documentation in `/docs`
3. Contact IT Support: support@bps.go.id

---

## 🎉 You're Ready!

Selamat! Sistem SOP Management sudah siap digunakan.

**Happy Managing SOPs! 📄✨**

---

**Quick Links:**

- 📖 [Full README](../README.md)
- 🔧 [API Docs](API.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 👤 [User Manual](USER_MANUAL.md)
- 🏛️ [Architecture](ARCHITECTURE.md)

---

_Last updated: November 2025 | Version 1.0.0_
