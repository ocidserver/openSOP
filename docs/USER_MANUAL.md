# 📖 User Manual - SOP Management System

## Panduan Pengguna Sistem Manajemen SOP BPS

---

## 📑 Daftar Isi

1. [Pengenalan Sistem](#pengenalan-sistem)
2. [Akses dan Login](#akses-dan-login)
3. [Dashboard](#dashboard)
4. [Mengelola SOP](#mengelola-sop)
5. [Kategori dan Departemen](#kategori-dan-departemen)
6. [Persetujuan SOP](#persetujuan-sop)
7. [Laporan dan Statistik](#laporan-dan-statistik)
8. [Pengaturan Profil](#pengaturan-profil)
9. [FAQ](#faq)

---

## 🎯 Pengenalan Sistem

### Apa itu SOP-MS?

SOP Management System (SOP-MS) adalah sistem berbasis web untuk mengelola Standar Operasional Prosedur (SOP) di lingkungan Badan Pusat Statistik (BPS).

### Fitur Utama

- ✅ Penyimpanan dan kategorisasi SOP
- 🔍 Pencarian SOP yang cepat dan akurat
- 📝 Pembuatan dan revisi SOP
- ✔️ Alur persetujuan terstruktur
- 📊 Pelacakan kepatuhan
- 📈 Laporan dan statistik
- 🔐 Keamanan dan audit trail

### Peran Pengguna

| Peran        | Deskripsi                        | Hak Akses                             |
| ------------ | -------------------------------- | ------------------------------------- |
| **Admin**    | Administrator sistem             | Akses penuh ke semua fitur            |
| **Manager**  | Pengelola SOP tingkat departemen | Membuat, mengedit, dan menyetujui SOP |
| **Reviewer** | Peninjau SOP                     | Meninjau dan memberikan komentar      |
| **User**     | Pengguna biasa                   | Melihat SOP yang telah disetujui      |

---

## 🔐 Akses dan Login

### 1. Membuka Aplikasi

Buka browser dan akses: **http://[alamat-server]/sop-ms**

### 2. Login

1. Masukkan **Email** BPS Anda
2. Masukkan **Password**
3. Klik tombol **"Masuk"**

![Login Screen](images/login.png)

### 3. Lupa Password

Hubungi administrator IT untuk reset password.

---

## 📊 Dashboard

Setelah login, Anda akan melihat Dashboard dengan informasi:

### Statistik Ringkasan

- Total SOP
- SOP Aktif
- SOP Draft
- Total Pengguna

### SOP Terbaru

Daftar 5 SOP yang baru dibuat atau diperbarui

### Aktivitas Terbaru

Log aktivitas terakhir dalam sistem

### Aksi Cepat (Manager/Admin)

Tombol shortcut untuk:

- Buat SOP Baru
- Lihat Daftar SOP
- Kelola Kategori
- Lihat Laporan

---

## 📄 Mengelola SOP

### Melihat Daftar SOP

1. Klik menu **"Daftar SOP"** di sidebar
2. Anda akan melihat tabel berisi semua SOP
3. Gunakan fitur **Pencarian** untuk menemukan SOP spesifik
4. Gunakan **Filter** untuk menyaring berdasarkan:
   - Status (Draft, Aktif, Arsip)
   - Departemen
   - Kategori
   - Tingkat Kompleksitas

### Melihat Detail SOP

1. Klik pada judul SOP atau tombol **"Lihat Detail"**
2. Informasi yang ditampilkan:
   - Nomor SOP
   - Judul dan Deskripsi
   - Tujuan dan Ruang Lingkup
   - Departemen Pemilik
   - Kategori
   - Status dan Tanggal Efektif
   - Versi dan Riwayat Perubahan
   - Lampiran
   - Komentar

### Membuat SOP Baru (Manager/Admin)

1. Klik menu **"Buat SOP Baru"** atau tombol **"+ Buat SOP"**
2. Isi formulir:
   - **Nomor SOP:** Format SOP/BPS/YYYY/XXX
   - **Judul:** Judul singkat dan jelas
   - **Deskripsi:** Penjelasan lengkap
   - **Tujuan:** Apa tujuan SOP ini
   - **Ruang Lingkup:** Siapa yang terkait
   - **Departemen:** Pilih departemen pemilik
   - **Kompleksitas:** Sederhana/Menengah/Kompleks
   - **Kategori:** Pilih satu atau lebih kategori
   - **Tanggal Efektif:** Kapan SOP berlaku
3. Klik **"Simpan Draft"** atau **"Submit untuk Review"**

### Mengedit SOP (Manager/Admin)

1. Buka detail SOP
2. Klik tombol **"Edit"**
3. Lakukan perubahan yang diperlukan
4. Isi **Catatan Perubahan:**
   - Apa yang diubah
   - Mengapa diubah
5. Klik **"Simpan Perubahan"**

> **Catatan:** Setiap perubahan akan tercatat dalam riwayat versi

### Mengunduh SOP

1. Buka detail SOP
2. Klik tombol **"Unduh PDF"**
3. File akan diunduh ke komputer Anda

### Menambah Lampiran

1. Buka detail SOP
2. Klik tab **"Lampiran"**
3. Klik **"Upload Lampiran"**
4. Pilih file (PDF, DOC, DOCX)
5. Masukkan deskripsi lampiran
6. Klik **"Upload"**

### Menambah Komentar

1. Buka detail SOP
2. Scroll ke bagian **"Komentar"**
3. Tulis komentar Anda
4. Klik **"Kirim Komentar"**

---

## 🏷️ Kategori dan Departemen

### Mengelola Kategori (Manager/Admin)

1. Klik menu **"Kategori"**
2. Lihat daftar kategori yang ada
3. Untuk menambah:
   - Klik **"+ Tambah Kategori"**
   - Isi: Tipe, Kode, Nama, Deskripsi
   - Pilih warna dan ikon
4. Untuk mengedit:
   - Klik ikon **"Edit"** pada kategori
   - Ubah informasi
   - Klik **"Simpan"**

### Tipe Kategori

- **Departemen:** Berdasarkan unit kerja
- **Tipe Proses:** Operasional, Strategis, Pendukung
- **Tipe Survei:** Sensus, Survei Khusus, dll
- **Kompleksitas:** Sederhana, Menengah, Kompleks

---

## ✅ Persetujuan SOP

### Alur Persetujuan Standar

1. **Draft** → Dibuat oleh Manager
2. **Review** → Ditinjau oleh Reviewer
3. **Approval** → Disetujui oleh Manager/Admin
4. **Active** → SOP berlaku

### Melakukan Review (Reviewer)

1. Buka detail SOP dengan status "In Review"
2. Baca dan tinjau isi SOP
3. Klik tombol **"Review"**
4. Pilih tindakan:
   - **Setuju:** Lanjut ke tahap persetujuan
   - **Minta Revisi:** Kembalikan untuk diperbaiki
   - **Tolak:** Tolak SOP
5. Tulis komentar/catatan
6. Klik **"Submit"**

### Menyetujui SOP (Manager/Admin)

1. Buka detail SOP dengan status "In Approval"
2. Tinjau SOP dan komentar reviewer
3. Klik tombol **"Approve"**
4. Pilih tindakan:
   - **Setujui:** SOP menjadi aktif
   - **Tolak:** SOP ditolak
5. Tulis catatan persetujuan
6. Klik **"Submit"**

---

## 📈 Laporan dan Statistik

### Dashboard Statistik

Menampilkan:

- Jumlah SOP berdasarkan status
- SOP per departemen
- Tren pembuatan SOP
- Aktivitas terbaru

### Laporan Inventaris SOP (Manager/Admin)

1. Klik menu **"Laporan"**
2. Pilih **"Inventaris SOP"**
3. Lihat daftar lengkap semua SOP
4. Klik **"Export Excel"** untuk mengunduh

### Laporan Kepatuhan (Manager/Admin)

1. Klik menu **"Laporan"**
2. Pilih **"Kepatuhan"**
3. Filter berdasarkan:
   - Departemen
   - Periode waktu
4. Lihat:
   - SOP yang sudah dibaca
   - Tingkat kepatuhan per departemen
   - Pengguna yang belum membaca
5. Export untuk dokumentasi

---

## ⚙️ Pengaturan Profil

### Melihat Profil

1. Klik ikon **Profil** di pojok kanan atas
2. Pilih **"Profil Saya"**

### Mengedit Profil

1. Buka halaman profil
2. Klik **"Edit Profil"**
3. Ubah informasi:
   - Nama Lengkap
   - Nomor Telepon
   - Foto Profil
4. Klik **"Simpan"**

### Ganti Password

1. Buka halaman profil
2. Klik tab **"Keamanan"**
3. Isi:
   - Password Lama
   - Password Baru
   - Konfirmasi Password Baru
4. Klik **"Ganti Password"**

---

## ❓ FAQ (Frequently Asked Questions)

### 1. Bagaimana cara mencari SOP?

Gunakan kolom pencarian di:

- Header (cari global)
- Halaman Daftar SOP (cari spesifik)

Anda bisa mencari berdasarkan:

- Nomor SOP
- Judul
- Kata kunci
- Deskripsi

### 2. Siapa yang bisa membuat SOP?

Hanya pengguna dengan peran **Manager** dan **Admin** yang dapat membuat SOP baru.

### 3. Bagaimana cara mengetahui SOP terbaru?

- Lihat bagian "SOP Terbaru" di Dashboard
- Atau buka "Daftar SOP" dan urutkan berdasarkan "Tanggal Dibuat"

### 4. Apakah perubahan SOP tercatat?

Ya, semua perubahan tercatat dalam:

- Riwayat Versi SOP
- Audit Log sistem

### 5. Bagaimana cara mengarsipkan SOP?

1. Buka detail SOP
2. Klik **"Arsipkan"** (Admin only)
3. Konfirmasi tindakan

SOP yang diarsipkan tidak akan muncul di daftar aktif tetapi masih dapat diakses melalui filter.

### 6. Format file apa yang didukung untuk lampiran?

- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Text (.txt)

Maksimal ukuran: **50 MB per file**

### 7. Berapa lama token login berlaku?

Token login berlaku selama **7 hari**. Setelah itu, Anda perlu login ulang.

### 8. Bagaimana cara melaporkan masalah teknis?

Hubungi tim IT BPS melalui:

- Email: support@bps.go.id
- Telepon: [nomor IT support]

---

## 📞 Kontak Support

**Tim IT BPS**  
Email: support@bps.go.id  
Telepon: [nomor kontak]  
Jam Kerja: Senin - Jumat, 08:00 - 16:00 WIB

---

## 📚 Referensi Tambahan

- [API Documentation](API.md) - Untuk developer
- [Deployment Guide](DEPLOYMENT.md) - Untuk administrator
- [Architecture Guide](ARCHITECTURE.md) - Arsitektur sistem

---

**Versi:** 1.0.0  
**Terakhir Diperbarui:** November 2025  
**© Badan Pusat Statistik**
