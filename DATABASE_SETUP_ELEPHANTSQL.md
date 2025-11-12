# ⚡ Quick Database Setup - ElephantSQL (5 Menit)

## 🚀 Kenapa ElephantSQL?

✅ **FREE** - Gratis untuk development  
✅ **Cepat** - 5 menit setup, langsung jalan  
✅ **Tidak perlu install** - Cloud-based  
✅ **20MB storage** - Cukup untuk development  
✅ **Reliable** - Managed PostgreSQL service

---

## 📝 Langkah-langkah Setup

### 1. Sign Up ElephantSQL

🔗 **Link:** https://customer.elephantsql.com/signup

- Pilih "Sign up" (gratis)
- Isi email dan password
- Verify email

### 2. Create New Instance

1. Klik **"Create New Instance"**
2. **Name:** `sop-db-dev`
3. **Plan:** Select **"Tiny Turtle"** (FREE)
4. **Tags:** `development` (optional)
5. Klik **"Select Region"**
6. Pilih region terdekat (contoh: **Singapore** atau **Tokyo**)
7. Klik **"Review"**
8. Klik **"Create instance"**

✅ Instance akan dibuat dalam beberapa detik!

### 3. Copy Database URL

1. Klik instance yang baru dibuat (`sop-db-dev`)
2. Lihat section **"Details"**
3. Copy **URL** (contoh format):
   ```
   postgres://username:password@rosie.db.elephantsql.com/username
   ```

### 4. Update .env File

```powershell
# Di folder backend
cd C:\Users\IPDS-OCID\openSOP\backend
notepad .env
```

**Edit baris DATABASE_URL:**

```env
# Ganti ini:
DATABASE_URL="postgresql://sop_user:sop_password_2025@localhost:5432/sop_db?schema=public"

# Dengan URL dari ElephantSQL (tambahkan ?schema=public di akhir):
DATABASE_URL="postgres://username:password@rosie.db.elephantsql.com/username?schema=public"
```

**Save file!**

### 5. Install Dependencies (jika belum)

```powershell
npm install
```

### 6. Generate Prisma Client

```powershell
npx prisma generate
```

**Output:**

```
✔ Generated Prisma Client
```

### 7. Run Migrations

```powershell
npx prisma migrate deploy
```

**Output:**

```
✔ Applied 1 migration
```

### 8. Seed Database

```powershell
npx prisma db seed
```

**Output:**

```
🌱 Seeding database...
✓ Created admin user
✓ Created 3 departments
✓ Created 5 categories
✓ Created 2 sample SOPs
✓ Database seeded successfully!
```

### 9. Verify dengan Prisma Studio

```powershell
npx prisma studio
```

Browser akan terbuka di http://localhost:5555

**Cek:**

- ✅ Table `users` ada data admin
- ✅ Table `departments` ada 3 records
- ✅ Table `categories` ada 5 records

### 10. Test Backend

```powershell
npm run dev
```

**Output:**

```
✓ Prisma connected to database
✓ Server running on http://localhost:3000
```

Buka browser: http://localhost:3000/api/health

**Response:**

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 🎉 DONE!

Database sudah siap digunakan!

**Default credentials:**

- Email: `admin@bps.go.id`
- Password: `admin123`

---

## 📊 ElephantSQL Dashboard

Di dashboard ElephantSQL, Anda bisa:

1. **Browser** - Lihat data di database (seperti phpMyAdmin)
2. **Stats** - Monitoring usage
3. **Backups** - Download backup database (manual)
4. **Details** - Connection info

---

## 💡 Tips

### Lihat Data di ElephantSQL

1. Login ke ElephantSQL
2. Klik instance `sop-db-dev`
3. Klik tab **"Browser"**
4. Bisa query SQL langsung!

### Connection String Format

```
postgres://[user]:[password]@[host]/[database]?schema=public
```

### Jika Lupa URL

1. Login ElephantSQL
2. Klik instance
3. Tab "Details"
4. Copy URL lagi

---

## ⚠️ Limitations (Free Tier)

- **Storage:** 20 MB (cukup untuk development)
- **Connections:** 5 concurrent connections
- **Rows:** ~10,000 rows

Untuk production, upgrade ke paid plan atau install PostgreSQL sendiri.

---

## 🔄 Jika Ingin Reset Database

```powershell
npx prisma migrate reset
# WARNING: Ini akan hapus semua data!

npx prisma db seed
# Seed ulang data awal
```

---

## 🆘 Troubleshooting

### Error: "Can't reach database server"

**Cek:**

- Internet connection OK?
- URL di .env sudah benar?
- Tambahkan `?schema=public` di akhir URL

### Error: "SSL connection required"

**Fix .env:**

```env
DATABASE_URL="postgres://...?schema=public&sslmode=require"
```

### Error: "Too many connections"

**Tutup Prisma Studio** dan connection lain yang tidak dipakai.

---

## ✅ Quick Commands

```powershell
# Generate client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Seed data
npx prisma db seed

# Open GUI
npx prisma studio

# Start backend
npm run dev
```

---

**Setup time:** ~5 menit  
**Cost:** FREE  
**Perfect for:** Development & Testing

Selamat mencoba! 🚀
