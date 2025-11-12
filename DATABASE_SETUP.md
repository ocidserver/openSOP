# 🗄️ Database Setup Guide - SOP Management System

## 📋 Pilihan Setup Database

Ada 3 cara setup database PostgreSQL untuk aplikasi ini:

1. **Docker Compose** (Recommended - Paling Mudah)
2. **PostgreSQL Installer** (Windows Native)
3. **Menggunakan Database Service** (ElephantSQL, Supabase, dll)

---

## 🐳 Pilihan 1: Docker Compose (RECOMMENDED)

### Kenapa Docker?

✅ Paling mudah dan cepat  
✅ Tidak perlu install PostgreSQL manual  
✅ Semua service (DB, Backend, Frontend) berjalan dengan 1 command  
✅ Environment isolated, tidak bentrok dengan aplikasi lain

### Langkah-langkah:

#### 1. Install Docker Desktop

**Download:** https://www.docker.com/products/docker-desktop/

**Instalasi:**

```powershell
# Download installer dari link di atas
# Install Docker Desktop for Windows
# Restart komputer setelah install
# Buka Docker Desktop dan tunggu sampai running
```

#### 2. Verify Docker

```powershell
docker --version
# Output: Docker version 24.x.x

docker-compose --version
# Output: Docker Compose version v2.x.x
```

#### 3. Start Database dengan Docker Compose

```powershell
# Di folder root openSOP
cd C:\Users\IPDS-OCID\openSOP

# Start database saja
docker-compose up -d postgres

# Cek status
docker-compose ps

# Lihat logs
docker-compose logs postgres
```

#### 4. Verify Database

```powershell
# Connect ke PostgreSQL container
docker-compose exec postgres psql -U sop_user -d sop_db

# Di dalam psql prompt, coba:
\l              # List databases
\q              # Quit
```

#### 5. Run Migrations

```powershell
cd backend
npx prisma migrate deploy
npx prisma db seed
```

✅ **DONE! Database siap digunakan!**

---

## 💻 Pilihan 2: PostgreSQL Installer (Windows Native)

### Langkah-langkah:

#### 1. Download PostgreSQL

**Link:** https://www.postgresql.org/download/windows/

**Versi:** PostgreSQL 14+ atau 15+

#### 2. Install PostgreSQL

```
- Run installer
- Set password untuk user 'postgres' (contoh: postgres123)
- Port: 5432 (default)
- Locale: Default
- Centang "pgAdmin 4" (GUI tool)
- Install!
```

#### 3. Create Database dan User

**Opsi A: Menggunakan pgAdmin 4 (GUI)**

1. Buka pgAdmin 4
2. Connect ke localhost
3. Right-click "Databases" → Create → Database
   - Name: `sop_db`
4. Right-click "Login/Group Roles" → Create → Login/Group Role
   - General tab: Name = `sop_user`
   - Definition tab: Password = `sop_password_2025`
   - Privileges tab: Centang semua

**Opsi B: Menggunakan Command Line (PowerShell)**

```powershell
# Masuk ke psql sebagai postgres
psql -U postgres

# Di dalam psql prompt:
CREATE USER sop_user WITH PASSWORD 'sop_password_2025';
CREATE DATABASE sop_db OWNER sop_user;
GRANT ALL PRIVILEGES ON DATABASE sop_db TO sop_user;
\q
```

#### 4. Update .env (jika perlu)

```env
DATABASE_URL="postgresql://sop_user:sop_password_2025@localhost:5432/sop_db?schema=public"
```

#### 5. Run Migrations

```powershell
cd C:\Users\IPDS-OCID\openSOP\backend
npx prisma migrate deploy
npx prisma db seed
```

✅ **DONE! Database siap digunakan!**

---

## ☁️ Pilihan 3: Database as a Service (Cloud)

### Untuk Development/Testing Cepat

#### ElephantSQL (Free Tier)

1. **Sign Up:** https://www.elephantsql.com/
2. **Create Instance:**
   - Name: sop-db-dev
   - Plan: Tiny Turtle (Free)
   - Region: Pilih terdekat
3. **Copy URL:**
   ```
   postgres://username:password@host/database
   ```
4. **Update .env:**
   ```env
   DATABASE_URL="postgres://username:password@host/database?schema=public"
   ```
5. **Run Migrations:**
   ```powershell
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

#### Supabase (Free Tier)

1. **Sign Up:** https://supabase.com/
2. **Create Project**
3. **Copy Database URL** dari Settings → Database
4. **Update .env**
5. **Run Migrations**

---

## 🔧 Setup Setelah Database Ready

### 1. Generate Prisma Client

```powershell
cd C:\Users\IPDS-OCID\openSOP\backend
npx prisma generate
```

### 2. Run Migrations

```powershell
npx prisma migrate deploy
```

**Output yang diharapkan:**

```
Applying migration `20250111_initial_schema`
✓ Applied 1 migration
```

### 3. Seed Database (Data Awal)

```powershell
npx prisma db seed
```

**Output yang diharapkan:**

```
🌱 Seeding database...
✓ Created admin user
✓ Created departments
✓ Created categories
✓ Created sample SOPs
✓ Database seeded successfully
```

### 4. Verify Database

```powershell
npx prisma studio
```

Browser akan terbuka dengan Prisma Studio (GUI untuk lihat data)

---

## 🧪 Test Connection

### Test 1: Prisma Connection

```powershell
# Di folder backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✓ Database connected')).catch(e => console.error('✗ Connection failed:', e.message))"
```

### Test 2: Start Backend

```powershell
npm run dev
```

**Output yang diharapkan:**

```
✓ Prisma connected to database
✓ Server running on http://localhost:3000
```

### Test 3: API Test

Buka browser: http://localhost:3000/api/health

**Response:**

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 📊 Database Schema Overview

Setelah migration, database akan memiliki:

| Table                | Purpose                    |
| -------------------- | -------------------------- |
| `users`              | User accounts              |
| `departments`        | Organizational departments |
| `categories`         | SOP categories             |
| `sop_documents`      | Main SOP records           |
| `sop_versions`       | Version history            |
| `attachments`        | File attachments           |
| `approval_workflows` | Approval processes         |
| `approval_actions`   | Approval steps             |
| `read_receipts`      | Compliance tracking        |
| `comments`           | User comments              |
| `audit_logs`         | System audit trail         |

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Cek:**

```powershell
# PostgreSQL service running?
# Windows: Services → PostgreSQL

# Docker: Container running?
docker-compose ps

# Firewall blocking port 5432?
Test-NetConnection -ComputerName localhost -Port 5432
```

**Fix:**

```powershell
# Start PostgreSQL service (Windows)
Start-Service -Name postgresql-x64-14

# Or restart Docker
docker-compose restart postgres
```

### Error: "Password authentication failed"

**Cek .env:**

```env
# Pastikan kredensial match dengan database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
```

### Error: "Database does not exist"

**Create database:**

```powershell
# Docker
docker-compose exec postgres createdb -U sop_user sop_db

# Native PostgreSQL
psql -U postgres -c "CREATE DATABASE sop_db"
```

### Error: "Port 5432 already in use"

**Find process:**

```powershell
netstat -ano | findstr :5432
```

**Kill process:**

```powershell
taskkill /PID <PID> /F
```

---

## 🔐 Security Notes

### Production Deployment

1. **Change default credentials!**

   ```env
   DATABASE_URL="postgresql://production_user:STRONG_PASSWORD@host:5432/production_db"
   ```

2. **Enable SSL:**

   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

3. **Restrict access:**
   - Only allow backend IP to connect
   - Use firewall rules
   - Regular backups

---

## 📝 Quick Reference

### Prisma Commands

```powershell
npx prisma generate          # Generate Prisma Client
npx prisma migrate dev       # Create & apply migration (dev)
npx prisma migrate deploy    # Apply migrations (production)
npx prisma db seed           # Seed database
npx prisma studio            # Open Prisma Studio GUI
npx prisma db push           # Push schema without migration
npx prisma migrate reset     # Reset database (WARNING: deletes all data)
```

### Docker Commands

```powershell
docker-compose up -d              # Start all services
docker-compose up -d postgres     # Start database only
docker-compose stop               # Stop services
docker-compose down               # Stop and remove containers
docker-compose down -v            # Stop and remove with volumes (data)
docker-compose logs postgres      # View PostgreSQL logs
docker-compose exec postgres psql -U sop_user -d sop_db  # Connect to DB
```

---

## ✅ Checklist

- [ ] PostgreSQL terinstall/running
- [ ] Database `sop_db` created
- [ ] User `sop_user` created dengan privileges
- [ ] `.env` file configured
- [ ] `npx prisma generate` sukses
- [ ] `npx prisma migrate deploy` sukses
- [ ] `npx prisma db seed` sukses
- [ ] Connection test passed
- [ ] Backend server running

---

**Pilih salah satu metode di atas dan ikuti langkah-langkahnya!**

Saya **recommend Docker** karena paling mudah dan cepat untuk development.

Jika ada error, lihat section Troubleshooting atau hubungi BPS IT Team.

---

**Created:** November 11, 2025  
**For:** SOP Management System v1.0.1
