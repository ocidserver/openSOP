# 🎯 Update Sistem SOP AP - Quick Reference

## ✅ Yang Sudah Dilakukan

### 1. Database Schema (SELESAI)

✅ File baru: `backend/prisma/schema_new.prisma`

- 8 tabel utama sesuai konsep SOP AP
- Mendukung klasifikasi lengkap (Teknis/Administratif, Makro/Mikro, dll)
- Flowchart dengan 5 simbol standar BPS
- Mutu Baku (Kelengkapan, Waktu, Output)
- Monitoring & Evaluasi

### 2. Dokumentasi (SELESAI)

✅ File: `docs/SOP_AP_SYSTEM_UPDATE.md`

- Penjelasan lengkap semua tabel
- Use case dan contoh penggunaan
- Migration plan
- Technical stack

### 3. Frontend Menu (SELESAI)

✅ Menu sudah disesuaikan dengan fitur baru:

- Pengelolaan SOP (Daftar, Buat Baru, Approval)
- Master Data (Unit Kerja, Aktor/Jabatan, Pengguna)
- Monitoring & Evaluasi (Dashboard, Penilaian, Laporan)

### 4. Role & Permission (SELESAI)

✅ Role baru ditambahkan:

- PIMPINAN_TINGGI_UTAMA (Eselon I)
- PIMPINAN_TINGGI_MADYA (Eselon II)
- PIMPINAN_TINGGI_PRATAMA (Eselon III)
- SUPERVISOR
- USER

## ⏳ Yang Perlu Dilakukan Selanjutnya

### Prioritas 1 (Urgent - Week 1)

1. **Review Schema dengan Tim**

   - Validasi struktur tabel
   - Konfirmasi field yang dibutuhkan
   - Approve untuk migration

2. **Database Migration**

   ```bash
   # Backup database lama
   pg_dump database_name > backup_old.sql

   # Copy schema baru
   cp backend/prisma/schema_new.prisma backend/prisma/schema.prisma

   # Generate migration
   cd backend
   npx prisma migrate dev --name update_to_sop_ap
   ```

3. **Seed Data Sample**
   - Buat data unit kerja (BPS Pusat, Provinsi, Kabupaten)
   - Buat data aktor/jabatan
   - Buat 2-3 contoh SOP lengkap dengan flowchart

### Prioritas 2 (High - Week 2-3)

4. **Backend API Development**

   - Update models & repositories
   - Create CRUD endpoints untuk:
     - SOP (dengan klasifikasi)
     - Aktor
     - Aktivitas Flowchart
     - Mutu Baku
     - Monitoring & Evaluasi
     - Keterkaitan SOP

5. **Research Flowchart Library**
   - Test `@vue-flow/core`
   - Test `mermaid`
   - Pilih yang paling cocok untuk requirement

### Prioritas 3 (Medium - Week 4-6)

6. **Frontend Development**

   - Multi-step form untuk create SOP
   - Flowchart editor (drag & drop)
   - Monitoring dashboard
   - Approval workflow UI

7. **PDF Generation**
   - Template dokumen SOP standar BPS
   - Generate dari data SOP + flowchart
   - Export dengan format yang benar

### Prioritas 4 (Low - Week 7-8)

8. **Testing & Refinement**

   - Unit testing
   - Integration testing
   - User acceptance testing

9. **Documentation & Training**
   - User manual
   - Video tutorial
   - Admin guide

## 📋 Checklist Konsep SOP AP

### ✅ Jenis SOP

- [x] Teknis vs Administratif
- [x] Makro vs Mikro
- [x] Final vs Parsial
- [x] Generik vs Spesifik

### ✅ Struktur Dokumen

- [x] Identitas SOP (Nomor, Tanggal, Pengesahan)
- [x] Dasar Hukum
- [x] Maksud & Tujuan
- [x] Kualifikasi Pelaksana
- [x] Peralatan/Perlengkapan
- [x] Peringatan
- [x] Catatan & Pendataan

### ✅ Flowchart

- [x] 5 Simbol (Kapsul, Kotak, Belah Ketupat, Anak Panah, Segilima)
- [x] Pelaksana/Aktor per aktivitas
- [x] Mutu Baku (Kelengkapan, Waktu, Output)

### ✅ Keterkaitan SOP

- [x] SOP Lanjutan
- [x] SOP Prasyarat
- [x] Bagian dari Makro

### ✅ Monitoring & Evaluasi

- [x] Penilaian Penerapan
- [x] Catatan Hasil Penilaian
- [x] Tindakan Perbaikan
- [x] Rencana Revisi

## 🚀 Quick Start Development

### 1. Review Documentation

```bash
# Baca dokumentasi lengkap
cat docs/SOP_AP_SYSTEM_UPDATE.md
```

### 2. Check Schema

```bash
# Lihat schema baru
cat backend/prisma/schema_new.prisma
```

### 3. Test Migration (Development Only)

```bash
cd backend

# Backup dulu
cp prisma/schema.prisma prisma/schema_backup.prisma

# Copy schema baru
cp prisma/schema_new.prisma prisma/schema.prisma

# Run migration
npx prisma migrate dev --name sop_ap_update

# Jika ada masalah, rollback:
cp prisma/schema_backup.prisma prisma/schema.prisma
npx prisma migrate dev
```

### 4. Frontend Development

```bash
cd frontend

# Install dependencies jika belum
npm install

# Run dev server
npm run dev
```

## 📚 Referensi

- **Pedoman:** Peraturan Kepala BPS No. 19 Tahun 2013
- **Konsep:** Lihat `docs/SOP_AP_SYSTEM_UPDATE.md` bagian "Konsep Kunci"
- **Database:** `backend/prisma/schema_new.prisma`

## 💡 Tips

1. **Jangan langsung migrate di production!** Test dulu di development
2. **Backup database** sebelum migration
3. **Validasi dengan tim** sebelum implement
4. **Iterative development**: Build fitur satu per satu, jangan sekaligus
5. **User feedback**: Libatkan user dalam testing

## 🐛 Troubleshooting

### Migration Error?

```bash
# Reset database (HANYA DI DEVELOPMENT!)
npx prisma migrate reset

# Generate client
npx prisma generate
```

### Conflict dengan data existing?

- Buat migration script custom untuk map data lama ke structure baru
- Lihat file `docs/SOP_AP_SYSTEM_UPDATE.md` bagian Migration Plan

## 📞 Support

Jika ada pertanyaan tentang struktur baru, silakan refer ke:

1. `docs/SOP_AP_SYSTEM_UPDATE.md` - Dokumentasi lengkap
2. `backend/prisma/schema_new.prisma` - Database schema
3. Konsep SOP AP di user request original

---

**Status:** ✅ Design Complete, ⏳ Implementation Pending
**Last Updated:** 11 November 2025
