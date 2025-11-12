# Dokumentasi Pembaruan Sistem SOP AP (Administrasi Pemerintah)

## Ringkasan Perubahan

Sistem telah disesuaikan dengan **Peraturan Kepala BPS No. 19 Tahun 2013** tentang Pedoman Penyusunan dan Pengelolaan SOP Administrasi Pemerintah di Lingkungan Badan Pusat Statistik.

## 1. Perubahan Struktur Database

### 1.1 Tabel User (Diperbarui)

**Perubahan Utama:**

- **Role diperluas** untuk mendukung struktur kepemimpinan BPS:
  - `PIMPINAN_TINGGI_UTAMA` (Eselon I)
  - `PIMPINAN_TINGGI_MADYA` (Eselon II)
  - `PIMPINAN_TINGGI_PRATAMA` (Eselon III)
- Tambahan field `kewenanganPengesahan` untuk menentukan siapa yang berhak mengesahkan SOP
- `Department` diganti menjadi `UnitKerja` untuk konsistensi dengan terminologi BPS

### 1.2 Tabel UnitKerja (Pengganti Department)

**Fungsi:** Menyimpan struktur organisasi BPS

- Mendukung hierarchical structure (parent-child)
- Field `logo` untuk logo unit kerja (akan tampil di dokumen SOP)

### 1.3 Tabel Aktor (BARU)

**Fungsi:** Master data pelaksana/jabatan dalam SOP

- `namaJabatan`: Ketua Tim Metodologi, Kabag, Kepala BPS, dll
- `unitKerja`: Unit kerja tempat jabatan tersebut berada
- `tipeKewenangan`: Untuk pimpinan yang berhak mengesahkan

**Contoh data:**

```
Ketua Tim Metodologi - BPS Provinsi Bengkulu
Tim Diseminasi - BPS Provinsi Bengkulu
Kabag Integrasi Pengolahan dan Diseminasi Statistik - BPS Provinsi Bengkulu
```

### 1.4 Tabel SOP (Diperluas Signifikan)

**Identitas Dokumen:**

- ✅ `nomorSOP`: Format SOP-036/17000/2025
- ✅ `judulSOP`: Judul lengkap SOP
- ✅ `unitKerja`: Unit organisasi penyusun
- ✅ `tanggalPembuatan`, `tanggalRevisi`, `tanggalEfektif`
- ✅ `pengesahanOleh` + `pengesahanUser`: Pejabat yang mengesahkan

**Dasar dan Tujuan:**

- ✅ `dasarHukum`: Peraturan perundang-undangan
- ✅ `maksudTujuan`: Maksud dan tujuan SOP

**Klasifikasi SOP (Sesuai Pedoman):**

1. **Jenis SOP:**

   - `TEKNIS`: Sangat rinci, satu pelaksana
   - `ADMINISTRATIF`: Umum, lebih dari satu pelaksana

2. **Klasifikasi Cakupan:**

   - `MAKRO`: Mencakup beberapa SOP Mikro
   - `MIKRO`: Bagian dari SOP Makro

3. **Klasifikasi Kelengkapan:**

   - `FINAL`: Menghasilkan produk utama paling akhir
   - `PARSIAL`: Rangkaian menuju produk akhir

4. **Klasifikasi Sifat:**
   - `GENERIK`: Kesamaan sifat terlepas lokasi
   - `SPESIFIK`: Perbedaan relatif dari kegiatan/lokasi

**Informasi Teknis:**

- ✅ `peringatan`: Kemungkinan jika prosedur tidak dilaksanakan
- ✅ `kualifikasiPelaksana`: Keahlian yang dibutuhkan
- ✅ `peralatanPerlengkapan`: Daftar peralatan
- ✅ `catatanPendataan`: Formulir/dokumen yang perlu diisi

**Status SOP:**

- `DRAFT` → `REVIEW` → `APPROVED` → `ACTIVE` → `REVISION` / `ARCHIVED`

### 1.5 Tabel SOPKeterkaitan (BARU)

**Fungsi:** Mengelola hubungan antar-SOP

**Tipe Hubungan:**

- `SOP_LANJUTAN`: SOP yang merupakan kelanjutan
- `SOP_PRASYARAT`: SOP yang harus dilakukan terlebih dahulu
- `SOP_TERKAIT`: SOP yang berkaitan
- `BAGIAN_DARI_MAKRO`: SOP Mikro yang bagian dari SOP Makro

**Contoh:**

```
SOP Pengumpulan Data (Makro) → SOP-037, SOP-038 (Mikro)
```

### 1.6 Tabel AktivitasFlowchart (BARU - Inti SOP)

**Fungsi:** Menyimpan detail prosedur/langkah kegiatan

**Lima Simbol Flowchart (Sesuai Pedoman):**

1. `KAPSUL`: Terminator (Start/End)
2. `KOTAK`: Process (Aktivitas)
3. `BELAH_KETUPAT`: Decision (Keputusan)
4. `ANAK_PANAH`: Flow line (Alur)
5. `SEGILIMA`: Off-page Connector

**Field Penting:**

- `noKegiatan`: Nomor urut (1, 2, 3...)
- `aktivitasKegiatan`: Uraian langkah
- `tipeSimbol`: Jenis simbol untuk rendering flowchart
- `aktor`: Siapa yang bertanggung jawab
- `kondisiKeputusan`: Untuk simbol Decision (Ya/Tidak)
- `nextActivityId`, `nextActivityYes`, `nextActivityNo`: Link percabangan

**Contoh Data:**

```
No | Aktivitas                    | Simbol        | Aktor
1  | Mulai                        | KAPSUL        | -
2  | Penulisan Analisis           | KOTAK         | Ketua Tim Metodologi
3  | Apakah disetujui?            | BELAH_KETUPAT | Kabag
4  | Revisi                       | KOTAK         | Ketua Tim Metodologi
5  | Publikasi                    | KOTAK         | Tim Diseminasi
6  | Selesai                      | KAPSUL        | -
```

### 1.7 Tabel MutuBaku (BARU)

**Fungsi:** Standar kualitas untuk setiap aktivitas

**Kolom Mutu Baku (Sesuai Format SOP AP):**

1. `persyaratanKelengkapan`: Input yang diperlukan
   - Contoh: "POK, Data set, Referensi publikasi terdahulu"
2. `waktu`: Durasi yang dibutuhkan
   - Contoh: "1 minggu", "3 hari kerja"
3. `output`: Hasil kegiatan
   - Contoh: "Draft Final", "Data set tervalidasi", "Publikasi"
4. `keterangan`: Catatan tambahan

### 1.8 Tabel SOPMonitoringEvaluasi (BARU)

**Fungsi:** Monitoring dan evaluasi penerapan SOP

**Frekuensi (Sesuai Pedoman):**

- Monitoring: Setiap 6 bulan sekali
- Evaluasi: Minimal 1 tahun sekali

**Field:**

- `jenisKegiatan`: "Monitoring" atau "Evaluasi"
- `penilaianPenerapan`:
  - `BERJALAN_DENGAN_BAIK`
  - `BERJALAN_KURANG_BAIK`
  - `TIDAK_BERJALAN`
- `catatanHasilPenilaian`: Hasil detail penilaian
- `tindakanYangDiambil`: Perbaikan yang harus dilakukan
- `nilaiEvaluasi`: Nilai kuantitatif (opsional)
- `rencanaRevisi`: Flag jika perlu revisi SOP

## 2. Fitur Baru yang Harus Diimplementasikan

### 2.1 Modul Pembuatan SOP

**Form Input (Multi-step):**

**Step 1: Identitas SOP**

- Nomor SOP
- Judul SOP
- Unit Kerja
- Tanggal Pembuatan/Efektif
- Pengesahan Oleh

**Step 2: Dasar & Klasifikasi**

- Dasar Hukum (textarea dengan rich text)
- Maksud & Tujuan
- Jenis SOP (Teknis/Administratif)
- Klasifikasi (Makro/Mikro, Final/Parsial, Generik/Spesifik)

**Step 3: Informasi Teknis**

- Kualifikasi Pelaksana
- Peralatan/Perlengkapan
- Peringatan
- Catatan/Pendataan

**Step 4: Keterkaitan SOP**

- Pilih SOP terkait (multi-select)
- Tentukan tipe hubungan

**Step 5: Flowchart Builder** ⭐ (PALING PENTING)

- Visual flowchart editor
- Drag & drop simbol (5 jenis)
- Assign aktor ke setiap aktivitas
- Input mutu baku untuk setiap aktivitas

**Step 6: Review & Submit**

- Preview dokumen SOP lengkap
- Generate PDF
- Submit untuk approval

### 2.2 Visual Flowchart Editor

**Requirement:**

- Canvas area untuk drawing flowchart
- Palette dengan 5 simbol
- Connect simbol dengan arrow
- Popup form untuk setiap simbol:
  - Aktivitas kegiatan
  - Aktor (dropdown)
  - Kondisi (jika Decision)
  - Mutu Baku (Kelengkapan, Waktu, Output)
- Auto-layout algorithm
- Export to SVG/PNG
- Print-friendly view

**Library Recommendation:**

- `vue-flow` atau `@vue-flow/core`
- `mermaid` untuk simple flowchart
- `jointjs` untuk advanced diagram

### 2.3 Modul Monitoring & Evaluasi

**Fitur:**

- Dashboard monitoring status SOP
- Form penilaian (per SOP)
- Checklist penilaian
- Upload bukti dukung
- Generate laporan monitoring
- Schedule reminder (6 bulan, 1 tahun)

**View:**

- Tabel semua SOP dengan status penerapan
- Filter: Berjalan Baik / Kurang Baik / Tidak Berjalan
- Grafik trend evaluasi
- Export laporan ke Excel/PDF

### 2.4 Workflow Approval

**Alur:**

1. User membuat SOP (Status: DRAFT)
2. Submit untuk review (Status: REVIEW)
3. Reviewer memberikan feedback atau approve
4. Pimpinan mengesahkan (Status: APPROVED)
5. SOP diberlakukan efektif (Status: ACTIVE)

**Role & Permission:**

- USER: Create, Edit (own draft)
- SUPERVISOR: Review, Comment
- PIMPINAN: Approve, Mengesahkan
- ADMIN: Full access

### 2.5 Manajemen Aktor/Jabatan

**CRUD Aktor:**

- Nama Jabatan
- Unit Kerja
- Tipe Kewenangan
- Deskripsi

**View:**

- Master data aktor
- Assign multiple aktor ke unit kerja

### 2.6 Generate Dokumen SOP

**Output Format:**

- PDF dengan format standar BPS
- Header: Logo + Nama Unit Kerja
- Bagian Identitas (tabel)
- Flowchart (rendered sebagai diagram)
- Tabel Mutu Baku
- Footer: Pengesahan

**Template:**

```
┌─────────────────────────────────────┐
│ [Logo BPS]  NAMA UNIT KERJA        │
├─────────────────────────────────────┤
│ STANDAR OPERASIONAL PROSEDUR        │
│                                     │
│ Nomor SOP    : SOP-036/17000/2025  │
│ Tanggal      : 10 Januari 2025     │
│ Disahkan oleh: Kepala BPS Prov...  │
├─────────────────────────────────────┤
│ JUDUL: Penyusunan Publikasi...     │
│                                     │
│ [Flowchart Diagram]                 │
│                                     │
│ [Tabel Mutu Baku]                   │
└─────────────────────────────────────┘
```

## 3. Migration Plan

### Fase 1: Database Migration (Prioritas Tinggi)

1. ✅ Backup database existing
2. ✅ Create new schema (schema_new.prisma)
3. ⏳ Test migration script
4. ⏳ Run migration di development
5. ⏳ Seed data sample untuk testing

### Fase 2: Backend API (Prioritas Tinggi)

1. ⏳ Update models & repositories
2. ⏳ Create API endpoints:
   - `/api/sop` (CRUD SOP dengan klasifikasi)
   - `/api/aktor` (CRUD Aktor)
   - `/api/aktivitas` (CRUD Aktivitas Flowchart)
   - `/api/mutu-baku` (CRUD Mutu Baku)
   - `/api/monitoring` (CRUD Monitoring & Evaluasi)
   - `/api/keterkaitan` (Manage SOP relationships)

### Fase 3: Frontend UI (Prioritas Sedang)

1. ⏳ Update form SOP dengan multi-step wizard
2. ⏳ Implement flowchart editor
3. ⏳ Create monitoring dashboard
4. ⏳ Update navigation menu

### Fase 4: Reporting & Export (Prioritas Rendah)

1. ⏳ PDF generation untuk dokumen SOP
2. ⏳ Export laporan monitoring
3. ⏳ Statistik dan dashboard analytics

## 4. Contoh Kasus Penggunaan

### Use Case 1: Membuat SOP Teknis Mikro

**Contoh:** SOP Penanganan Surat Masuk (bagian dari SOP Pengelolaan Surat)

1. User login sebagai staff BPS Provinsi Bengkulu
2. Klik "Buat SOP Baru"
3. Isi identitas:
   - Nomor: SOP-001/17000/2025
   - Judul: Penanganan Surat Masuk
   - Jenis: TEKNIS
   - Cakupan: MIKRO (bagian dari SOP Pengelolaan Surat)
4. Tambah keterkaitan: SOP-000/17000/2025 (SOP Makro)
5. Buat flowchart:
   ```
   [Mulai] → [Terima Surat] → [Cek Klasifikasi]
      ↓
   [Urgent?] → Ya → [Prioritas]
      ↓ Tidak
   [Distribusi Biasa] → [Selesai]
   ```
6. Assign aktor: Petugas Administrasi
7. Input mutu baku: Waktu 15 menit, Output: Surat terdistribusi
8. Submit untuk approval

### Use Case 2: Monitoring SOP

**Contoh:** Evaluasi 6 bulanan SOP Penyusunan Publikasi

1. Supervisor login
2. Masuk menu "Monitoring & Evaluasi"
3. Filter SOP yang sudah 6 bulan aktif
4. Pilih SOP-036/17000/2025
5. Isi form penilaian:
   - Penerapan: Berjalan Dengan Baik
   - Catatan: "Perlu menambahkan poin pemeriksaan bukti dukung"
   - Tindakan: Revisi minor
   - Rencana Revisi: Ya
6. Submit penilaian
7. Sistem otomatis ubah status SOP ke REVISION

## 5. Technical Stack Update

**Backend:**

- Prisma ORM dengan schema baru
- Node.js + Express
- PostgreSQL database

**Frontend:**

- Vue 3 + Composition API
- PrimeVue components (sudah ada)
- **TAMBAHAN:**
  - `@vue-flow/core` untuk flowchart editor
  - `jspdf` + `html2canvas` untuk PDF generation
  - `vue-chartjs` untuk dashboard analytics

**Infrastructure:**

- Docker untuk containerization
- Nginx untuk reverse proxy

## 6. Next Steps

### Immediate Actions (Minggu Ini):

1. ✅ Review schema_new.prisma dengan tim
2. ⏳ Buat migration script
3. ⏳ Test migration di local environment
4. ⏳ Design mockup untuk flowchart editor
5. ⏳ Research library terbaik untuk flowchart (vue-flow vs mermaid)

### Short Term (2 Minggu):

1. ⏳ Implement database migration
2. ⏳ Update backend API untuk model baru
3. ⏳ Create seed data untuk testing
4. ⏳ Build prototype flowchart editor

### Medium Term (1 Bulan):

1. ⏳ Complete all CRUD operations
2. ⏳ Implement workflow approval
3. ⏳ Build monitoring dashboard
4. ⏳ PDF generation

### Long Term (2-3 Bulan):

1. ⏳ User acceptance testing
2. ⏳ Training materials
3. ⏳ Production deployment
4. ⏳ Monitoring dan iterasi

---

**Catatan Penting:**

- Schema baru sudah disimpan di `backend/prisma/schema_new.prisma`
- Schema lama tetap di `backend/prisma/schema.prisma` untuk backup
- Migrasi harus dilakukan dengan hati-hati untuk menjaga data existing
- Konsultasi dengan tim sebelum run migration di production
