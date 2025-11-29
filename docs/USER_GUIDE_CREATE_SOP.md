# 📝 User Guide - Membuat SOP Baru (Mode Manual/Basic)

## 🎯 Overview

Panduan ini menjelaskan cara membuat SOP baru menggunakan antarmuka Mode Manual/Basic yang terdiri dari 4 langkah progresif.

---

## 🚀 Akses Halaman

1. Login ke sistem openSOP
2. Klik menu **"Daftar SOP"** di sidebar
3. Klik tombol **"Buat SOP Baru"** (hijau, ikon plus)
4. Anda akan diarahkan ke halaman pembuatan SOP

**Role yang dapat membuat SOP:**

- ADMIN
- SUPERVISOR
- MANAGER

---

## 📋 Langkah-langkah Pembuatan SOP

### **Step 1: Informasi Dasar**

Isi formulir informasi dasar SOP:

#### **Wajib Diisi (Required):**

- ✅ **Judul SOP**: Nama/judul SOP yang jelas
  - Contoh: "SOP Pelayanan Permintaan Data"
- ✅ **Department/Unit Kerja**: Pilih dari dropdown
  - Contoh: IPDS, Statistik Sosial, dll

#### **Optional (Direkomendasikan):**

- **Deskripsi**: Penjelasan singkat tentang SOP
- **Kategori SOP**: Pilih 1 atau lebih kategori (bisa multiple select)
  - Contoh: Statistik, Administrasi, Pelayanan
- **Tujuan SOP**: Jelaskan tujuan dari SOP ini
- **Ruang Lingkup**: Jelaskan di mana SOP ini berlaku
- **Tanggal Efektif**: Kapan SOP mulai berlaku
- **Tags/Kata Kunci**: Tambah tag untuk memudahkan pencarian
  - Tekan Enter setelah mengetik setiap tag

**Tombol:**

- **Selanjutnya** → Lanjut ke Step 2 (hanya aktif jika Judul & Department sudah diisi)

---

### **Step 2: Langkah-langkah SOP (Tabular Editor)**

Tambahkan langkah-langkah SOP dalam tabel:

#### **Cara Menambah Langkah:**

1. Klik tombol **"Tambah Langkah"** (hijau, ikon plus)
2. Tabel akan menambah baris baru
3. Isi kolom-kolom berikut:

**Kolom Tabel:**

- **No**: Nomor urut (otomatis)
- **Aktivitas/Kegiatan**: Deskripsi aktivitas (WAJIB)
  - Contoh: "Menerima permohonan data dari pemohon"
- **Pelaksana/Aktor**: Pilih dari dropdown (WAJIB)
  - Contoh: "Staff Administrasi", "Kepala Seksi"
- **Mutu Baku Waktu**: Estimasi waktu (Direkomendasikan)
  - Contoh: "5 menit", "1 hari kerja"
- **Mutu Baku Output**: Hasil yang diharapkan (Direkomendasikan)
  - Contoh: "Form permohonan terverifikasi"
- **Catatan**: Informasi tambahan (Optional)

#### **Fitur Tabel:**

- ✏️ **Edit**: Klik ikon pensil untuk edit langkah
- 🗑️ **Hapus**: Klik ikon tempat sampah untuk hapus
- 📋 **Duplikat**: Klik ikon copy untuk duplikat langkah
- ⬍ **Drag & Drop**: Drag handle (☰) untuk ubah urutan

#### **Toolbar:**

- **Import Excel**: Upload file Excel dengan langkah SOP (format template)
- **Export Excel**: Download langkah SOP ke file Excel

**Validasi:**

- Minimal 1 langkah harus diisi
- Setiap langkah harus punya Aktivitas dan Pelaksana

**Tombol:**

- **Sebelumnya** → Kembali ke Step 1
- **Simpan Draft** → Simpan sebagai draft (dapat dilanjutkan nanti)
- **Selanjutnya** → Lanjut ke Step 3

---

### **Step 3: Visualisasi Flowchart (Optional)**

Generate flowchart otomatis dari langkah-langkah SOP:

#### **Cara Generate Flowchart:**

1. Klik tombol **"Generate Flowchart Otomatis"**
2. Sistem akan membuat flowchart BPMN berdasarkan langkah di Step 2
3. Preview akan muncul menampilkan:
   - Jumlah nodes (titik/kotak dalam flowchart)
   - Jumlah connections (garis penghubung)
   - Version flowchart

**Catatan:**

- Flowchart dibuat otomatis, Anda tidak perlu menggambar manual
- Flowchart akan tersimpan bersama data SOP
- Anda bisa skip langkah ini dan langsung ke Review

**Tombol:**

- **Sebelumnya** → Kembali ke Step 2
- **Simpan Draft** → Simpan draft
- **Selanjutnya** → Lanjut ke Step 4 (Review)

---

### **Step 4: Review & Submit**

Periksa kembali semua informasi sebelum submit:

#### **Panel Review:**

**1. Informasi Dasar**

- Judul SOP
- Department
- Kategori (chips/tags)
- Tanggal Efektif

**2. Langkah-langkah SOP**

- Jumlah total langkah
- Jumlah aktor yang terlibat
- Tabel preview langkah (paginated)

**3. Flowchart**

- Status: Sudah dibuat / Belum dibuat

#### **Tombol Akhir:**

**Simpan Draft**

- Status SOP: **DRAFT**
- SOP tersimpan tapi belum masuk approval
- Dapat diedit kembali kapan saja
- Tidak terlihat oleh user biasa

**Submit untuk Review** (Hijau)

- Status SOP: **REVIEW**
- SOP akan dikirim ke supervisor/pimpinan
- Masuk ke workflow approval
- Tidak bisa diedit sampai di-approve/reject

**Konfirmasi:**

- Dialog konfirmasi akan muncul sebelum submit
- Klik "Ya" untuk melanjutkan

---

## 🎯 Tips & Best Practices

### **Informasi Dasar:**

- Gunakan judul yang jelas dan spesifik
- Isi tujuan dan ruang lingkup untuk dokumentasi lengkap
- Tambah minimal 2-3 tags untuk memudahkan pencarian

### **Langkah SOP:**

- Buat langkah secara berurutan (kronologis)
- Gunakan bahasa yang jelas dan mudah dipahami
- Isi mutu waktu dan mutu output untuk setiap langkah
- Jika ada decision point, buat langkah terpisah
- Minimal 3-5 langkah untuk SOP yang baik

### **Pelaksana/Aktor:**

- Gunakan nama role/posisi, bukan nama orang
- Konsisten dalam penamaan aktor
- Jika aktor yang dibutuhkan tidak ada, hubungi admin

### **Flowchart:**

- Selalu generate flowchart untuk visualisasi
- Flowchart membantu stakeholder memahami alur SOP

### **Sebelum Submit:**

- Periksa spelling dan grammar
- Pastikan urutan langkah sudah benar
- Validasi mutu waktu realistis
- Review flowchart jika sudah dibuat

---

## 💾 Auto-Save & Draft

**Auto-Save:**

- Sistem otomatis menyimpan draft ke localStorage setiap perubahan
- Draft tersimpan di browser Anda
- Jika browser tertutup, draft dapat dipulihkan saat buka lagi

**Simpan Draft:**

- Klik "Simpan Draft" kapan saja untuk save ke database
- Draft tersimpan secara permanen
- Dapat dilanjutkan dari perangkat lain setelah login

**Restore Draft:**

- Jika ada draft auto-save, akan muncul notifikasi saat buka halaman
- Klik OK untuk restore draft

---

## 🔍 Validasi & Error

**Validasi Real-time:**

- Field required akan ditandai dengan \* merah
- Error message muncul di bawah field yang bermasalah
- Field invalid akan bordered merah

**Validasi Step 1:**

- Judul SOP: Wajib diisi
- Department: Wajib dipilih
- Tombol "Selanjutnya" disabled sampai valid

**Validasi Step 2:**

- Minimal 1 langkah: Wajib
- Aktivitas: Wajib per langkah
- Pelaksana: Wajib per langkah
- Toast warning muncul jika ada yang kurang

**Validasi Submit:**

- Semua validasi Step 1 & 2
- Konfirmasi dialog sebelum submit

---

## 🚦 Status SOP

Setelah dibuat, SOP dapat memiliki status:

1. **DRAFT** (Abu-abu)

   - SOP baru dibuat, belum disubmit
   - Hanya terlihat oleh pembuat dan admin
   - Dapat diedit bebas

2. **REVIEW** (Kuning)

   - SOP sudah disubmit untuk review
   - Menunggu approval dari supervisor/pimpinan
   - Tidak dapat diedit (kecuali di-reject)

3. **APPROVED** (Hijau)

   - SOP sudah disetujui
   - Menunggu aktivasi

4. **ACTIVE** (Hijau cerah)

   - SOP aktif dan berlaku
   - Terlihat oleh semua user
   - Dapat diimplementasikan

5. **REJECTED** (Merah)
   - SOP ditolak saat review
   - Perlu revisi
   - Dapat diedit kembali

---

## ❓ Troubleshooting

**Q: Tombol "Selanjutnya" tidak aktif?**

- A: Pastikan semua field required (bertanda \*) sudah diisi

**Q: Tidak bisa menambah langkah?**

- A: Cek koneksi internet, refresh halaman jika perlu

**Q: Aktor yang saya butuhkan tidak ada di dropdown?**

- A: Hubungi admin untuk menambahkan aktor baru

**Q: Generate flowchart gagal?**

- A: Pastikan sudah ada minimal 1 langkah di Step 2

**Q: Error saat submit/save?**

- A: Periksa console browser (F12) untuk detail error
- Coba save sebagai draft dulu
- Hubungi support jika masalah berlanjut

**Q: Draft hilang setelah logout?**

- A: Auto-save hanya di localStorage browser
- Gunakan "Simpan Draft" untuk save permanent ke database

**Q: Tidak bisa edit SOP setelah submit?**

- A: SOP dengan status REVIEW tidak dapat diedit
- Tunggu approval atau minta supervisor reject untuk revisi

---

## 📧 Support

Jika mengalami kendala:

- **Email**: ipds.ocid@bps.go.id
- **Chat**: Tim IT BPS
- **Dokumentasi**: `/docs/MODE_MANUAL_BASIC_IMPLEMENTATION.md`

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0
