# UI Components - SOP Management System

## Status Implementasi UI

### ✅ Sudah Ada (Perlu Import Components):

1. **Login Page** - `/login` (frontend/src/views/Auth/Login.vue)
2. **Dashboard** - `/` (frontend/src/views/Dashboard.vue)
3. **Default Layout** - (frontend/src/layouts/DefaultLayout.vue)

### 🔄 Perlu Perbaikan (Tambah Imports):

4. **SOP List** - `/sop` (frontend/src/views/SOP/SOPList.vue)
5. **SOP Detail** - `/sop/:id` (frontend/src/views/SOP/SOPDetail.vue)
6. **SOP Create** - `/sop/create` (frontend/src/views/SOP/SOPCreate.vue)
7. **SOP Edit** - `/sop/:id/edit` (frontend/src/views/SOP/SOPEdit.vue)

### 📝 Sudah Ada (Perlu Implementasi Penuh):

8. **User List** - `/users` (frontend/src/views/Users/UserList.vue)
9. **Category List** - `/categories` (frontend/src/views/Categories/CategoryList.vue)
10. **Department List** - `/departments` (frontend/src/views/Departments/DepartmentList.vue)
11. **Report List** - `/reports` (frontend/src/views/Reports/ReportList.vue)
12. **User Profile** - `/profile` (frontend/src/views/Profile/UserProfile.vue)
13. **Not Found** - `/*` (frontend/src/views/NotFound.vue)

## Solusi: Import Components di Setiap File

Karena kita tidak lagi menggunakan global component registration, setiap file Vue harus import components yang digunakan.

### Components yang Sering Dipakai:

```javascript
import Button from "primevue/button";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import Menubar from "primevue/menubar";
import Menu from "primevue/menu";
import Badge from "primevue/badge";
import Tag from "primevue/tag";
import Message from "primevue/message";
import Divider from "primevue/divider";
import Password from "primevue/password";
import Textarea from "primevue/textarea";
import FileUpload from "primevue/fileupload";
```

## Langkah Perbaikan:

1. **Tambahkan imports di DefaultLayout.vue**
2. **Tambahkan imports di Dashboard.vue**
3. **Tambahkan imports di semua views yang menggunakan PrimeVue components**

## File Yang Harus Diperbaiki Sekarang:

### 1. DefaultLayout.vue

Tambahkan di <script setup>:

```javascript
import Menubar from "primevue/menubar";
import Menu from "primevue/menu";
import Button from "primevue/button";
import Badge from "primevue/badge";
```

### 2. Dashboard.vue

Tambahkan:

```javascript
import Card from "primevue/card";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
```

### 3. SOPList.vue

Tambahkan:

```javascript
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
```

### 4. UserList.vue

Tambahkan:

```javascript
import Card from "primevue/card";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
```

## Testing:

Setelah semua imports ditambahkan, test:

1. Login page
2. Navigate ke Dashboard
3. Navigate ke SOP List
4. Navigate ke Users
5. Check semua routes

## Notes:

- PrimeVue v4 tidak otomatis register components
- Setiap component harus di-import eksplisit di file yang menggunakannya
- Ini adalah best practice untuk tree-shaking dan bundle size optimization
