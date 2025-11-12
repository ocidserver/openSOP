<template>
  <div class="user-list">
    <div class="page-header">
      <h1 class="page-title">Manajemen Pengguna</h1>
      <Button 
        label="Tambah User" 
        icon="pi pi-plus" 
        @click="openDialog"
        class="p-button-success"
      />
    </div>

    <Card>
      <template #content>
        <!-- Filters -->
        <div class="filter-section">
          <div class="grid">
            <div class="col-12 md:col-4">
              <div class="search-box">
                <i class="pi pi-search search-icon" />
                <InputText 
                  v-model="filters.search" 
                  placeholder="Cari pengguna..." 
                  class="search-input w-full"
                  @input="filterUsers"
                />
              </div>
            </div>
            <div class="col-12 md:col-3">
              <Dropdown 
                v-model="filters.role" 
                :options="roles" 
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih Role" 
                class="w-full"
                showClear
                @change="filterUsers"
              />
            </div>
            <div class="col-12 md:col-3">
              <Dropdown 
                v-model="filters.department" 
                :options="departments" 
                optionLabel="name"
                optionValue="id"
                placeholder="Pilih Departemen" 
                class="w-full"
                showClear
                @change="filterUsers"
              />
            </div>
          </div>
        </div>

        <!-- DataTable -->
        <DataTable 
          :value="filteredUsers" 
          :loading="loading"
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          responsiveLayout="scroll"
          stripedRows
          class="mt-4"
        >
          <Column field="name" header="Nama" :sortable="true">
            <template #body="slotProps">
              <div class="user-cell">
                <Avatar 
                  :label="getInitials(slotProps.data.name)" 
                  shape="circle" 
                  size="large"
                  class="mr-2"
                />
                <div>
                  <div class="user-name">{{ slotProps.data.name }}</div>
                  <div class="user-email">{{ slotProps.data.email }}</div>
                </div>
              </div>
            </template>
          </Column>
          <Column field="role" header="Role" :sortable="true">
            <template #body="slotProps">
              <Tag 
                :value="getRoleLabel(slotProps.data.role)" 
                :severity="getRoleSeverity(slotProps.data.role)"
              />
            </template>
          </Column>
          <Column field="department" header="Departemen" :sortable="true">
            <template #body="slotProps">
              {{ slotProps.data.department?.name || '-' }}
            </template>
          </Column>
          <Column field="status" header="Status" :sortable="true">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.isActive ? 'Aktif' : 'Non-aktif'" 
                :severity="slotProps.data.isActive ? 'success' : 'danger'"
              />
            </template>
          </Column>
          <Column field="lastLogin" header="Login Terakhir" :sortable="true">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.lastLogin) }}
            </template>
          </Column>
          <Column header="Aksi" :exportable="false">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button 
                  icon="pi pi-pencil" 
                  rounded
                  text
                  severity="info"
                  @click="editUser(slotProps.data)"
                  v-tooltip.top="'Edit'"
                />
                <Button 
                  icon="pi pi-trash" 
                  rounded
                  text
                  severity="danger"
                  @click="confirmDelete(slotProps.data)"
                  v-tooltip.top="'Hapus'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog Form -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="dialogMode === 'create' ? 'Tambah User Baru' : 'Edit User'"
      :modal="true"
      :style="{ width: '600px' }"
      :closable="true"
    >
      <div class="form-grid">
        <div class="field">
          <label for="name">Nama Lengkap *</label>
          <InputText 
            id="name"
            v-model="formData.name" 
            class="w-full"
            :class="{ 'p-invalid': submitted && !formData.name }"
          />
          <small class="p-error" v-if="submitted && !formData.name">Nama wajib diisi.</small>
        </div>

        <div class="field">
          <label for="email">Email *</label>
          <InputText 
            id="email"
            v-model="formData.email" 
            type="email"
            class="w-full"
            :class="{ 'p-invalid': submitted && !formData.email }"
          />
          <small class="p-error" v-if="submitted && !formData.email">Email wajib diisi.</small>
        </div>

        <div class="field">
          <label for="role">Role *</label>
          <Dropdown 
            id="role"
            v-model="formData.role" 
            :options="roles" 
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Role" 
            class="w-full"
            :class="{ 'p-invalid': submitted && !formData.role }"
          />
          <small class="p-error" v-if="submitted && !formData.role">Role wajib dipilih.</small>
          <small class="form-help">
            <strong>Admin:</strong> Mengelola semua (user, departemen)<br>
            <strong>Supervisor:</strong> Mengapprove SOP<br>
            <strong>User:</strong> Menambahkan, mengedit, mengajukan SOP<br>
            <strong>Guest:</strong> Hanya dapat melihat SOP
          </small>
        </div>

        <div class="field">
          <label for="department">Departemen *</label>
          <Dropdown 
            id="department"
            v-model="formData.departmentId" 
            :options="departments" 
            optionLabel="name"
            optionValue="id"
            placeholder="Pilih Departemen" 
            class="w-full"
            :class="{ 'p-invalid': submitted && !formData.departmentId }"
          />
          <small class="p-error" v-if="submitted && !formData.departmentId">Departemen wajib dipilih.</small>
        </div>

        <div class="field" v-if="dialogMode === 'create'">
          <label for="password">Password *</label>
          <Password 
            id="password"
            v-model="formData.password" 
            toggleMask
            class="w-full"
            :class="{ 'p-invalid': submitted && !formData.password }"
            :feedback="false"
          />
          <small class="p-error" v-if="submitted && !formData.password">Password wajib diisi.</small>
        </div>

        <div class="field">
          <div class="flex align-items-center">
            <Checkbox 
              id="isActive" 
              v-model="formData.isActive" 
              :binary="true" 
            />
            <label for="isActive" class="ml-2">Akun Aktif</label>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="closeDialog" />
        <Button label="Simpan" icon="pi pi-check" @click="saveUser" :loading="saving" />
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <Dialog 
      v-model:visible="deleteDialogVisible" 
      header="Konfirmasi Hapus"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500);" />
        <span v-if="selectedUser">
          Apakah Anda yakin ingin menghapus user <strong>{{ selectedUser.name }}</strong>?
        </span>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="deleteDialogVisible = false" />
        <Button label="Hapus" icon="pi pi-trash" severity="danger" @click="deleteUser" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogMode = ref('create')
const submitted = ref(false)
const selectedUser = ref(null)

const filters = ref({
  search: '',
  role: null,
  department: null
})

const users = ref([
  {
    id: 1,
    name: 'Admin BPS',
    email: 'admin@bps.go.id',
    role: 'ADMIN',
    department: { id: 1, name: 'IT' },
    isActive: true,
    lastLogin: new Date('2025-11-11T10:30:00')
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@bps.go.id',
    role: 'SUPERVISOR',
    department: { id: 2, name: 'Statistik Sosial' },
    isActive: true,
    lastLogin: new Date('2025-11-10T15:20:00')
  },
  {
    id: 3,
    name: 'Jane Smith',
    email: 'jane@bps.go.id',
    role: 'USER',
    department: { id: 3, name: 'Statistik Produksi' },
    isActive: true,
    lastLogin: new Date('2025-11-09T09:15:00')
  },
  {
    id: 4,
    name: 'Guest User',
    email: 'guest@bps.go.id',
    role: 'GUEST',
    department: { id: 1, name: 'IT' },
    isActive: true,
    lastLogin: new Date('2025-11-08T14:00:00')
  }
])

const departments = ref([
  { id: 1, name: 'IT' },
  { id: 2, name: 'Statistik Sosial' },
  { id: 3, name: 'Statistik Produksi' },
  { id: 4, name: 'Statistik Distribusi' },
  { id: 5, name: 'Neraca Wilayah dan Analisis' }
])

const roles = ref([
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'USER', label: 'User' },
  { value: 'GUEST', label: 'Guest' }
])

const formData = ref({
  name: '',
  email: '',
  role: null,
  departmentId: null,
  password: '',
  isActive: true
})

const filteredUsers = computed(() => {
  let result = users.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(u => 
      u.name.toLowerCase().includes(search) || 
      u.email.toLowerCase().includes(search)
    )
  }

  if (filters.value.role) {
    result = result.filter(u => u.role === filters.value.role)
  }

  if (filters.value.department) {
    result = result.filter(u => u.department?.id === filters.value.department)
  }

  return result
})

const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getRoleLabel = (role) => {
  const roleMap = {
    'ADMIN': 'Admin',
    'SUPERVISOR': 'Supervisor',
    'USER': 'User',
    'GUEST': 'Guest'
  }
  return roleMap[role] || role
}

const getRoleSeverity = (role) => {
  const severityMap = {
    'ADMIN': 'danger',
    'SUPERVISOR': 'warning',
    'USER': 'info',
    'GUEST': 'secondary'
  }
  return severityMap[role] || 'info'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const filterUsers = () => {
  // Filtering is reactive via computed property
}

const openDialog = () => {
  dialogMode.value = 'create'
  formData.value = {
    name: '',
    email: '',
    role: null,
    departmentId: null,
    password: '',
    isActive: true
  }
  submitted.value = false
  dialogVisible.value = true
}

const editUser = (user) => {
  dialogMode.value = 'edit'
  formData.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.department?.id,
    isActive: user.isActive
  }
  submitted.value = false
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  submitted.value = false
}

const saveUser = () => {
  submitted.value = true

  if (!formData.value.name || !formData.value.email || !formData.value.role || !formData.value.departmentId) {
    return
  }

  if (dialogMode.value === 'create' && !formData.value.password) {
    return
  }

  saving.value = true

  setTimeout(() => {
    if (dialogMode.value === 'create') {
      const department = departments.value.find(d => d.id === formData.value.departmentId)
      users.value.push({
        id: users.value.length + 1,
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
        department: department,
        isActive: formData.value.isActive,
        lastLogin: null
      })
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'User berhasil ditambahkan', life: 3000 })
    } else {
      const index = users.value.findIndex(u => u.id === formData.value.id)
      if (index !== -1) {
        const department = departments.value.find(d => d.id === formData.value.departmentId)
        users.value[index] = {
          ...users.value[index],
          name: formData.value.name,
          email: formData.value.email,
          role: formData.value.role,
          department: department,
          isActive: formData.value.isActive
        }
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'User berhasil diupdate', life: 3000 })
      }
    }

    saving.value = false
    closeDialog()
  }, 1000)
}

const confirmDelete = (user) => {
  selectedUser.value = user
  deleteDialogVisible.value = true
}

const deleteUser = () => {
  deleting.value = true

  setTimeout(() => {
    users.value = users.value.filter(u => u.id !== selectedUser.value.id)
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'User berhasil dihapus', life: 3000 })
    deleting.value = false
    deleteDialogVisible.value = false
    selectedUser.value = null
  }, 1000)
}

onMounted(() => {
  // Load data
})
</script>

<style scoped>
.user-list {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.filter-section {
  margin-bottom: 1.5rem;
  background-color: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.875rem;
  z-index: 1;
  pointer-events: none;
}

.search-input {
  padding-left: 2.5rem !important;
  padding-right: 1rem;
  height: 42px;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-input:hover {
  border-color: #adb5bd;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.user-cell {
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
}

.user-email {
  font-size: 0.875rem;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
}

.form-help {
  color: #6c757d;
  font-size: 0.813rem;
  line-height: 1.5;
  margin-top: 0.25rem;
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
