# Master Data Management - OpenSOP

## Overview

Sistem Master Data OpenSOP terdiri dari 4 modul utama untuk mengelola data referensi yang digunakan di seluruh aplikasi.

## Modul Master Data

### 1. 📋 Kategori SOP (`/categories`)

**File:** `frontend/src/views/Categories/CategoryList.vue`

**Deskripsi:** Mengelola kategori/klasifikasi SOP untuk pengelompokan SOP berdasarkan jenis atau topik.

**Fitur:**

- ✅ Daftar kategori dengan pagination
- ✅ Pencarian kategori
- ✅ Tambah kategori baru
- ✅ Edit kategori
- ✅ Hapus kategori
- ✅ Menampilkan jumlah SOP per kategori

**Role Access:** Admin, Supervisor

---

### 2. 🏢 Unit Kerja/Departemen (`/departments`)

**File:** `frontend/src/views/Departments/DepartmentList.vue`

**Deskripsi:** Mengelola unit kerja/departemen di BPS (misalnya: Direktorat Analisis, Direktorat Diseminasi, dll).

**Fitur:**

- ✅ Daftar departemen dengan pagination
- ✅ Pencarian departemen
- ✅ Tambah departemen baru (Nama, Kode, Deskripsi)
- ✅ Edit departemen
- ✅ Hapus departemen
- ✅ Menampilkan jumlah anggota per departemen

**Fields:**

- `name` (required) - Nama departemen
- `code` (required) - Kode departemen (singkatan)
- `description` (optional) - Deskripsi lengkap
- `memberCount` (auto) - Jumlah anggota

**Role Access:** Admin only

---

### 3. 👤 Aktor/Pelaksana (`/actors`)

**File:** `frontend/src/views/Actors/ActorList.vue`

**Deskripsi:** Mengelola aktor/pelaksana yang terlibat dalam prosedur SOP. Aktor digunakan untuk menentukan siapa yang bertanggung jawab di setiap step flowchart SOP.

**Fitur:**

- ✅ Daftar aktor dengan pagination
- ✅ Pencarian aktor (berdasarkan nama jabatan, kode, deskripsi)
- ✅ Filter berdasarkan unit kerja
- ✅ Tambah aktor baru
- ✅ Edit aktor
- ✅ Hapus aktor (disabled jika digunakan di SOP)
- ✅ Menampilkan jumlah SOP yang menggunakan aktor
- ✅ Integrasi dengan unit kerja

**Fields:**

- `kodeAktor` (required) - Kode unik aktor (contoh: KETUA_TIM, ANGGOTA)
- `namaJabatan` (required) - Nama jabatan/posisi (contoh: Ketua Tim Metodologi)
- `departmentId` (optional) - Relasi ke unit kerja
- `deskripsi` (optional) - Deskripsi tugas dan tanggung jawab
- `sopCount` (auto) - Jumlah SOP yang menggunakan aktor ini

**Contoh Data:**

```javascript
{
  kodeAktor: 'KETUA_TIM',
  namaJabatan: 'Ketua Tim Metodologi dan Analisis Statistik',
  departmentId: 1,
  deskripsi: 'Bertanggung jawab atas metodologi dan analisis statistik',
  sopCount: 15
}
```

**Business Rules:**

- Kode aktor harus unique
- Aktor tidak bisa dihapus jika masih digunakan di SOP aktif
- Satu aktor bisa digunakan di multiple SOP
- Aktor bisa dikaitkan dengan unit kerja tertentu

**Role Access:** Admin, Supervisor

---

### 4. 👥 Pengguna (`/users`)

**File:** `frontend/src/views/Users/UserList.vue`

**Deskripsi:** Mengelola pengguna sistem OpenSOP dengan role-based access control.

**Fitur:**

- ✅ Daftar pengguna dengan pagination
- ✅ Pencarian pengguna
- ✅ Filter berdasarkan role
- ✅ Filter berdasarkan departemen
- ✅ Tambah pengguna baru
- ✅ Edit pengguna
- ✅ Hapus pengguna
- ✅ Reset password
- ✅ Aktifkan/nonaktifkan akun
- ✅ Avatar dengan initial nama

**Fields:**

- `name` (required) - Nama lengkap
- `email` (required, unique) - Email (digunakan untuk login)
- `password` (required untuk create) - Password
- `role` (required) - Role pengguna
- `departmentId` (required) - Unit kerja
- `isActive` (boolean) - Status aktif/nonaktif

**Role Hierarchy:**

1. **ADMIN** - Full access, mengelola semua master data
2. **PIMPINAN_TINGGI_UTAMA** - Approval SOP level tertinggi
3. **PIMPINAN_TINGGI_MADYA** - Approval SOP level menengah
4. **PIMPINAN_TINGGI_PRATAMA** - Approval SOP level awal
5. **SUPERVISOR** - Mengelola SOP dan master data (kecuali user)
6. **USER** - Membuat dan mengedit SOP
7. **GUEST** - Hanya view SOP

**Role Access:** Admin, Supervisor

---

## Navigation Structure

```
Master Data (Menu Sidebar)
├── 🏢 Unit Kerja         → /departments  (Admin)
├── 👤 Aktor/Pelaksana    → /actors       (Admin, Supervisor)
├── 📋 Kategori SOP       → /categories   (Admin, Supervisor)
└── 👥 Pengguna           → /users        (Admin)
```

## Relasi Antar Master Data

```
Unit Kerja (Department)
    ├── has many → Pengguna (User)
    └── has many → Aktor (Actor)

Aktor (Actor)
    ├── belongs to → Unit Kerja (Department)
    └── used in many → SOP Flowchart Activities

Pengguna (User)
    └── belongs to → Unit Kerja (Department)

Kategori (Category)
    └── used in many → SOP
```

## API Endpoints (Backend - To Be Implemented)

### Unit Kerja

```
GET    /api/departments           - List all departments
POST   /api/departments           - Create department
GET    /api/departments/:id       - Get department detail
PUT    /api/departments/:id       - Update department
DELETE /api/departments/:id       - Delete department
```

### Aktor

```
GET    /api/actors                - List all actors
POST   /api/actors                - Create actor
GET    /api/actors/:id            - Get actor detail
PUT    /api/actors/:id            - Update actor
DELETE /api/actors/:id            - Delete actor (only if sopCount = 0)
GET    /api/actors/:id/sops       - Get SOPs using this actor
```

### Kategori

```
GET    /api/categories            - List all categories
POST   /api/categories            - Create category
GET    /api/categories/:id        - Get category detail
PUT    /api/categories/:id        - Update category
DELETE /api/categories/:id        - Delete category
```

### Pengguna

```
GET    /api/users                 - List all users
POST   /api/users                 - Create user
GET    /api/users/:id             - Get user detail
PUT    /api/users/:id             - Update user
DELETE /api/users/:id             - Delete user
POST   /api/users/:id/reset-password  - Reset password
PUT    /api/users/:id/toggle-status   - Activate/deactivate user
```

## Database Schema (Prisma)

### Department Model

```prisma
model Department {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  code        String    @unique
  description String?
  users       User[]
  actors      Actor[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Actor Model

```prisma
model Actor {
  id            Int         @id @default(autoincrement())
  kodeAktor     String      @unique
  namaJabatan   String
  departmentId  Int?
  department    Department? @relation(fields: [departmentId], references: [id])
  deskripsi     String?
  activities    FlowchartActivity[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### User Model

```prisma
model User {
  id           Int        @id @default(autoincrement())
  name         String
  email        String     @unique
  password     String
  role         Role       @default(USER)
  departmentId Int
  department   Department @relation(fields: [departmentId], references: [id])
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

enum Role {
  ADMIN
  PIMPINAN_TINGGI_UTAMA
  PIMPINAN_TINGGI_MADYA
  PIMPINAN_TINGGI_PRATAMA
  SUPERVISOR
  USER
  GUEST
}
```

## Testing Checklist

### Unit Kerja

- [ ] Create new department
- [ ] Edit department
- [ ] Delete department without members
- [ ] Cannot delete department with members
- [ ] Search department
- [ ] Pagination works

### Aktor

- [ ] Create new actor
- [ ] Edit actor
- [ ] Delete actor without SOP usage
- [ ] Cannot delete actor used in SOP
- [ ] Search actor
- [ ] Filter by department
- [ ] Pagination works
- [ ] Associate actor with department

### Pengguna

- [ ] Create new user
- [ ] Edit user
- [ ] Delete user
- [ ] Reset password
- [ ] Toggle user status
- [ ] Search user
- [ ] Filter by role
- [ ] Filter by department
- [ ] Pagination works

## Next Steps

1. ✅ Frontend views complete
2. ⏳ Backend API implementation (Prisma + Express)
3. ⏳ Database migrations
4. ⏳ Integration testing
5. ⏳ Validation rules implementation
6. ⏳ Error handling
7. ⏳ Export/Import functionality
8. ⏳ Audit log for master data changes

## Notes

- All master data changes should be logged for audit trail
- Consider adding soft delete for safety
- Implement proper validation on both frontend and backend
- Add bulk import/export functionality for large datasets
- Consider caching for frequently accessed master data
