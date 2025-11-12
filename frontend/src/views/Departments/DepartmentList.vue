<template>
  <div class="department-list">
    <div class="page-header">
      <h1 class="page-title">Manajemen Departemen</h1>
      <Button 
        label="Tambah Departemen" 
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
            <div class="col-12 md:col-6">
              <div class="search-box">
                <i class="pi pi-search search-icon" />
                <InputText 
                  v-model="searchQuery" 
                  placeholder="Cari departemen..." 
                  class="search-input w-full"
                  @input="filterDepartments"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- DataTable -->
        <DataTable 
          :value="filteredDepartments" 
          :loading="loading"
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          responsiveLayout="scroll"
          stripedRows
          class="mt-4"
        >
          <Column field="name" header="Nama Departemen" :sortable="true"></Column>
          <Column field="code" header="Kode" :sortable="true"></Column>
          <Column field="description" header="Deskripsi"></Column>
          <Column field="memberCount" header="Jumlah Anggota" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.memberCount + ' orang'" severity="info" />
            </template>
          </Column>
          <Column field="createdAt" header="Dibuat" :sortable="true">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.createdAt) }}
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
                  @click="editDepartment(slotProps.data)"
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
      :header="dialogMode === 'create' ? 'Tambah Departemen Baru' : 'Edit Departemen'"
      :modal="true"
      :style="{ width: '500px' }"
      :closable="true"
    >
      <div class="form-grid">
        <div class="field">
          <label for="name">Nama Departemen *</label>
          <InputText 
            id="name"
            v-model="formData.name" 
            class="w-full"
            :class="{ 'p-invalid': submitted && !formData.name }"
          />
          <small class="p-error" v-if="submitted && !formData.name">Nama departemen wajib diisi.</small>
        </div>

        <div class="field">
          <label for="code">Kode *</label>
          <InputText 
            id="code"
            v-model="formData.code" 
            class="w-full"
            :class="{ 'p-invalid': submitted && !formData.code }"
          />
          <small class="p-error" v-if="submitted && !formData.code">Kode wajib diisi.</small>
        </div>

        <div class="field">
          <label for="description">Deskripsi</label>
          <Textarea 
            id="description"
            v-model="formData.description" 
            rows="4"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="closeDialog" />
        <Button label="Simpan" icon="pi pi-check" @click="saveDepartment" :loading="saving" />
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
        <span v-if="selectedDepartment">
          Apakah Anda yakin ingin menghapus departemen <strong>{{ selectedDepartment.name }}</strong>?
        </span>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="deleteDialogVisible = false" />
        <Button label="Hapus" icon="pi pi-trash" severity="danger" @click="deleteDepartment" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'

const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogMode = ref('create')
const submitted = ref(false)
const selectedDepartment = ref(null)
const searchQuery = ref('')

const departments = ref([
  {
    id: 1,
    name: 'IT',
    code: 'IT',
    description: 'Information Technology',
    memberCount: 5,
    createdAt: new Date('2025-01-15')
  },
  {
    id: 2,
    name: 'Statistik Sosial',
    code: 'STAT-SOC',
    description: 'Departemen Statistik Sosial dan Kependudukan',
    memberCount: 12,
    createdAt: new Date('2025-02-10')
  },
  {
    id: 3,
    name: 'Statistik Produksi',
    code: 'STAT-PROD',
    description: 'Departemen Statistik Produksi',
    memberCount: 8,
    createdAt: new Date('2025-03-05')
  },
  {
    id: 4,
    name: 'Statistik Distribusi',
    code: 'STAT-DIST',
    description: 'Departemen Statistik Distribusi dan Perdagangan',
    memberCount: 10,
    createdAt: new Date('2025-03-20')
  },
  {
    id: 5,
    name: 'Neraca Wilayah dan Analisis',
    code: 'NWA',
    description: 'Departemen Neraca Wilayah dan Analisis Statistik',
    memberCount: 7,
    createdAt: new Date('2025-04-01')
  }
])

const formData = ref({
  name: '',
  code: '',
  description: ''
})

const filteredDepartments = computed(() => {
  if (!searchQuery.value) {
    return departments.value
  }

  const search = searchQuery.value.toLowerCase()
  return departments.value.filter(d => 
    d.name.toLowerCase().includes(search) || 
    d.code.toLowerCase().includes(search) ||
    (d.description && d.description.toLowerCase().includes(search))
  )
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const filterDepartments = () => {
  // Filtering is reactive via computed property
}

const openDialog = () => {
  dialogMode.value = 'create'
  formData.value = {
    name: '',
    code: '',
    description: ''
  }
  submitted.value = false
  dialogVisible.value = true
}

const editDepartment = (department) => {
  dialogMode.value = 'edit'
  formData.value = {
    id: department.id,
    name: department.name,
    code: department.code,
    description: department.description
  }
  submitted.value = false
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  submitted.value = false
}

const saveDepartment = () => {
  submitted.value = true

  if (!formData.value.name || !formData.value.code) {
    return
  }

  saving.value = true

  setTimeout(() => {
    if (dialogMode.value === 'create') {
      departments.value.push({
        id: departments.value.length + 1,
        name: formData.value.name,
        code: formData.value.code,
        description: formData.value.description,
        memberCount: 0,
        createdAt: new Date()
      })
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Departemen berhasil ditambahkan', life: 3000 })
    } else {
      const index = departments.value.findIndex(d => d.id === formData.value.id)
      if (index !== -1) {
        departments.value[index] = {
          ...departments.value[index],
          name: formData.value.name,
          code: formData.value.code,
          description: formData.value.description
        }
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Departemen berhasil diupdate', life: 3000 })
      }
    }

    saving.value = false
    closeDialog()
  }, 1000)
}

const confirmDelete = (department) => {
  selectedDepartment.value = department
  deleteDialogVisible.value = true
}

const deleteDepartment = () => {
  deleting.value = true

  setTimeout(() => {
    departments.value = departments.value.filter(d => d.id !== selectedDepartment.value.id)
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Departemen berhasil dihapus', life: 3000 })
    deleting.value = false
    deleteDialogVisible.value = false
    selectedDepartment.value = null
  }, 1000)
}
</script>

<style scoped>
.department-list {
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
