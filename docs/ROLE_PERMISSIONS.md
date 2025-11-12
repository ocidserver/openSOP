# Role & Permissions Matrix

## Overview

SOP Management System menggunakan 4 tingkat role dengan permission yang berbeda untuk setiap role.

## Roles

### 1. ADMIN (Administrator)

**Full Access** - Mengelola seluruh sistem

**Permissions:**

- ✅ Mengelola User (CRUD)
- ✅ Mengelola Departemen (CRUD)
- ✅ Mengelola Kategori (CRUD)
- ✅ Membuat SOP baru
- ✅ Mengedit SOP
- ✅ Mengajukan SOP untuk review
- ✅ Meng-approve/reject SOP
- ✅ Melihat semua SOP
- ✅ Mengakses Laporan
- ✅ Mengubah Profil sendiri

**Menu Access:**

- Dashboard
- SOP
- Kategori
- Departemen
- Pengguna
- Laporan
- Profil

---

### 2. SUPERVISOR

**Approval Access** - Meng-approve SOP dan melihat laporan

**Permissions:**

- ❌ Mengelola User
- ❌ Mengelola Departemen
- ✅ Melihat Kategori
- ❌ Membuat SOP baru
- ❌ Mengedit SOP
- ❌ Mengajukan SOP
- ✅ Meng-approve/reject SOP (Core Function)
- ✅ Melihat semua SOP
- ✅ Mengakses Laporan
- ✅ Mengubah Profil sendiri

**Menu Access:**

- Dashboard
- SOP
- Kategori (read-only)
- Laporan
- Profil

---

### 3. USER

**Content Creator** - Menambahkan, mengedit, dan mengajukan SOP

**Permissions:**

- ❌ Mengelola User
- ❌ Mengelola Departemen
- ❌ Mengelola Kategori
- ✅ Membuat SOP baru (Core Function)
- ✅ Mengedit SOP milik sendiri (Core Function)
- ✅ Mengajukan SOP untuk review (Core Function)
- ❌ Meng-approve/reject SOP
- ✅ Melihat semua SOP
- ❌ Mengakses Laporan
- ✅ Mengubah Profil sendiri

**Menu Access:**

- Dashboard
- SOP
- Profil

---

### 4. GUEST

**Read-Only Access** - Hanya dapat melihat SOP yang sudah approved

**Permissions:**

- ❌ Mengelola User
- ❌ Mengelola Departemen
- ❌ Mengelola Kategori
- ❌ Membuat SOP baru
- ❌ Mengedit SOP
- ❌ Mengajukan SOP
- ❌ Meng-approve/reject SOP
- ✅ Melihat SOP (hanya yang ACTIVE) (Core Function)
- ❌ Mengakses Laporan
- ✅ Mengubah Profil sendiri

**Menu Access:**

- Dashboard (limited view)
- SOP (read-only, hanya ACTIVE)
- Profil

---

## Permission Matrix

| Feature                   | ADMIN | SUPERVISOR | USER | GUEST            |
| ------------------------- | ----- | ---------- | ---- | ---------------- |
| **User Management**       |
| View Users                | ✅    | ❌         | ❌   | ❌               |
| Create User               | ✅    | ❌         | ❌   | ❌               |
| Edit User                 | ✅    | ❌         | ❌   | ❌               |
| Delete User               | ✅    | ❌         | ❌   | ❌               |
| **Department Management** |
| View Departments          | ✅    | ❌         | ❌   | ❌               |
| Create Department         | ✅    | ❌         | ❌   | ❌               |
| Edit Department           | ✅    | ❌         | ❌   | ❌               |
| Delete Department         | ✅    | ❌         | ❌   | ❌               |
| **Category Management**   |
| View Categories           | ✅    | ✅         | ❌   | ❌               |
| Create Category           | ✅    | ❌         | ❌   | ❌               |
| Edit Category             | ✅    | ❌         | ❌   | ❌               |
| Delete Category           | ✅    | ❌         | ❌   | ❌               |
| **SOP Management**        |
| View All SOPs             | ✅    | ✅         | ✅   | ✅ (Active only) |
| Create SOP                | ✅    | ❌         | ✅   | ❌               |
| Edit Own SOP              | ✅    | ❌         | ✅   | ❌               |
| Edit Any SOP              | ✅    | ❌         | ❌   | ❌               |
| Submit for Review         | ✅    | ❌         | ✅   | ❌               |
| Approve SOP               | ✅    | ✅         | ❌   | ❌               |
| Reject SOP                | ✅    | ✅         | ❌   | ❌               |
| Archive SOP               | ✅    | ❌         | ❌   | ❌               |
| **Reports**               |
| View Reports              | ✅    | ✅         | ❌   | ❌               |
| Generate Reports          | ✅    | ✅         | ❌   | ❌               |
| **Profile**               |
| Edit Own Profile          | ✅    | ✅         | ✅   | ✅               |
| Change Password           | ✅    | ✅         | ✅   | ✅               |

---

## Implementation Notes

### Frontend Implementation

Lokasi: `frontend/src/layouts/SidebarLayout.vue`

```javascript
const menuItems = computed(() => {
  const userRole = authStore.user?.role || "GUEST";

  return [
    // Menu items dengan visibility filter berdasarkan role
  ].filter((item) => item.visible);
});
```

### Component Guards

Setiap halaman sensitive menggunakan computed permissions:

```javascript
const canCreateSOP = computed(() =>
  ["ADMIN", "USER"].includes(authStore.user?.role)
);
```

### Backend Implementation

Lokasi: `backend/src/middleware/auth.js`

Middleware untuk role-based access control:

```javascript
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
```

---

## Default Users

### Admin

- Email: `admin@bps.go.id`
- Password: `admin123`
- Role: ADMIN

### Supervisor (for testing)

- Email: `supervisor@bps.go.id`
- Password: `supervisor123`
- Role: SUPERVISOR

### User (for testing)

- Email: `user@bps.go.id`
- Password: `user123`
- Role: USER

### Guest (for testing)

- Email: `guest@bps.go.id`
- Password: `guest123`
- Role: GUEST

---

## Role Hierarchy

```
ADMIN (Level 4)
  ↓ Full Control
  ├─ User Management
  ├─ Department Management
  ├─ Category Management
  └─ All SOP Operations

SUPERVISOR (Level 3)
  ↓ Approval Control
  ├─ Approve/Reject SOPs
  ├─ View Reports
  └─ Read Categories

USER (Level 2)
  ↓ Content Creation
  ├─ Create SOPs
  ├─ Edit Own SOPs
  └─ Submit for Review

GUEST (Level 1)
  ↓ Read-Only
  └─ View Active SOPs Only
```

---

## Security Considerations

1. **Authentication Required**: Semua endpoint kecuali login memerlukan JWT token
2. **Role Verification**: Backend memverifikasi role di setiap request
3. **Owner Check**: USER hanya bisa edit SOP milik sendiri
4. **Status Filter**: GUEST hanya melihat SOP dengan status ACTIVE
5. **Frontend Guard**: Menu dan button di-hide berdasarkan role (UI security)
6. **Backend Guard**: Endpoint di-protect dengan middleware role (Real security)

---

## Change Log

| Date       | Version | Changes                             |
| ---------- | ------- | ----------------------------------- |
| 2025-11-11 | 1.0     | Initial role & permission structure |
