# 🔧 Troubleshooting: Menu "Buat SOP Baru" Tidak Responsif

## 🔍 Diagnosa Masalah

Ketika klik tombol "Buat SOP Baru" tidak ada respons, kemungkinan penyebabnya adalah:

### ✅ **Penyebab Paling Umum: Permission/Role Issue**

Route `/sop/create` **memerlukan role khusus**:

- ✅ **ADMIN**
- ✅ **SUPERVISOR**
- ✅ **MANAGER**

Jika user yang login memiliki role **USER** atau role lain, router akan **memblokir akses** dan tidak ada navigasi yang terjadi.

---

## 🔎 Cara Mengecek di Browser

### **1. Buka Browser Developer Tools**

- Tekan **F12** atau **Ctrl+Shift+I**
- Pilih tab **Console**

### **2. Lihat Console Log**

Saat klik "Buat SOP Baru", perhatikan console log:

**✅ Jika berhasil:**

```
🔍 Router Guard: { to: '/sop/create', isAuthenticated: true, user: {...}, requiresAuth: true }
✅ Proceeding to route
```

**❌ Jika permission ditolak:**

```
🔍 Router Guard: { to: '/sop/create', isAuthenticated: true, user: { role: 'USER' }, requiresAuth: true }
❌ No permission, redirecting to dashboard
```

**❌ Jika belum login:**

```
🔍 Router Guard: { to: '/sop/create', isAuthenticated: false, ... }
❌ Not authenticated, redirecting to login
```

---

## 🛠️ Solusi Berdasarkan Masalah

### **Masalah 1: User Role Tidak Sesuai**

**Gejala:**

- Klik "Buat SOP Baru" tidak ada respons
- Console log: `❌ No permission, redirecting to dashboard`
- User memiliki role **USER**

**Solusi:**

#### **Option A: Ubah Role User di Database**

1. **Buka database PostgreSQL**
2. **Jalankan query:**

   ```sql
   -- Cek role user saat ini
   SELECT id, full_name, email, role FROM users;

   -- Update role user menjadi SUPERVISOR (atau MANAGER/ADMIN)
   UPDATE users
   SET role = 'SUPERVISOR'
   WHERE email = 'user@example.com';
   ```

3. **Logout dan login kembali**

#### **Option B: Ubah Route Permission (Untuk Development)**

**File:** `frontend/src/router/index.js`

**Temukan:**

```javascript
{
  path: 'sop/create',
  name: 'SOPCreate',
  component: () => import('@/views/SOP/SOPCreate.vue'),
  meta: {
    title: 'Buat SOP Baru',
    roles: ['ADMIN', 'SUPERVISOR', 'MANAGER']  // ← Hanya 3 role ini
  }
}
```

**Ubah menjadi (DEVELOPMENT ONLY):**

```javascript
{
  path: 'sop/create',
  name: 'SOPCreate',
  component: () => import('@/views/SOP/SOPCreate.vue'),
  meta: {
    title: 'Buat SOP Baru',
    roles: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'USER']  // ← Tambah USER
  }
}
```

⚠️ **WARNING:** Ini hanya untuk development/testing. Di production, USER biasa tidak boleh create SOP!

---

### **Masalah 2: Backend/Frontend Tidak Running**

**Gejala:**

- Halaman blank atau loading terus
- Network error di console
- API tidak merespons

**Solusi:**

#### **Cek Server Status:**

**Backend:**

```powershell
# Cek apakah port 3000 digunakan
Get-NetTCPConnection -LocalPort 3000

# Jika tidak ada output, backend belum running
# Start backend:
cd C:\Users\IPDS-OCID\openSOP\backend
npm run dev
```

**Frontend:**

```powershell
# Cek apakah port 5173 digunakan
Get-NetTCPConnection -LocalPort 5173

# Jika tidak ada output, frontend belum running
# Start frontend:
cd C:\Users\IPDS-OCID\openSOP\frontend
npm run dev
```

**Akses di browser:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

---

### **Masalah 3: Component Error saat Load**

**Gejala:**

- Route berubah tapi halaman blank
- Error di console tentang missing component

**Solusi:**

#### **Cek Console Errors:**

Perhatikan error seperti:

- `Failed to resolve component: StepTabularEditor`
- `Cannot read property of undefined`
- `Module not found: @/stores/sopManual`

#### **Restart Dev Server:**

```powershell
# Kill semua Node process
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Restart frontend
cd C:\Users\IPDS-OCID\openSOP\frontend
npm run dev
```

#### **Clear Cache:**

- Tekan **Ctrl+Shift+R** (hard refresh)
- Atau buka **DevTools → Network → Disable cache**

---

### **Masalah 4: TypeScript Errors (Development)**

**Gejala:**

- VSCode menunjukkan red squiggles
- Console warning tentang type errors

**Ini TIDAK memblokir runtime**, tapi bisa diperbaiki:

**File:** Buat `frontend/src/services/sopService.d.ts`

```typescript
// Type declaration for sopService
declare module "@/services/sopService" {
  const sopService: any;
  export default sopService;
}
```

---

## ✅ Checklist Debugging

Ikuti langkah-langkah ini secara berurutan:

### **Step 1: Cek Authentication**

```javascript
// Di browser console, jalankan:
JSON.parse(localStorage.getItem("auth"));

// Output yang diharapkan:
// {
//   "user": {
//     "id": "...",
//     "email": "...",
//     "fullName": "...",
//     "role": "SUPERVISOR"  // ← Harus ADMIN/SUPERVISOR/MANAGER
//   },
//   "token": "...",
//   "isAuthenticated": true
// }
```

### **Step 2: Cek Server Status**

```powershell
# Backend running?
curl http://localhost:3000/api

# Frontend running?
curl http://localhost:5173
```

### **Step 3: Cek Router Guard Log**

- Buka Console (F12)
- Klik "Buat SOP Baru"
- Lihat log: `🔍 Router Guard:...`

### **Step 4: Cek Network Tab**

- Buka DevTools → Network tab
- Klik "Buat SOP Baru"
- Lihat apakah ada request API yang error

### **Step 5: Cek Component Load**

- Di console, setelah navigasi ke `/sop/create`
- Jalankan: `document.querySelector('.sop-create')`
- Jika return `null`, component tidak di-render

---

## 🚀 Quick Fix Script

Jalankan script ini untuk restart semua service dan test:

```powershell
# Kill all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\IPDS-OCID\openSOP\backend; npm run dev"

# Wait 3 seconds for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\IPDS-OCID\openSOP\frontend; npm run dev"

# Wait 3 seconds for frontend to start
Start-Sleep -Seconds 3

# Open browser
Start-Process "http://localhost:5173"
```

---

## 📞 Support

Jika masalah masih berlanjut setelah semua troubleshooting di atas:

1. **Screenshot console errors**
2. **Copy-paste log dari terminal**
3. **Info role user yang digunakan**
4. **Screenshot halaman yang error**

Dan hubungi tim development.

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0
