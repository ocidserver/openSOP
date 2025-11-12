# Sistem Approval SOP - Update

## 🔄 Perubahan Sistem Approval

Sistem approval telah diperbarui untuk terintegrasi langsung dengan menu Daftar SOP. Approval tidak lagi menjadi menu terpisah.

---

## 📋 Cara Kerja Baru

### 1. **Untuk Pembuat SOP (USER)**

- Buat SOP baru
- SOP otomatis berstatus **DRAFT**
- Setelah selesai, ubah status menjadi **REVIEW**
- SOP akan masuk ke antrian review Supervisor

### 2. **Untuk Supervisor (ADMIN, SUPERVISOR, PIMPINAN)**

- Buka menu **Daftar SOP**
- Pada SOP yang berstatus **REVIEW**, akan muncul tombol **Review** (icon check-square)
- Klik tombol **Review** untuk membuka detail SOP

### 3. **Proses Review**

Di halaman detail SOP (mode review), Supervisor akan melihat:

- **Tombol Approve** (hijau, icon check) - untuk menyetujui SOP
- **Tombol Reject** (merah, icon times) - untuk menolak SOP

#### Approve SOP:

1. Klik tombol **Approve**
2. Dialog konfirmasi muncul
3. Opsional: Tambahkan catatan
4. Konfirmasi approval
5. Status SOP berubah menjadi **ACTIVE**
6. Otomatis redirect ke Daftar SOP

#### Reject SOP:

1. Klik tombol **Reject**
2. Dialog konfirmasi muncul
3. **Wajib**: Isi alasan penolakan
4. Konfirmasi rejection
5. Status SOP kembali ke **DRAFT**
6. SOP dikembalikan ke pembuat untuk revisi
7. Otomatis redirect ke Daftar SOP

---

## 🎯 Fitur Utama

### SOPList.vue - Daftar SOP

✅ **Tombol Review** muncul untuk Supervisor pada SOP berstatus REVIEW
✅ **Role-based Actions**:

- View: Semua user
- Review: Supervisor (jika status REVIEW)
- Edit: Admin & Supervisor
- Delete: Admin only

### SOPDetail.vue - Detail SOP

✅ **Mode Review** (query param: `?mode=review`)
✅ **Action Bar Dinamis**:

- Normal mode: Unduh PDF, Edit
- Review mode: Reject, Approve

✅ **Approve Dialog**:

- Icon check circle (hijau)
- Info SOP
- Catatan opsional
- Loading state
- Toast notification

✅ **Reject Dialog**:

- Icon times circle (merah)
- Info SOP
- Alasan penolakan (WAJIB)
- Validasi form
- Loading state
- Toast notification

---

## 🔐 Role & Permissions

### Roles yang dapat Approve/Reject:

- **ADMIN** - Full access
- **SUPERVISOR** - Approve/Reject
- **PIMPINAN_TINGGI_UTAMA** - Approve/Reject
- **PIMPINAN_TINGGI_MADYA** - Approve/Reject
- **PIMPINAN_TINGGI_PRATAMA** - Approve/Reject

### Roles yang dapat Edit:

- **ADMIN** - Full edit
- **SUPERVISOR** - Full edit
- **PIMPINAN*TINGGI*\*** - Full edit

### Roles yang dapat Delete:

- **ADMIN** only

---

## 🛣️ Navigation Flow

```
Daftar SOP
    │
    ├─→ SOP (Status: DRAFT) → [View] [Edit] [Delete]
    │
    ├─→ SOP (Status: REVIEW) → [View] [Review] [Edit] [Delete]
    │                              │
    │                              └─→ Detail SOP (mode=review)
    │                                      │
    │                                      ├─→ [Approve] → Dialog → Confirm → Status: ACTIVE → Redirect
    │                                      │
    │                                      └─→ [Reject] → Dialog → Input Reason → Confirm → Status: DRAFT → Redirect
    │
    └─→ SOP (Status: ACTIVE) → [View] [Edit] [Delete]
```

---

## 💻 Technical Implementation

### 1. AppMenu.vue

**Perubahan:**

- ❌ Removed: "Approval SOP" menu item
- Menu approval tidak lagi standalone

### 2. SOPList.vue

**Perubahan:**

```vue
<!-- Added Review Button -->
<Button
  v-if="isSupervisor && slotProps.data.status === 'REVIEW'"
  icon="pi pi-check-square"
  class="p-button-rounded p-button-text p-button-success"
  v-tooltip.top="'Review SOP'"
  @click="reviewSOP(slotProps.data.id)"
/>

<!-- Role-based permissions -->
const isSupervisor = computed(() => [...]) const canEdit = computed(() => [...])
const canDelete = computed(() => [...])

<!-- Navigate with query param -->
const reviewSOP = (id) => { router.push({ path: `/sop/${id}`, query: { mode:
'review' } }) }
```

### 3. SOPDetail.vue

**Perubahan:**

```vue
<!-- Check review mode -->
const isReviewMode = computed(() => { return route.query.mode === 'review' })

<!-- Dynamic Action Bar -->
<template v-if="isReviewMode && canApprove">
  <Button label="Reject" @click="showRejectDialog" severity="danger" />
  <Button label="Approve" @click="showApproveDialog" severity="success" />
</template>

<!-- State Management -->
const approveDialog = ref(false) const rejectDialog = ref(false) const
approvalNotes = ref('') const rejectionNotes = ref('') const approving =
ref(false) const rejecting = ref(false)

<!-- Approve Function -->
const confirmApprove = async () => { // API call // Update status to ACTIVE //
Toast notification // Redirect to /sop }

<!-- Reject Function -->
const confirmReject = async () => { // Validate rejection notes (required) //
API call // Update status to DRAFT // Toast notification // Redirect to /sop }
```

---

## 📱 UI/UX Design

### Tombol Review (SOPList)

- **Icon**: `pi-check-square`
- **Color**: Success (hijau)
- **Style**: Rounded text button
- **Tooltip**: "Review SOP"
- **Condition**: Hanya muncul jika user = Supervisor DAN status = REVIEW

### Dialog Approve

- **Header**: "Approve SOP"
- **Icon**: Check circle (hijau, 3rem)
- **Content**:
  - Konfirmasi text
  - Info SOP (kode + judul)
  - Textarea catatan (opsional)
- **Actions**:
  - Batal (text button)
  - Approve SOP (success button with loading)

### Dialog Reject

- **Header**: "Reject SOP"
- **Icon**: Times circle (merah, 3rem)
- **Content**:
  - Konfirmasi text
  - Info SOP (kode + judul)
  - Textarea alasan (REQUIRED with validation)
  - Error message jika kosong
- **Actions**:
  - Batal (text button)
  - Reject SOP (danger button with loading)

---

## 🔄 Status Flow

```
DRAFT
  ↓ (User submit for review)
REVIEW
  ↓
  ├─→ [Approve] → ACTIVE
  └─→ [Reject] → DRAFT (with rejection notes)
```

---

## 🧪 Testing Checklist

### SOPList.vue

- [ ] Tombol Review muncul untuk Supervisor pada SOP REVIEW
- [ ] Tombol Review tidak muncul untuk USER
- [ ] Tombol Review tidak muncul pada SOP non-REVIEW
- [ ] Klik Review navigate dengan query param `mode=review`
- [ ] Tombol Edit hanya muncul untuk role yang berhak
- [ ] Tombol Delete hanya muncul untuk Admin

### SOPDetail.vue - Review Mode

- [ ] Action bar berubah saat mode=review
- [ ] Tombol Approve dan Reject muncul untuk Supervisor
- [ ] Klik Approve buka dialog approve
- [ ] Klik Reject buka dialog reject

### Approve Flow

- [ ] Dialog approve tampil dengan benar
- [ ] Catatan opsional dapat diisi
- [ ] Loading state saat proses approve
- [ ] Toast notification muncul setelah approve
- [ ] Status berubah menjadi ACTIVE
- [ ] Redirect ke /sop setelah approve

### Reject Flow

- [ ] Dialog reject tampil dengan benar
- [ ] Validasi alasan penolakan (required)
- [ ] Error message muncul jika alasan kosong
- [ ] Loading state saat proses reject
- [ ] Toast notification muncul setelah reject
- [ ] Status kembali ke DRAFT
- [ ] Redirect ke /sop setelah reject

---

## 🚀 Next Steps (Backend)

1. **API Endpoints**:

   ```
   POST /api/sop/:id/approve
   POST /api/sop/:id/reject
   ```

2. **Request Body**:

   ```javascript
   // Approve
   {
     notes: String (optional),
     approvedBy: userId,
     approvedAt: timestamp
   }

   // Reject
   {
     reason: String (required),
     rejectedBy: userId,
     rejectedAt: timestamp
   }
   ```

3. **Database Changes**:

   - Add `approvedBy` field
   - Add `approvedAt` field
   - Add `rejectedBy` field
   - Add `rejectedAt` field
   - Add `approvalNotes` field
   - Add `rejectionReason` field

4. **Notifications**:

   - Email notification ke pembuat saat approved
   - Email notification ke pembuat saat rejected (with reason)
   - In-app notification

5. **Audit Log**:
   - Log setiap approval action
   - Log setiap rejection action
   - Track approval history

---

**Version**: 2.0.0  
**Last Updated**: November 11, 2025  
**Status**: ✅ Implemented (Frontend)
