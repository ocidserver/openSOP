# 🗄️ Setup Database PostgreSQL - Step by Step

## ✅ Status Saat Ini

- ✅ PostgreSQL 17.6 **SUDAH TERINSTALL**
- ✅ PostgreSQL Service **RUNNING**
- ✅ pgAdmin 4 **TERSEDIA**

---

## 🎯 Pilih Metode Setup:

### **Metode 1: pgAdmin 4 (GUI - PALING MUDAH)** ⭐

### **Metode 2: Command Line (psql)**

### **Metode 3: SQL Script**

---

## 📱 METODE 1: pgAdmin 4 (RECOMMENDED)

### Langkah-langkah:

#### 1. Buka pgAdmin 4

```
Start Menu → pgAdmin 4
```

#### 2. Connect ke PostgreSQL Server

- Klik kanan **"Servers"** → **"Register"** → **"Server"** (jika belum ada)
- Atau expand **"PostgreSQL 17"** yang sudah ada
- Masukkan password postgres saat diminta

#### 3. Create User (Login Role)

1. Expand **"PostgreSQL 17"**
2. Klik kanan **"Login/Group Roles"**
3. **"Create"** → **"Login/Group Role"**

**Tab General:**

- Name: `sop_user`

**Tab Definition:**

- Password: `sop_password_2025`
- Confirm password: `sop_password_2025`

**Tab Privileges:**

- ✅ Can login?: **Yes**
- ✅ Superuser?: **No**
- ✅ Create roles?: **No**
- ✅ Create databases?: **Yes**
- ✅ Inherit rights from parent roles?: **Yes**

Klik **"Save"**

#### 4. Create Database

1. Klik kanan **"Databases"**
2. **"Create"** → **"Database"**

**Tab General:**

- Database: `sop_db`
- Owner: `sop_user` (pilih dari dropdown)
- Comment: `SOP Management System Database`

Klik **"Save"**

#### 5. Verify

1. Expand **"Databases"**
2. Klik **"sop_db"**
3. Lihat **"Properties"** → Owner harus **sop_user**

✅ **DONE!** Database siap digunakan!

---

## 💻 METODE 2: Command Line (psql)

### Langkah-langkah:

#### 1. Buka PowerShell di folder backend

```powershell
cd C:\Users\IPDS-OCID\openSOP\backend
```

#### 2. Connect ke PostgreSQL

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres
# Masukkan password postgres
```

#### 3. Run SQL Commands

Di dalam psql prompt (`postgres=#`), jalankan:

```sql
-- Create user
CREATE USER sop_user WITH PASSWORD 'sop_password_2025';

-- Create database
CREATE DATABASE sop_db OWNER sop_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sop_db TO sop_user;

-- Connect to new database
\c sop_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO sop_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sop_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sop_user;

-- Verify
\l
\du

-- Quit
\q
```

✅ **DONE!**

---

## 📄 METODE 3: SQL Script

### Langkah-langkah:

#### 1. Jalankan Setup Script

```powershell
cd C:\Users\IPDS-OCID\openSOP\backend

# Run setup script
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -f setup-database.sql
# Masukkan password postgres saat diminta
```

**Output yang diharapkan:**

```
CREATE ROLE
CREATE DATABASE
GRANT
✓ Database setup completed!
✓ Database: sop_db
✓ User: sop_user
✓ Password: sop_password_2025

Connection string:
postgresql://sop_user:sop_password_2025@localhost:5432/sop_db
```

✅ **DONE!**

---

## 🧪 VERIFY DATABASE SETUP

### Test 1: Connection dengan psql

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U sop_user -d sop_db
# Password: sop_password_2025
```

**Jika sukses, Anda akan lihat:**

```
sop_db=>
```

**Test query:**

```sql
SELECT version();
\dt
\q
```

### Test 2: Prisma Connection

```powershell
cd C:\Users\IPDS-OCID\openSOP\backend

# Generate Prisma Client
npx prisma generate

# Test connection
npx prisma db execute --stdin <<< "SELECT 1"
```

**Jika sukses:**

```
✓ Prisma Client generated
✓ Connection successful
```

---

## 🚀 LANJUT KE MIGRATION

Setelah database ready, jalankan:

### 1. Generate Prisma Client

```powershell
npx prisma generate
```

### 2. Run Migrations

```powershell
npx prisma migrate deploy
```

**Output:**

```
✓ Applied 1 migration
  └─ 20250111_initial_schema
```

### 3. Seed Database

```powershell
npx prisma db seed
```

**Output:**

```
🌱 Seeding database...
✓ Created admin user (admin@bps.go.id)
✓ Created 3 departments
✓ Created 5 categories
✓ Created 2 sample SOPs
✓ Database seeded successfully!
```

### 4. Open Prisma Studio (Optional)

```powershell
npx prisma studio
```

Browser akan terbuka di http://localhost:5555

### 5. Start Backend

```powershell
npm run dev
```

**Output:**

```
✓ Prisma connected to database
✓ Server running on http://localhost:3000
```

---

## 🎨 Visual Guide (pgAdmin 4)

### Screenshot Checklist:

1. **Login/Group Roles:**

   ```
   ├── postgres
   └── sop_user ← Should exist
   ```

2. **Databases:**

   ```
   ├── postgres
   ├── template0
   ├── template1
   └── sop_db ← Should exist
       └── Schemas
           └── public
   ```

3. **Properties sop_db:**
   - Owner: sop_user ✓
   - Encoding: UTF8 ✓

---

## 🐛 Troubleshooting

### Error: "role does not exist"

```powershell
# Login sebagai postgres
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres

# Create user lagi
CREATE USER sop_user WITH PASSWORD 'sop_password_2025';
\q
```

### Error: "database does not exist"

```powershell
# Login sebagai postgres
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres

# Create database lagi
CREATE DATABASE sop_db OWNER sop_user;
\q
```

### Error: "password authentication failed"

**Cek .env file:**

```env
DATABASE_URL="postgresql://sop_user:sop_password_2025@localhost:5432/sop_db?schema=public"
```

Pastikan password match!

### Lupa Password Postgres?

**Reset dengan:**

1. Buka `C:\Program Files\PostgreSQL\17\data\pg_hba.conf`
2. Ubah `md5` jadi `trust` di line localhost
3. Restart service: `Restart-Service postgresql-x64-17`
4. Login tanpa password: `psql -U postgres`
5. Ganti password: `ALTER USER postgres PASSWORD 'new_password';`
6. Kembalikan `trust` ke `md5` di pg_hba.conf
7. Restart service lagi

---

## 📋 Quick Commands Reference

```powershell
# Connect as postgres
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres

# Connect as sop_user
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U sop_user -d sop_db

# List databases
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -c "\l"

# List users
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -c "\du"

# Check service status
Get-Service postgresql-x64-17

# Restart service
Restart-Service postgresql-x64-17
```

---

## ✅ Setup Checklist

- [ ] PostgreSQL 17 installed and running
- [ ] pgAdmin 4 accessible
- [ ] User `sop_user` created
- [ ] Database `sop_db` created with correct owner
- [ ] `.env` file configured
- [ ] Connection tested
- [ ] Prisma client generated
- [ ] Migrations applied
- [ ] Database seeded
- [ ] Backend server running

---

## 🎯 Recommended Path

**Untuk Anda:**

1. ✅ Gunakan **pgAdmin 4** (paling visual dan mudah)
2. ✅ Create user `sop_user`
3. ✅ Create database `sop_db`
4. ✅ Run `npx prisma generate`
5. ✅ Run `npx prisma migrate deploy`
6. ✅ Run `npx prisma db seed`
7. ✅ Run `npm run dev`

Total time: ~10 menit

---

**Pilih salah satu metode dan ikuti langkah-langkahnya!**

Saya recommend **Metode 1 (pgAdmin 4)** karena paling mudah dan visual.

---

**Created:** November 11, 2025  
**PostgreSQL Version:** 17.6  
**For:** SOP Management System v1.0.1
