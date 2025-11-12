# Manajemen Kategori SOP - Dokumentasi

## 📋 Overview

Sistem manajemen kategori SOP yang memungkinkan administrator untuk mengorganisir dan mengelompokkan SOP berdasarkan kategori dan sub-kategori hierarkis.

**File:** `frontend/src/views/Categories/CategoryList.vue` (1068 baris)

**Route:** `/categories`

**Menu:** Master Data → Kategori SOP

**Permissions:** ADMIN, SUPERVISOR

---

## ✨ Fitur Utama

### 1. Header Section

- **Icon Tag** biru di sebelah kiri (48x48px, rounded)
- **Judul:** "Manajemen Kategori SOP"
- **Subtitle:** Deskripsi singkat
- **Tombol:** "Tambah Kategori" (hijau, dengan icon plus)

### 2. Statistics Cards (4 Cards)

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  📑 17          │ │  ✓ 16           │ │  🌳 5           │ │  📄 143         │
│ Total Kategori  │ │ Kategori Aktif  │ │Dengan Sub-Kat.  │ │ Total SOP       │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Computed dari Mock Data:**

- Total Kategori: `categories.value.length`
- Kategori Aktif: Filter status === 'ACTIVE'
- Dengan Sub-Kategori: Filter yang punya children
- Total SOP: Sum dari semua sopCount

### 3. Filter Section

**Search Box:**

- Icon search di kiri
- Placeholder: "Cari kategori..."
- Search di: kode, nama, deskripsi

**Dropdown Status:**

- Semua Status
- Aktif
- Nonaktif

**Dropdown Tipe:**

- Semua Tipe
- Kategori Utama (tanpa parent)
- Sub-Kategori (punya parent)

**Tombol Reset:**

- Clear semua filter

### 4. DataTable

**Kolom (8 kolom):**

| Kolom          | Sortable | Width | Konten                              |
| -------------- | -------- | ----- | ----------------------------------- |
| Kode           | ✓        | 120px | Tag biru dengan kode                |
| Nama Kategori  | ✓        | 200px | Dengan arrow (→) untuk sub-kategori |
| Kategori Induk | ✓        | 150px | Nama parent atau "Kategori Utama"   |
| Deskripsi      | ✗        | 250px | Text atau "-"                       |
| Jumlah SOP     | ✓        | 120px | Chip "X SOP"                        |
| Status         | ✓        | 120px | Tag hijau/merah                     |
| Dibuat         | ✓        | 150px | Format: "dd MMM yyyy"               |
| Aksi           | ✗        | 150px | Edit & Delete (frozen right)        |

**Features:**

- Pagination: 5, 10, 20, 50 rows per page
- Sorting: Multi-column
- Striped rows
- Responsive scroll
- Empty state dengan icon inbox
- Frozen action column (tetap terlihat saat scroll)

**Action Buttons:**

- **Edit** (icon: pencil) - Tooltip: "Edit"
- **Delete** (icon: trash, red) - Tooltip: "Hapus"

### 5. Create/Edit Dialog

**Header:**

- "Tambah Kategori" (mode create)
- "Edit Kategori" (mode edit)

**Form Fields:**

```typescript
{
  code: string,        // Required, readonly saat edit
  name: string,        // Required
  parentId: string?,   // Optional, dropdown
  description: string, // Optional, textarea
  isActive: boolean    // Toggle switch
}
```

**Field Details:**

1. **Kode Kategori\*** (InputText)

   - Disabled saat mode edit
   - Placeholder: "Contoh: KAT-001"
   - Hint: "Kode unik untuk kategori (tidak dapat diubah setelah dibuat)"

2. **Nama Kategori\*** (InputText)

   - Placeholder: "Masukkan nama kategori"

3. **Kategori Induk** (Dropdown)

   - Options: Hanya kategori utama (tanpa parent)
   - Format: "KAT-001 - Administrasi"
   - Clearable
   - Hint: "Kosongkan jika ini kategori utama"

4. **Deskripsi** (Textarea)

   - 3 rows
   - Placeholder: "Jelaskan tujuan atau ruang lingkup kategori ini"

5. **Status** (InputSwitch)
   - Label: "Aktif" / "Nonaktif"

**Warning (Edit Mode):**

- Jika kategori punya SOP (sopCount > 0)
- Message: "Kategori ini memiliki X SOP. Pastikan perubahan tidak memengaruhi SOP yang ada."

**Footer Buttons:**

- **Batal** (secondary, outlined) - Close dialog
- **Simpan/Update** (primary) - Save dengan loading state

**Validation:**

- Code dan Name required
- Toast error jika kosong

### 6. Delete Confirmation Dialog

**Header:** "Konfirmasi Hapus"

**Content:**

- Warning icon (triangle, orange, 3rem)
- Teks: "Apakah Anda yakin ingin menghapus kategori ini?"
- Info box:
  - Kode: KAT-XXX
  - Nama: Nama Kategori
  - Warning: "Kategori ini memiliki X SOP" (merah, jika > 0)

**Delete Protection:**

- **Error Message** jika sopCount > 0:
  > "Anda tidak dapat menghapus kategori yang masih memiliki SOP. Pindahkan atau hapus SOP terlebih dahulu."
- Tombol "Hapus" disabled jika sopCount > 0

**Footer Buttons:**

- **Batal** (secondary, outlined)
- **Hapus** (danger, red) - Disabled jika ada SOP

---

## 🗂️ Mock Data Structure

### Category Object

```typescript
interface Category {
  id: string; // Unique ID
  code: string; // Kode kategori (e.g., "KAT-001")
  name: string; // Nama kategori
  parent: string | null; // Nama parent (untuk display)
  parentId: string | null; // ID parent (untuk relasi)
  description: string; // Deskripsi
  sopCount: number; // Jumlah SOP
  status: "ACTIVE" | "INACTIVE"; // Status
  createdAt: string; // ISO date string
  children: string[]; // Array of child IDs
}
```

### Sample Data (17 Categories)

**Kategori Utama (6):**

1. **KAT-001** - Administrasi (15 SOP)

   - KAT-001-01: Surat Menyurat (8 SOP)
   - KAT-001-02: Arsip dan Dokumentasi (7 SOP)

2. **KAT-002** - Keuangan (12 SOP)

   - KAT-002-01: Penganggaran (4 SOP)
   - KAT-002-02: Pencairan Dana (5 SOP)
   - KAT-002-03: Pelaporan Keuangan (3 SOP)

3. **KAT-003** - SDM (18 SOP)

   - KAT-003-01: Rekrutmen (6 SOP)
   - KAT-003-02: Pengembangan Kompetensi (7 SOP)
   - KAT-003-03: Evaluasi Kinerja (5 SOP)

4. **KAT-004** - Teknologi Informasi (10 SOP)

   - KAT-004-01: Keamanan Sistem (6 SOP)
   - KAT-004-02: Pemeliharaan Sistem (4 SOP)

5. **KAT-005** - Pelayanan Publik (20 SOP)

   - KAT-005-01: Pengaduan Masyarakat (5 SOP)

6. **KAT-006** - Pengadaan (8 SOP, INACTIVE)

**Total:** 17 kategori, 143 SOP

---

## 🔄 User Flows

### Flow 1: Tambah Kategori Utama

```
1. User klik "Tambah Kategori"
2. Dialog terbuka (mode: create)
3. User isi form:
   - Kode: KAT-007
   - Nama: Hukum dan Peraturan
   - Parent: (kosong)
   - Deskripsi: ...
   - Status: Aktif
4. User klik "Simpan"
5. Loading state (1.5s simulate API)
6. Success toast: "Kategori berhasil ditambahkan"
7. Dialog close
8. Table refresh dengan data baru
9. Statistics update otomatis
```

### Flow 2: Edit Kategori

```
1. User klik icon Edit (pencil) di action column
2. Dialog terbuka (mode: edit)
3. Form pre-filled dengan data kategori
4. Field "Kode" disabled (readonly)
5. Warning muncul jika sopCount > 0
6. User ubah data (misal: nama, deskripsi)
7. User klik "Update"
8. Loading state (1.5s)
9. Success toast: "Kategori berhasil diupdate"
10. Dialog close
11. Table refresh
```

### Flow 3: Hapus Kategori

**Skenario A: Kategori Kosong (sopCount = 0)**

```
1. User klik icon Delete (trash) di action column
2. Confirmation dialog terbuka
3. Info kategori ditampilkan
4. Tombol "Hapus" enabled
5. User klik "Hapus"
6. Loading state (1.5s)
7. Success toast: "Kategori berhasil dihapus"
8. Dialog close
9. Kategori hilang dari table
10. Statistics update
```

**Skenario B: Kategori Berisi SOP (sopCount > 0)**

```
1. User klik icon Delete
2. Confirmation dialog terbuka
3. Warning merah: "Kategori ini memiliki X SOP"
4. Error message ditampilkan
5. Tombol "Hapus" disabled (grayed out)
6. User hanya bisa klik "Batal"
```

### Flow 4: Filter & Search

```
1. User ketik di search box: "keuangan"
2. Table filtered real-time via computed property
3. Hasil: KAT-002 + 3 sub-kategori
4. User pilih Status: "Nonaktif"
5. Hasil: KAT-006 (Pengadaan)
6. User klik "Reset"
7. All filters cleared
8. Table kembali ke data lengkap
```

---

## 🎨 Design System

### Colors

```css
/* Primary */
--blue: #3b82f6; /* Icon, tags, links */
--green: #10b981; /* Success, active, add button */
--red: #ef4444; /* Danger, delete, inactive */
--orange: #f59e0b; /* Warning */
--purple: #8b5cf6; /* Accent, stats */

/* Neutrals */
--slate-900: #1e293b; /* Headings */
--slate-700: #334155; /* Body text */
--slate-500: #64748b; /* Secondary text */
--slate-300: #cbd5e1; /* Borders */
--slate-100: #f1f5f9; /* Backgrounds */
```

### Typography

```css
/* Headings */
h1: 1.75rem, 700 weight
h3: 2rem, 700 weight (stats)

/* Body */
body: 0.95rem, 400 weight
.subtitle: 0.95rem, 400 weight
.field-hint: 0.85rem, 400 weight

/* Monospace */
.category-code: 'Courier New', 600 weight
```

### Spacing

```css
/* Container */
padding: 1.5rem;
gap: 1rem - 2rem;

/* Cards */
padding: 1.5rem;
border-radius: 12px;
gap: 1rem - 1.5rem;

/* Forms */
margin-bottom: 1.5rem;
gap: 0.5rem - 1rem;
```

### Components

**Stat Cards:**

- Size: 60x60px icon wrapper
- Border-radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: translateY(-4px) + shadow

**Buttons:**

- Add: Green, with icon
- Edit: Blue icon, text only
- Delete: Red icon, text only
- Reset: Secondary, outlined

**Tags:**

- Border-radius: default
- Font-weight: 500-600
- Severity colors: success, danger, info, secondary

**Dialog:**

- Width: 600px (create/edit), 450px (delete)
- Padding: 1rem
- Border-radius: default

---

## 🔐 Permissions & Security

### Role-Based Access

**Computed:**

```javascript
const canManageCategories = computed(() => {
  const role = authStore.user?.role;
  return ["ADMIN", "SUPERVISOR"].includes(role);
});
```

**Conditional Rendering:**

- Tombol "Tambah Kategori": `v-if="canManageCategories"`
- Action column: `v-if="canManageCategories"`
- Edit/Delete buttons: `v-if="canManageCategories"`

**Read-Only Users:**

- PIMPINAN*TINGGI*\*
- STAFF
- Other roles

→ Dapat melihat daftar kategori, tapi tidak bisa create/edit/delete

---

## 📡 API Specification (Backend Requirements)

### 1. GET /api/categories

**Purpose:** List all categories dengan hierarki

**Query Params:**

```typescript
{
  search?: string;      // Search di kode/nama/deskripsi
  status?: 'ACTIVE' | 'INACTIVE' | 'all';
  type?: 'main' | 'sub' | 'all'; // main = no parent
  page?: number;
  limit?: number;
  sortBy?: string;      // e.g., 'name', 'createdAt'
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    categories: Category[],
    total: number,
    page: number,
    limit: number,
    statistics: {
      totalCategories: number,
      activeCategories: number,
      withSubCategories: number,
      totalSOPs: number
    }
  }
}
```

### 2. GET /api/categories/:id

**Purpose:** Get single category detail

**Response:**

```typescript
{
  success: true,
  data: {
    category: Category,
    children: Category[],  // Sub-categories
    sops: SOP[]           // List SOP in this category
  }
}
```

### 3. POST /api/categories

**Purpose:** Create new category

**Body:**

```typescript
{
  code: string;         // Required, unique
  name: string;         // Required
  parentId?: string;    // Optional, validate exists
  description?: string;
  isActive: boolean;    // Default: true
}
```

**Validation:**

- Code must be unique
- Code format: KAT-XXX or KAT-XXX-YY
- Name required (min 3 chars)
- ParentId must exist if provided
- ParentId must be a main category (not a sub-category)

**Response:**

```typescript
{
  success: true,
  data: {
    category: Category
  },
  message: "Kategori berhasil ditambahkan"
}
```

### 4. PUT /api/categories/:id

**Purpose:** Update existing category

**Body:**

```typescript
{
  name?: string;
  description?: string;
  isActive?: boolean;
  // Note: code dan parentId tidak bisa diubah
}
```

**Validation:**

- Category must exist
- Name required if provided
- Cannot change code
- Cannot change parentId (akan affect hierarchy)

**Response:**

```typescript
{
  success: true,
  data: {
    category: Category
  },
  message: "Kategori berhasil diupdate"
}
```

### 5. DELETE /api/categories/:id

**Purpose:** Delete category

**Validation:**

- Category must exist
- sopCount must be 0 (no SOP in this category)
- children must be empty (no sub-categories)
- Cannot delete if referenced by SOPs

**Error Responses:**

```typescript
// If has SOPs
{
  success: false,
  error: {
    code: 'CATEGORY_HAS_SOPS',
    message: 'Tidak dapat menghapus kategori yang masih memiliki SOP',
    data: {
      sopCount: number
    }
  }
}

// If has sub-categories
{
  success: false,
  error: {
    code: 'CATEGORY_HAS_CHILDREN',
    message: 'Tidak dapat menghapus kategori yang masih memiliki sub-kategori',
    data: {
      childrenCount: number
    }
  }
}
```

**Success Response:**

```typescript
{
  success: true,
  message: "Kategori berhasil dihapus"
}
```

### 6. GET /api/categories/tree

**Purpose:** Get hierarchical tree structure (untuk Tree View jika diaktifkan)

**Response:**

```typescript
{
  success: true,
  data: {
    tree: TreeNode[]
  }
}

interface TreeNode {
  key: string;          // Category ID
  label: string;        // Category name
  code: string;
  sopCount: number;
  status: string;
  data: Category;
  children: TreeNode[];
}
```

---

## 🧪 Testing Checklist

### Manual Testing

**Display Tests:**

- ✅ Header dengan icon dan judul tampil
- ✅ 4 Statistics cards tampil dengan data benar
- ✅ Search box dan filter dropdowns tampil
- ✅ DataTable dengan 17 kategori tampil
- ✅ Pagination berfungsi (5, 10, 20, 50)
- ✅ Kolom sortable berfungsi
- ✅ Action buttons tampil untuk ADMIN/SUPERVISOR
- ✅ Action buttons hidden untuk role lain

**Filter Tests:**

- ✅ Search: ketik "keuangan" → filter ke KAT-002 + children
- ✅ Status: pilih "Nonaktif" → hanya KAT-006
- ✅ Status: pilih "Aktif" → 16 kategori
- ✅ Tipe: pilih "Kategori Utama" → 6 kategori
- ✅ Tipe: pilih "Sub-Kategori" → 11 kategori
- ✅ Reset: clear semua filter
- ✅ Combine filters: search + status + type

**Create Tests:**

- ✅ Klik "Tambah Kategori" → dialog buka
- ✅ Isi kode: "KAT-007" → accept
- ✅ Isi nama: "Test" → accept
- ✅ Pilih parent: KAT-001 → dropdown work
- ✅ Clear parent → "Kategori Utama"
- ✅ Toggle status → switch work
- ✅ Klik "Simpan" tanpa kode → error toast
- ✅ Klik "Simpan" tanpa nama → error toast
- ✅ Simpan valid → loading → success toast → close
- ✅ Table refresh dengan kategori baru
- ✅ Statistics update

**Edit Tests:**

- ✅ Klik Edit pada KAT-001 → dialog buka
- ✅ Form pre-filled dengan data benar
- ✅ Field "Kode" disabled
- ✅ Warning muncul jika sopCount > 0
- ✅ Ubah nama → accept
- ✅ Ubah deskripsi → accept
- ✅ Toggle status → switch work
- ✅ Klik "Update" → loading → success toast
- ✅ Table refresh dengan data updated

**Delete Tests:**

- ✅ Klik Delete pada kategori tanpa SOP → dialog buka
- ✅ Info kategori tampil benar
- ✅ Tombol "Hapus" enabled
- ✅ Klik "Hapus" → loading → success toast → kategori hilang
- ✅ Klik Delete pada kategori dengan SOP → dialog buka
- ✅ Warning merah tampil: "memiliki X SOP"
- ✅ Error message tampil
- ✅ Tombol "Hapus" disabled
- ✅ Hanya bisa klik "Batal"

**Responsive Tests:**

- ✅ Desktop (1920px): 4 kolom stats cards
- ✅ Tablet (768px): 2 kolom stats cards, stacked filters
- ✅ Mobile (375px): 1 kolom, full width search/dropdown

**Permission Tests:**

- ✅ Login as ADMIN → tombol & actions tampil
- ✅ Login as SUPERVISOR → tombol & actions tampil
- ✅ Login as PIMPINAN → read-only (no buttons)
- ✅ Login as STAFF → read-only (no buttons)

### Integration Tests (Backend Required)

```javascript
describe("CategoryList Component", () => {
  it("should fetch categories on mount", async () => {
    // Mock API call
    // Assert categories loaded
  });

  it("should filter by search query", async () => {
    // Type in search
    // Assert filtered results
  });

  it("should create category", async () => {
    // Open dialog
    // Fill form
    // Submit
    // Assert API called with correct payload
    // Assert success toast
  });

  it("should prevent delete if has SOPs", async () => {
    // Click delete on category with SOPs
    // Assert delete button disabled
    // Assert error message shown
  });
});
```

---

## 🚀 Next Steps

### Phase 1: Backend API Development

1. Setup Prisma schema untuk Categories
2. Implement 6 API endpoints
3. Add validation logic
4. Add cascade delete prevention
5. Test API dengan Postman

### Phase 2: Frontend Integration

1. Replace mock data dengan API calls
2. Add loading states
3. Add error handling
4. Add retry logic
5. Test end-to-end flows

### Phase 3: Enhancements (Optional)

1. Add Tree View toggle (SelectButton)
2. Add drag-drop untuk reorder
3. Add bulk actions (delete multiple)
4. Add export to Excel/CSV
5. Add import from Excel
6. Add category icon picker
7. Add color picker untuk kategori

### Phase 4: Optimization

1. Add server-side pagination
2. Add infinite scroll
3. Add category caching
4. Add search debounce
5. Optimize re-renders

---

## 📝 Notes

- **Mock Data:** 17 kategori, 143 SOP (hardcoded)
- **Hierarchy:** Max 2 levels (kategori utama + sub-kategori)
- **Code Format:** KAT-XXX untuk utama, KAT-XXX-YY untuk sub
- **Delete Protection:** Otomatis cek sopCount > 0
- **Status:** ACTIVE (default) atau INACTIVE
- **Date Format:** "dd MMM yyyy" (Indonesia locale)
- **Toast Duration:** 3000ms (3 detik)
- **Loading Simulate:** 1500ms (1.5 detik)

---

## 🐛 Known Issues

- ❌ Tree View dinonaktifkan (SelectButton dihapus sesuai screenshot)
- ✅ Table View fully functional
- ✅ All CRUD operations working dengan mock data
- ✅ Permissions working correctly
- ✅ No TypeScript/console errors

---

## 📞 Support

Untuk pertanyaan atau bug report terkait Manajemen Kategori SOP, hubungi tim development.

**Last Updated:** November 12, 2025
