# 🔧 Mode Manual/Basic Routes Integration

## 📋 Perubahan yang Dilakukan

### **File Modified:** `backend/src/routes/sop.routes.js`

---

## ✅ Perubahan 1: Import Controller

**Sebelum:**

```javascript
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");
const {
  validate,
  validateQuery,
  validateParams,
  schemas,
} = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");
const Joi = require("joi");

const prisma = new PrismaClient();
```

**Sesudah:**

```javascript
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");
const {
  validate,
  validateQuery,
  validateParams,
  schemas,
} = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");
const Joi = require("joi");
const sopManualController = require("../controllers/sopManual.controller"); // ← TAMBAHAN

const prisma = new PrismaClient();
```

---

## ✅ Perubahan 2: Route POST /api/sop

### **Fungsi:** Create SOP Baru

**Sebelum:**

```javascript
/**
 * @route   POST /api/sop
 * @desc    Create new SOP
 * @access  Private (Manager, Admin)
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "MANAGER"), // ← Hanya ADMIN & MANAGER
  validate(schemas.createSOP),
  asyncHandler(async (req, res) => {
    // ... kode legacy inline
  })
);
```

**Sesudah:**

```javascript
/**
 * @route   POST /api/sop
 * @desc    Create new SOP with Mode Manual/Basic support
 * @access  Private (Supervisor, Manager, Admin)
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPERVISOR", "MANAGER"), // ← Tambah SUPERVISOR
  sopManualController.createSOP // ← Menggunakan controller
);

/**
 * @route   POST /api/sop/legacy
 * @desc    Create new SOP (legacy method without tabular steps)
 * @access  Private (Manager, Admin)
 */
router.post(
  "/legacy",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(schemas.createSOP),
  asyncHandler(async (req, res) => {
    // ... kode legacy tetap ada di /api/sop/legacy
  })
);
```

**Perubahan:**

- ✅ Menambahkan role `SUPERVISOR` untuk bisa create SOP
- ✅ Menggunakan `sopManualController.createSOP` yang mendukung:
  - `tabularSteps` (array of ISOPStep)
  - `flowchartData` (IFlowchartData object)
  - Validasi struktur data
  - Auto-generate SOP number
  - JSONB storage
- ✅ Kode legacy dipindahkan ke `/api/sop/legacy` sebagai fallback

---

## ✅ Perubahan 3: Route GET /api/sop/:id

### **Fungsi:** Get Detail SOP by ID

**Sebelum:**

```javascript
/**
 * @route   GET /api/sop/:id
 * @desc    Get SOP by ID
 * @access  Public (for approved) / Private (for others)
 */
router.get(
  "/:id",
  optionalAuth,
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    // ... kode legacy inline
  })
);
```

**Sesudah:**

```javascript
/**
 * @route   GET /api/sop/:id
 * @desc    Get SOP by ID (supports Mode Manual/Basic with tabular steps)
 * @access  Public (for approved) / Private (for others)
 */
router.get(
  "/:id",
  optionalAuth,
  sopManualController.getSOPById // ← Menggunakan controller
);

/**
 * @route   GET /api/sop/:id/legacy
 * @desc    Get SOP by ID (legacy method)
 * @access  Public (for approved) / Private (for others)
 */
router.get(
  "/:id/legacy",
  optionalAuth,
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  asyncHandler(async (req, res) => {
    // ... kode legacy tetap ada di /api/sop/:id/legacy
  })
);
```

**Perubahan:**

- ✅ Menggunakan `sopManualController.getSOPById` yang:
  - Otomatis parse JSONB fields (`tabularSteps`, `flowchartData`)
  - Return data sebagai JavaScript object/array
  - Increment view count
  - Permission checking
- ✅ Kode legacy tersedia di `/api/sop/:id/legacy`

---

## ✅ Perubahan 4: Route PUT /api/sop/:id

### **Fungsi:** Update SOP

**Sebelum:**

```javascript
/**
 * @route   PUT /api/sop/:id
 * @desc    Update SOP
 * @access  Private (Manager, Admin, or Creator)
 */
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"), // ← Hanya ADMIN & MANAGER
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  validate(schemas.updateSOP),
  asyncHandler(async (req, res) => {
    // ... kode legacy inline
  })
);
```

**Sesudah:**

```javascript
/**
 * @route   PUT /api/sop/:id
 * @desc    Update SOP (supports Mode Manual/Basic with tabular steps)
 * @access  Private (Manager, Admin, Supervisor, or Creator)
 */
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPERVISOR", "MANAGER"), // ← Tambah SUPERVISOR
  sopManualController.updateSOP // ← Menggunakan controller
);

/**
 * @route   PUT /api/sop/:id/legacy
 * @desc    Update SOP (legacy method without tabular steps)
 * @access  Private (Manager, Admin, or Creator)
 */
router.put(
  "/:id/legacy",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validateParams(Joi.object({ id: schemas.uuid.required() })),
  validate(schemas.updateSOP),
  asyncHandler(async (req, res) => {
    // ... kode legacy tetap ada
  })
);
```

**Perubahan:**

- ✅ Menambahkan role `SUPERVISOR` untuk bisa update SOP
- ✅ Menggunakan `sopManualController.updateSOP` yang:
  - Validate `tabularSteps` dan `flowchartData`
  - Update JSONB fields
  - Auto-create new version jika ada perubahan signifikan
  - Permission checking (owner, supervisor, admin)
  - Audit log
- ✅ Kode legacy tersedia di `/api/sop/:id/legacy`

---

## 🎯 Endpoint Summary

### **Mode Manual/Basic Endpoints (NEW):**

| Method | Endpoint       | Description                        | Roles                      | Controller                       |
| ------ | -------------- | ---------------------------------- | -------------------------- | -------------------------------- |
| POST   | `/api/sop`     | Create SOP dengan tabular steps    | ADMIN, SUPERVISOR, MANAGER | `sopManualController.createSOP`  |
| GET    | `/api/sop/:id` | Get SOP detail dengan JSONB parsed | Public/All                 | `sopManualController.getSOPById` |
| PUT    | `/api/sop/:id` | Update SOP dengan tabular steps    | ADMIN, SUPERVISOR, MANAGER | `sopManualController.updateSOP`  |

### **Legacy Endpoints (Fallback):**

| Method | Endpoint              | Description                 | Roles          |
| ------ | --------------------- | --------------------------- | -------------- |
| POST   | `/api/sop/legacy`     | Create SOP (old method)     | ADMIN, MANAGER |
| GET    | `/api/sop/:id/legacy` | Get SOP detail (old method) | Public/All     |
| PUT    | `/api/sop/:id/legacy` | Update SOP (old method)     | ADMIN, MANAGER |

---

## 🔍 Controller Functions

File: `backend/src/controllers/sopManual.controller.js`

### **1. createSOP(req, res)**

**Validasi:**

- ✅ `tabularSteps` harus array dengan minimal 1 step
- ✅ Setiap step harus punya: `step_id`, `activity`, `actor`
- ✅ `flowchartData` (optional) harus punya: `version`, `nodes[]`, `connections[]`

**Process:**

1. Validate tabular steps structure
2. Validate flowchart data (jika ada)
3. Generate SOP number (format: `SOP/DEPT/YEAR/###`)
4. Create SOP document dengan JSONB columns
5. Create initial version
6. Link categories
7. Create audit log
8. Return SOP dengan data lengkap

**Request Body:**

```json
{
  "title": "SOP Pelayanan Data",
  "description": "...",
  "departmentId": "uuid",
  "categoryIds": ["uuid1", "uuid2"],
  "tabularSteps": [
    {
      "step_id": 1,
      "activity": "Terima permohonan",
      "actor": "Staff Admin",
      "mutu_waktu": "5 menit",
      "mutu_output": "Form terverifikasi",
      "notes": "...",
      "order": 1
    }
  ],
  "flowchartData": {
    "version": "1.0",
    "nodes": [...],
    "connections": [...]
  },
  "tags": ["pelayanan", "data"],
  "effectiveDate": "2025-01-01"
}
```

**Response:**

```json
{
  "success": true,
  "message": "SOP created successfully",
  "data": {
    "id": "uuid",
    "sopNumber": "SOP/IPDS/2025/001",
    "title": "...",
    "tabularSteps": [...],  // ← Parsed dari JSONB
    "flowchartData": {...}, // ← Parsed dari JSONB
    ...
  }
}
```

---

### **2. updateSOP(req, res)**

**Validasi:**

- ✅ Permission check (owner, supervisor, admin)
- ✅ SOP exist check
- ✅ Validate tabular steps (jika diupdate)
- ✅ Validate flowchart data (jika diupdate)

**Process:**

1. Check permission
2. Validate input
3. Update SOP document
4. Create new version jika ada perubahan signifikan pada tabular steps
5. Update categories (jika ada)
6. Create audit log
7. Return updated SOP

**Request Body:**

```json
{
  "title": "SOP Updated",
  "tabularSteps": [...],  // ← Optional
  "flowchartData": {...}, // ← Optional
  "categoryIds": [...],   // ← Optional
  ...
}
```

---

### **3. getSOPById(req, res)**

**Process:**

1. Find SOP by ID
2. Check permissions (DRAFT/REVIEW hanya visible untuk creator/supervisor/admin)
3. Increment view count
4. Create read receipt (jika authenticated)
5. Return SOP dengan JSONB auto-parsed ke object/array

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "sopNumber": "SOP/IPDS/2025/001",
    "title": "...",
    "tabularSteps": [
      {
        "step_id": 1,
        "activity": "...",
        "actor": "...",
        ...
      }
    ],
    "flowchartData": {
      "version": "1.0",
      "nodes": [...],
      "connections": [...]
    },
    "department": {...},
    "categories": [...],
    "currentVersion": {...}
  }
}
```

---

## 🚀 Testing

### **1. Test Create SOP**

**Request:**

```bash
POST http://localhost:3000/api/sop
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test SOP Mode Manual",
  "description": "Testing Mode Manual/Basic",
  "departmentId": "uuid-department",
  "categoryIds": ["uuid-cat1"],
  "tabularSteps": [
    {
      "step_id": 1,
      "activity": "Langkah 1",
      "actor": "Staff Admin",
      "mutu_waktu": "5 menit",
      "mutu_output": "Output 1",
      "notes": "",
      "order": 1
    },
    {
      "step_id": 2,
      "activity": "Langkah 2",
      "actor": "Kepala Seksi",
      "mutu_waktu": "10 menit",
      "mutu_output": "Output 2",
      "notes": "",
      "order": 2
    }
  ],
  "tags": ["test"],
  "effectiveDate": "2025-01-01"
}
```

**Expected Response:** `200 OK` dengan data SOP termasuk `tabularSteps` yang tersimpan

---

### **2. Test Get SOP**

**Request:**

```bash
GET http://localhost:3000/api/sop/<sop-id>
Authorization: Bearer <token> (optional untuk ACTIVE SOP)
```

**Expected Response:** `200 OK` dengan `tabularSteps` dan `flowchartData` sebagai object/array

---

### **3. Test Update SOP**

**Request:**

```bash
PUT http://localhost:3000/api/sop/<sop-id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "tabularSteps": [
    {
      "step_id": 1,
      "activity": "Langkah 1 Updated",
      "actor": "Staff Admin",
      "mutu_waktu": "3 menit",
      "mutu_output": "Output 1 Updated",
      "notes": "",
      "order": 1
    }
  ]
}
```

**Expected Response:** `200 OK` dengan data SOP updated

---

## 🐛 Troubleshooting

### **Error: "Tabular steps are required"**

- **Cause:** Request body tidak include `tabularSteps` atau array kosong
- **Solution:** Pastikan `tabularSteps` adalah array dengan minimal 1 step

### **Error: "Invalid tabular step structure"**

- **Cause:** Step tidak punya `step_id`, `activity`, atau `actor`
- **Solution:** Pastikan setiap step punya field required:
  ```json
  {
    "step_id": 1,
    "activity": "...",
    "actor": "...",
    "order": 1
  }
  ```

### **Error: "Invalid flowchart data structure"**

- **Cause:** `flowchartData` tidak punya `version`, `nodes`, atau `connections`
- **Solution:** Pastikan struktur flowchart valid:
  ```json
  {
    "version": "1.0",
    "nodes": [],
    "connections": []
  }
  ```

### **Error: 403 Forbidden**

- **Cause:** User tidak punya permission (bukan ADMIN/SUPERVISOR/MANAGER)
- **Solution:** Login dengan user yang punya role SUPERVISOR atau lebih tinggi

---

## 📝 Notes

1. **Backward Compatibility:**

   - Legacy routes tetap tersedia di `/api/sop/legacy`, `/api/sop/:id/legacy`, dll
   - Old clients yang tidak support Mode Manual/Basic bisa tetap menggunakan legacy endpoints

2. **JSONB Performance:**

   - JSONB columns sudah punya GIN index untuk query performance
   - Prisma otomatis parse JSONB ke JavaScript object/array

3. **Auto-Versioning:**

   - Jika `tabularSteps` berubah signifikan, sistem otomatis create version baru
   - Version history tersimpan di table `sop_versions`

4. **Role Hierarchy:**
   - `ADMIN`: Full access
   - `SUPERVISOR`: Create, update, approve SOP
   - `MANAGER`: Create, update SOP (tapi tidak bisa approve sendiri)
   - `USER`: Read-only ACTIVE SOP

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0  
**Author:** openSOP Team
