# Sistem Monitoring & Evaluasi - openSOP

Dokumentasi lengkap untuk modul Monitoring & Evaluasi dalam sistem manajemen SOP.

## 📊 Overview

Sistem Monitoring & Evaluasi terdiri dari 3 halaman utama:

1. **Dashboard Monitoring** - Analytics dan visualisasi data SOP
2. **Penilaian SOP** - Sistem evaluasi dan rating SOP
3. **Laporan** - Generate dan export berbagai jenis laporan

---

## 1. Dashboard Monitoring

### 📍 Route

- **Path**: `/monitoring`
- **Component**: `MonitoringDashboard.vue`
- **Roles**: `ADMIN`, `PIMPINAN_TINGGI_UTAMA`, `PIMPINAN_TINGGI_MADYA`, `PIMPINAN_TINGGI_PRATAMA`, `SUPERVISOR`

### 🎯 Fitur

#### A. KPI Cards

Menampilkan 4 metrik utama:

- **Total SOP**: Jumlah total SOP dengan growth percentage
- **Compliance Rate**: Tingkat kepatuhan implementasi SOP
- **Perlu Review**: Jumlah SOP yang menunggu review dengan avg. review time
- **Rata-rata Skor**: Average rating dari penilaian SOP

#### B. Filter Section

Filter data berdasarkan:

- Periode (7 hari, 30 hari, 3 bulan, 6 bulan, 1 tahun)
- Departemen
- Kategori SOP
- Status (Multi-select: Draft, Review, Aktif, Archived)

#### C. Charts & Visualisasi

1. **Trend SOP per Bulan** (Line Chart)

   - SOP Dibuat vs SOP Disetujui
   - Data 12 bulan terakhir

2. **Status SOP** (Doughnut Chart)

   - Breakdown: Aktif, Review, Draft, Archived

3. **SOP per Kategori** (Bar Chart)

   - Distribusi SOP berdasarkan kategori

4. **SOP per Departemen** (Bar Chart)
   - Distribusi SOP berdasarkan departemen

#### D. Performance Table

Tabel performa departemen dengan kolom:

- Departemen
- Total SOP
- SOP Aktif
- Compliance (dengan progress bar)
- Rata-rata Skor (dengan rating stars)
- Status (Excellent/Good/Fair/Poor)

#### E. Timeline Aktivitas

Timeline aktivitas terkini dengan detail:

- Title & Description
- User & Department
- Timestamp
- Activity Type (approved, updated, created, evaluated)

### 🔧 Fungsi Utama

```javascript
// Refresh data
const refreshData = async () => { ... }

// Export data
const exportData = () => { ... }

// View details (navigate to reports)
const viewDetails = () => { router.push('/reports') }
```

---

## 2. Penilaian SOP

### 📍 Route

- **Path**: `/monitoring/penilaian`
- **Component**: `SOPEvaluation.vue`
- **Roles**: `ADMIN`, `SUPERVISOR`

### 🎯 Fitur

#### A. Statistics Cards

4 kartu statistik:

- Total Penilaian
- Rata-rata Rating
- Rating Tinggi (≥4.5)
- Perlu Perbaikan (<3.5)

#### B. Filter Section

Filter evaluasi berdasarkan:

- Search (kode atau judul SOP)
- Departemen
- Kategori
- Rating Minimum

#### C. View Mode Toggle

Dua mode tampilan:

- **Table View**: DataTable dengan pagination
- **Card View**: Grid layout cards

#### D. Tabel Penilaian

Kolom yang ditampilkan:

- Kode SOP
- Judul SOP & Kategori
- Departemen
- Rating (stars + numeric)
- Jumlah Review
- Review Terakhir
- Aksi (Lihat Detail, Tambah Penilaian)

#### E. Form Penilaian

5 Kriteria penilaian (skala 1-5):

1. **Kelengkapan Konten**
2. **Kejelasan Prosedur**
3. **Kemudahan Implementasi**
4. **Relevansi**
5. **Efektivitas**

Plus:

- Overall Rating (auto-calculated dari 5 kriteria)
- Komentar/Saran (textarea)
- Rekomendasi (dropdown):
  - Sangat Direkomendasikan
  - Direkomendasikan
  - Perlu Perbaikan Kecil
  - Perlu Perbaikan Besar
  - Perlu Revisi Total

#### F. Detail Dialog

Menampilkan:

- Overall score dengan rating
- Breakdown kriteria (dengan progress bar)
- Review terbaru dengan:
  - Reviewer info & avatar
  - Rating & timestamp
  - Comment
  - Recommendation tag

### 🔧 Fungsi Utama

```javascript
// Add evaluation
const addEvaluation = (sop) => { ... }

// View evaluation details
const viewEvaluation = (sop) => { ... }

// Submit evaluation
const submitEvaluation = async () => { ... }

// Export evaluations
const exportEvaluations = () => { ... }

// Get recommendation severity
const getRecommendationSeverity = (recommendation) => { ... }
```

---

## 3. Laporan

### 📍 Route

- **Path**: `/reports`
- **Component**: `ReportList.vue`
- **Roles**: `ADMIN`, `PIMPINAN_TINGGI_UTAMA`, `PIMPINAN_TINGGI_MADYA`, `PIMPINAN_TINGGI_PRATAMA`, `SUPERVISOR`

### 🎯 Fitur

#### A. Report Templates

6 template laporan siap pakai:

1. **Ringkasan SOP**

   - Tag: Populer
   - Time: ~2 menit
   - Content: Ringkasan semua SOP dengan status, kategori, dan statistik

2. **Laporan Compliance**

   - Tag: Penting
   - Time: ~3 menit
   - Content: Tingkat kepatuhan implementasi SOP per departemen

3. **Workflow Approval**

   - Tag: Analitik
   - Time: ~4 menit
   - Content: Proses approval SOP, waktu review, bottleneck

4. **Aktivitas Pengguna**

   - Tag: Audit
   - Time: ~5 menit
   - Content: Log aktivitas pengguna (create, edit, approve)

5. **Penilaian SOP**

   - Tag: Evaluasi
   - Time: ~3 menit
   - Content: Hasil penilaian dan evaluasi SOP

6. **Performa Departemen**
   - Tag: Management
   - Time: ~4 menit
   - Content: Analisis performa departemen dalam pengelolaan SOP

#### B. Custom Report Builder

Form untuk membuat laporan kustom:

- **Jenis Laporan** (dropdown)
- **Periode** (date range calendar)
- **Departemen** (multi-select)
- **Kategori SOP** (multi-select)
- **Status SOP** (multi-select)
- **Format Export** (SelectButton: PDF, Excel, CSV)

Aksi:

- Reset form
- Generate laporan

#### C. Recent Reports Table

Tabel laporan yang sudah dibuat:

- Nama Laporan (dengan icon)
- Jenis (tag)
- Dibuat Oleh
- Tanggal Dibuat
- Ukuran File
- Format
- Aksi (Download, Preview, Hapus)

#### D. Schedule Report

Dialog untuk menjadwalkan laporan otomatis:

- Jenis Laporan
- Frekuensi (Harian/Mingguan/Bulanan/Triwulan)
- Email Penerima (chips input)
- Format Export

#### E. Export History

Dialog riwayat export dengan:

- Nama Laporan
- Tanggal Export
- User yang export
- Status (Success/Failed)

### 🔧 Fungsi Utama

```javascript
// Generate report from template
const generateReport = async (type) => { ... }

// Generate custom report
const generateCustomReport = async () => { ... }

// Reset custom report form
const resetCustomReport = () => { ... }

// Download report
const downloadReport = (report) => { ... }

// Preview report
const previewReport = (report) => { ... }

// Delete report
const deleteReport = (report) => { ... }

// Schedule report
const scheduleReport = () => { ... }

// Save schedule
const saveSchedule = () => { ... }

// View history
const viewHistory = () => { ... }
```

---

## 4. Dashboard (Updated)

### 📍 Route

- **Path**: `/` (root dashboard)
- **Component**: `Dashboard.vue`

### 🔄 Update yang Dilakukan

#### A. Page Header

- Added welcome message: "Selamat datang, {name}! 👋"
- Added refresh button with loading state

#### B. Permission Updates

Updated `canViewReports` computed:

```javascript
const canViewReports = computed(() =>
  [
    "ADMIN",
    "SUPERVISOR",
    "PIMPINAN_TINGGI_UTAMA",
    "PIMPINAN_TINGGI_MADYA",
    "PIMPINAN_TINGGI_PRATAMA",
  ].includes(authStore.user?.role)
);
```

#### C. Refresh Function

```javascript
const refreshData = async () => {
  loading.value = true;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } finally {
    loading.value = false;
  }
};
```

---

## 🎨 Design System

### Color Palette

```css
/* KPI Icons */
.blue: #667eea (SOP)
.green: #10b981 (Compliance/Active)
.orange: #f59700 (Warning/Review)
.purple: #8b5cf6 (Rating/Category)
.yellow: #fbbf24 (Evaluation)
.teal: #14b8a6 (Department)

/* Status Tags */
success: #10b981
warning: #f59e0b
danger: #ef4444
info: #3b82f6
```

### Component Hierarchy

```
MonitoringDashboard
├── KPI Cards (4)
├── Filter Section
├── Charts (4)
│   ├── Line Chart (Trend)
│   ├── Doughnut Chart (Status)
│   └── Bar Charts (2)
├── Performance Table
└── Timeline

SOPEvaluation
├── Statistics Cards (4)
├── Filter Section
├── View Toggle
├── DataTable/Cards
├── Evaluation Dialog
└── Detail Dialog

ReportList
├── Report Templates (6 cards)
├── Custom Report Builder
├── Recent Reports Table
├── Schedule Dialog
└── History Dialog
```

---

## 📊 Data Structures

### KPI Data

```javascript
{
  totalSOP: Number,
  sopGrowth: Number, // percentage
  complianceRate: Number, // percentage
  complianceTrend: Number,
  pendingReview: Number,
  avgReviewTime: Number, // days
  avgScore: Number, // 0-5
  evaluatedSOP: Number
}
```

### Evaluation Data

```javascript
{
  id: Number,
  sopCode: String,
  sopTitle: String,
  category: String,
  department: String,
  avgRating: Number, // 0-5
  totalReviews: Number,
  lastReviewDate: Date,
  criteriaScores: [
    { name: String, score: Number }
  ],
  reviews: [
    {
      id: Number,
      reviewer: String,
      department: String,
      rating: Number,
      date: Date,
      comment: String,
      recommendation: String
    }
  ]
}
```

### Report Data

```javascript
{
  id: Number,
  name: String,
  type: String,
  icon: String,
  generatedBy: String,
  generatedAt: Date,
  size: String,
  format: String // PDF, Excel, CSV
}
```

---

## 🔌 API Integration (TODO)

### Endpoints yang Diperlukan

#### Monitoring Dashboard

```
GET /api/monitoring/kpi
GET /api/monitoring/trend?period=30days
GET /api/monitoring/status-distribution
GET /api/monitoring/category-distribution
GET /api/monitoring/department-distribution
GET /api/monitoring/performance
GET /api/monitoring/activities?limit=10
```

#### Penilaian SOP

```
GET /api/evaluations?search=&department=&category=&minRating=
GET /api/evaluations/:sopId
POST /api/evaluations
PUT /api/evaluations/:id
GET /api/evaluations/statistics
```

#### Laporan

```
POST /api/reports/generate
POST /api/reports/custom
GET /api/reports/recent
GET /api/reports/:id/download
GET /api/reports/:id/preview
DELETE /api/reports/:id
POST /api/reports/schedule
GET /api/reports/history
```

---

## 🧪 Testing Checklist

### Dashboard Monitoring

- [ ] KPI cards display correct data
- [ ] Filter changes update charts
- [ ] Charts render correctly (all 4 types)
- [ ] Performance table sorts correctly
- [ ] Timeline displays activities in order
- [ ] Refresh button works
- [ ] Export data functionality
- [ ] Responsive on mobile/tablet

### Penilaian SOP

- [ ] Statistics cards show correct numbers
- [ ] Search filters work
- [ ] Table/Card view toggle works
- [ ] Pagination works
- [ ] Add evaluation opens dialog
- [ ] Form validation (all criteria required)
- [ ] Overall rating calculates correctly
- [ ] View detail shows breakdown
- [ ] Export evaluations works

### Laporan

- [ ] All 6 templates clickable
- [ ] Custom report form validation
- [ ] Date range picker works
- [ ] Multi-select works
- [ ] Format toggle works
- [ ] Generate report shows progress
- [ ] Recent reports table displays
- [ ] Download/Preview/Delete actions work
- [ ] Schedule dialog works
- [ ] History dialog displays exports

---

## 🚀 Next Steps

1. **Backend API Development**

   - Implement all monitoring endpoints
   - Implement evaluation CRUD
   - Implement report generation
   - Add background job for scheduled reports

2. **Real Data Integration**

   - Replace mock data with API calls
   - Add loading states
   - Implement error handling
   - Add pagination for large datasets

3. **Export Functionality**

   - PDF generation (jsPDF)
   - Excel export (xlsx)
   - CSV export
   - Email delivery for scheduled reports

4. **Advanced Features**

   - Real-time updates (WebSocket)
   - Chart drill-down
   - Advanced filters
   - Saved report templates
   - Comparison views (period over period)

5. **Performance Optimization**
   - Chart lazy loading
   - Data caching
   - Infinite scroll for tables
   - Debounced search

---

## 📝 Notes

- Semua mock data menggunakan data Indonesia (BPS context)
- Date format: `dd/mm/yy` (Indonesian format)
- Role-based access sudah diimplementasi
- Responsive design sudah diimplementasi
- Toast notifications untuk user feedback
- Loading states untuk async operations

---

## 🔗 Related Files

```
frontend/src/
├── views/
│   ├── Dashboard.vue (updated)
│   ├── Monitoring/
│   │   ├── MonitoringDashboard.vue (new)
│   │   └── SOPEvaluation.vue (new)
│   └── Reports/
│       └── ReportList.vue (updated)
├── router/index.js (updated)
└── layouts/AppMenu.vue (existing)
```

---

**Version**: 1.0.0  
**Last Updated**: November 11, 2025  
**Author**: AI Assistant
