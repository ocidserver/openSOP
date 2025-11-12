<template>
  <div class="category-list">
    <!-- Header Section -->
    <div class="header-section">
      <div class="title-container">
        <div class="icon-wrapper">
          <i class="pi pi-tag"></i>
        </div>
        <div class="title-text">
          <h1>Manajemen Kategori SOP</h1>
          <p class="subtitle">Kelola kategori dan sub-kategori untuk klasifikasi SOP</p>
        </div>
      </div>
      <Button 
        v-if="canManageCategories"
        label="Tambah Kategori" 
        icon="pi pi-plus" 
        @click="openCreateDialog"
        class="p-button-success"
      />
    </div>

    <!-- Statistics Cards -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon" style="background: #3b82f6;">
          <i class="pi pi-tags"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.totalCategories }}</h3>
          <p>Total Kategori</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #10b981;">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.activeCategories }}</h3>
          <p>Kategori Aktif</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #f59e0b;">
          <i class="pi pi-sitemap"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.withSubCategories }}</h3>
          <p>Dengan Sub-Kategori</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #8b5cf6;">
          <i class="pi pi-file"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.totalSOPs }}</h3>
          <p>Total SOP</p>
        </div>
      </div>
    </div>

    <!-- Filter and View Options -->
    <Card class="filter-card">
      <template #content>
        <div class="filter-section">
          <div class="filter-left">
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText 
                v-model="searchQuery" 
                placeholder="Cari kategori..."
                class="search-input"
              />
            </IconField>
            
            <Dropdown
              v-model="filterStatus"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Status"
              class="filter-dropdown"
            />

            <Dropdown
              v-model="filterType"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Tipe"
              class="filter-dropdown"
            />

            <Button 
              label="Reset" 
              icon="pi pi-filter-slash" 
              @click="resetFilters"
              severity="secondary"
              outlined
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Table View -->
    <Card class="content-card">
      <template #content>
        <DataTable 
          :value="filteredCategories" 
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} kategori"
          responsiveLayout="scroll"
          stripedRows
          class="category-table"
        >
          <Column field="code" header="Kode" sortable style="min-width: 120px;">
            <template #body="slotProps">
              <Tag :value="slotProps.data.code" severity="info" />
            </template>
          </Column>

          <Column field="name" header="Nama Kategori" sortable style="min-width: 200px;">
            <template #body="slotProps">
              <div class="category-name-cell">
                <i v-if="slotProps.data.parent" class="pi pi-arrow-right" style="font-size: 0.7rem; color: #94a3b8; margin-right: 0.5rem;"></i>
                <span :style="{ fontWeight: slotProps.data.parent ? 'normal' : '600' }">{{ slotProps.data.name }}</span>
              </div>
            </template>
          </Column>

          <Column field="parent" header="Kategori Induk" sortable style="min-width: 150px;">
            <template #body="slotProps">
              <span v-if="slotProps.data.parent">{{ slotProps.data.parent }}</span>
              <Tag v-else value="Kategori Utama" severity="secondary" />
            </template>
          </Column>

          <Column field="description" header="Deskripsi" style="min-width: 250px;">
            <template #body="slotProps">
              <span class="description-text">{{ slotProps.data.description || '-' }}</span>
            </template>
          </Column>

          <Column field="sopCount" header="Jumlah SOP" sortable style="min-width: 120px;">
            <template #body="slotProps">
              <Chip :label="`${slotProps.data.sopCount} SOP`" />
            </template>
          </Column>

          <Column field="status" header="Status" sortable style="min-width: 120px;">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'" 
                :severity="slotProps.data.status === 'ACTIVE' ? 'success' : 'danger'"
              />
            </template>
          </Column>

          <Column field="createdAt" header="Dibuat" sortable style="min-width: 150px;">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.createdAt) }}
            </template>
          </Column>

          <Column v-if="canManageCategories" header="Aksi" style="min-width: 150px;" frozen alignFrozen="right">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button 
                  icon="pi pi-pencil" 
                  v-tooltip.top="'Edit'"
                  @click="openEditDialog(slotProps.data)"
                  class="p-button-rounded p-button-text"
                />
                <Button 
                  icon="pi pi-trash" 
                  v-tooltip.top="'Hapus'"
                  @click="confirmDelete(slotProps.data)"
                  class="p-button-rounded p-button-text p-button-danger"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="empty-state">
              <i class="pi pi-inbox" style="font-size: 3rem; color: #cbd5e1;"></i>
              <p>Tidak ada kategori ditemukan</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog 
      v-model:visible="categoryDialog" 
      :header="dialogMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'"
      :modal="true" 
      :style="{ width: '600px' }"
      :closable="!isSaving"
    >
      <div class="dialog-content">
        <div class="form-field">
          <label for="code" class="required">Kode Kategori</label>
          <InputText 
            id="code"
            v-model="categoryForm.code" 
            placeholder="Contoh: KAT-001"
            :disabled="dialogMode === 'edit'"
            class="w-full"
          />
          <small class="field-hint">Kode unik untuk kategori (tidak dapat diubah setelah dibuat)</small>
        </div>

        <div class="form-field">
          <label for="name" class="required">Nama Kategori</label>
          <InputText 
            id="name"
            v-model="categoryForm.name" 
            placeholder="Masukkan nama kategori"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="parent">Kategori Induk</label>
          <Dropdown
            id="parent"
            v-model="categoryForm.parentId"
            :options="parentCategoryOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="Pilih kategori induk (opsional)"
            :disabled="dialogMode === 'subCategory'"
            showClear
            class="w-full"
          />
          <small class="field-hint">Kosongkan jika ini kategori utama</small>
        </div>

        <div class="form-field">
          <label for="description">Deskripsi</label>
          <Textarea 
            id="description"
            v-model="categoryForm.description" 
            rows="3"
            placeholder="Jelaskan tujuan atau ruang lingkup kategori ini"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="status">Status</label>
          <div class="status-toggle">
            <InputSwitch v-model="categoryForm.isActive" inputId="status" />
            <label for="status" class="toggle-label">
              {{ categoryForm.isActive ? 'Aktif' : 'Nonaktif' }}
            </label>
          </div>
        </div>

        <div v-if="dialogMode === 'edit' && categoryForm.sopCount > 0" class="warning-message">
          <Message severity="warn" :closable="false">
            Kategori ini memiliki {{ categoryForm.sopCount }} SOP. Pastikan perubahan tidak memengaruhi SOP yang ada.
          </Message>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Batal" 
          icon="pi pi-times" 
          @click="categoryDialog = false" 
          severity="secondary"
          outlined
          :disabled="isSaving"
        />
        <Button 
          :label="dialogMode === 'create' ? 'Simpan' : 'Update'" 
          icon="pi pi-check" 
          @click="saveCategory"
          :loading="isSaving"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="deleteDialog" 
      header="Konfirmasi Hapus" 
      :modal="true" 
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #f59e0b;"></i>
        <div class="confirmation-text">
          <p style="margin: 0 0 0.5rem 0; font-weight: 600;">Apakah Anda yakin ingin menghapus kategori ini?</p>
          <div class="delete-info">
            <p><strong>Kode:</strong> {{ selectedCategory?.code }}</p>
            <p><strong>Nama:</strong> {{ selectedCategory?.name }}</p>
            <p v-if="selectedCategory?.sopCount > 0" style="color: #dc2626; font-weight: 600;">
              <i class="pi pi-info-circle"></i> Kategori ini memiliki {{ selectedCategory.sopCount }} SOP
            </p>
          </div>
          <Message v-if="selectedCategory?.sopCount > 0" severity="error" :closable="false">
            Anda tidak dapat menghapus kategori yang masih memiliki SOP. Pindahkan atau hapus SOP terlebih dahulu.
          </Message>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Batal" 
          icon="pi pi-times" 
          @click="deleteDialog = false" 
          severity="secondary"
          outlined
          :disabled="isDeleting"
        />
        <Button 
          label="Hapus" 
          icon="pi pi-trash" 
          @click="deleteCategory" 
          severity="danger"
          :disabled="selectedCategory?.sopCount > 0"
          :loading="isDeleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputSwitch from 'primevue/inputswitch'
import Message from 'primevue/message'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// Permissions
const canManageCategories = computed(() => {
  const role = authStore.user?.role
  return ['ADMIN', 'SUPERVISOR'].includes(role)
})

// State
const searchQuery = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const expandedKeys = ref({})

const categoryDialog = ref(false)
const deleteDialog = ref(false)
const dialogMode = ref('create') // 'create', 'edit', 'subCategory'
const selectedCategory = ref(null)
const isSaving = ref(false)
const isDeleting = ref(false)

// Form
const categoryForm = ref({
  id: null,
  code: '',
  name: '',
  parentId: null,
  description: '',
  isActive: true,
  sopCount: 0
})

// Options
const statusOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Aktif', value: 'ACTIVE' },
  { label: 'Nonaktif', value: 'INACTIVE' }
]

const typeOptions = [
  { label: 'Semua Tipe', value: 'all' },
  { label: 'Kategori Utama', value: 'main' },
  { label: 'Sub-Kategori', value: 'sub' }
]

// Mock Data
const categories = ref([
  {
    id: '1',
    code: 'KAT-001',
    name: 'Administrasi',
    parent: null,
    description: 'Prosedur administrasi umum dan tata kelola',
    sopCount: 15,
    status: 'ACTIVE',
    createdAt: '2024-01-15T08:00:00Z',
    children: ['2', '3']
  },
  {
    id: '2',
    code: 'KAT-001-01',
    name: 'Surat Menyurat',
    parent: 'Administrasi',
    parentId: '1',
    description: 'Prosedur pengelolaan surat masuk dan keluar',
    sopCount: 8,
    status: 'ACTIVE',
    createdAt: '2024-01-20T09:00:00Z',
    children: []
  },
  {
    id: '3',
    code: 'KAT-001-02',
    name: 'Arsip dan Dokumentasi',
    parent: 'Administrasi',
    parentId: '1',
    description: 'Prosedur penyimpanan dan pengelolaan arsip',
    sopCount: 7,
    status: 'ACTIVE',
    createdAt: '2024-01-22T10:00:00Z',
    children: []
  },
  {
    id: '4',
    code: 'KAT-002',
    name: 'Keuangan',
    parent: null,
    description: 'Prosedur pengelolaan keuangan dan anggaran',
    sopCount: 12,
    status: 'ACTIVE',
    createdAt: '2024-01-25T08:00:00Z',
    children: ['5', '6', '7']
  },
  {
    id: '5',
    code: 'KAT-002-01',
    name: 'Penganggaran',
    parent: 'Keuangan',
    parentId: '4',
    description: 'Prosedur penyusunan dan pengelolaan anggaran',
    sopCount: 4,
    status: 'ACTIVE',
    createdAt: '2024-02-01T09:00:00Z',
    children: []
  },
  {
    id: '6',
    code: 'KAT-002-02',
    name: 'Pencairan Dana',
    parent: 'Keuangan',
    parentId: '4',
    description: 'Prosedur pencairan dan pertanggungjawaban dana',
    sopCount: 5,
    status: 'ACTIVE',
    createdAt: '2024-02-05T10:00:00Z',
    children: []
  },
  {
    id: '7',
    code: 'KAT-002-03',
    name: 'Pelaporan Keuangan',
    parent: 'Keuangan',
    parentId: '4',
    description: 'Prosedur penyusunan laporan keuangan',
    sopCount: 3,
    status: 'ACTIVE',
    createdAt: '2024-02-10T11:00:00Z',
    children: []
  },
  {
    id: '8',
    code: 'KAT-003',
    name: 'SDM',
    parent: null,
    description: 'Prosedur pengelolaan sumber daya manusia',
    sopCount: 18,
    status: 'ACTIVE',
    createdAt: '2024-02-15T08:00:00Z',
    children: ['9', '10', '11']
  },
  {
    id: '9',
    code: 'KAT-003-01',
    name: 'Rekrutmen',
    parent: 'SDM',
    parentId: '8',
    description: 'Prosedur rekrutmen dan seleksi pegawai',
    sopCount: 6,
    status: 'ACTIVE',
    createdAt: '2024-02-20T09:00:00Z',
    children: []
  },
  {
    id: '10',
    code: 'KAT-003-02',
    name: 'Pengembangan Kompetensi',
    parent: 'SDM',
    parentId: '8',
    description: 'Prosedur pelatihan dan pengembangan pegawai',
    sopCount: 7,
    status: 'ACTIVE',
    createdAt: '2024-02-25T10:00:00Z',
    children: []
  },
  {
    id: '11',
    code: 'KAT-003-03',
    name: 'Evaluasi Kinerja',
    parent: 'SDM',
    parentId: '8',
    description: 'Prosedur penilaian kinerja pegawai',
    sopCount: 5,
    status: 'ACTIVE',
    createdAt: '2024-03-01T11:00:00Z',
    children: []
  },
  {
    id: '12',
    code: 'KAT-004',
    name: 'Teknologi Informasi',
    parent: null,
    description: 'Prosedur pengelolaan sistem dan infrastruktur TI',
    sopCount: 10,
    status: 'ACTIVE',
    createdAt: '2024-03-05T08:00:00Z',
    children: ['13', '14']
  },
  {
    id: '13',
    code: 'KAT-004-01',
    name: 'Keamanan Sistem',
    parent: 'Teknologi Informasi',
    parentId: '12',
    description: 'Prosedur keamanan dan perlindungan data',
    sopCount: 6,
    status: 'ACTIVE',
    createdAt: '2024-03-10T09:00:00Z',
    children: []
  },
  {
    id: '14',
    code: 'KAT-004-02',
    name: 'Pemeliharaan Sistem',
    parent: 'Teknologi Informasi',
    parentId: '12',
    description: 'Prosedur maintenance dan troubleshooting',
    sopCount: 4,
    status: 'ACTIVE',
    createdAt: '2024-03-15T10:00:00Z',
    children: []
  },
  {
    id: '15',
    code: 'KAT-005',
    name: 'Pelayanan Publik',
    parent: null,
    description: 'Prosedur pelayanan kepada masyarakat',
    sopCount: 20,
    status: 'ACTIVE',
    createdAt: '2024-03-20T08:00:00Z',
    children: ['16']
  },
  {
    id: '16',
    code: 'KAT-005-01',
    name: 'Pengaduan Masyarakat',
    parent: 'Pelayanan Publik',
    parentId: '15',
    description: 'Prosedur penanganan pengaduan dan keluhan',
    sopCount: 5,
    status: 'ACTIVE',
    createdAt: '2024-03-25T09:00:00Z',
    children: []
  },
  {
    id: '17',
    code: 'KAT-006',
    name: 'Pengadaan',
    parent: null,
    description: 'Prosedur pengadaan barang dan jasa',
    sopCount: 8,
    status: 'INACTIVE',
    createdAt: '2024-04-01T08:00:00Z',
    children: []
  }
])

// Computed
const statistics = computed(() => {
  const total = categories.value.length
  const active = categories.value.filter(c => c.status === 'ACTIVE').length
  const withSub = categories.value.filter(c => c.children && c.children.length > 0).length
  const totalSOPs = categories.value.reduce((sum, c) => sum + c.sopCount, 0)
  
  return {
    totalCategories: total,
    activeCategories: active,
    withSubCategories: withSub,
    totalSOPs: totalSOPs
  }
})

const filteredCategories = computed(() => {
  let result = [...categories.value]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    )
  }
  
  // Status filter
  if (filterStatus.value !== 'all') {
    result = result.filter(c => c.status === filterStatus.value)
  }
  
  // Type filter
  if (filterType.value === 'main') {
    result = result.filter(c => !c.parent)
  } else if (filterType.value === 'sub') {
    result = result.filter(c => c.parent)
  }
  
  return result
})

const parentCategoryOptions = computed(() => {
  return categories.value
    .filter(c => !c.parent && c.id !== categoryForm.value.id)
    .map(c => ({ id: c.id, name: `${c.code} - ${c.name}` }))
})

// Methods
const formatDate = (dateString) => {
  return format(new Date(dateString), 'dd MMM yyyy', { locale: id })
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterType.value = 'all'
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  categoryForm.value = {
    id: null,
    code: '',
    name: '',
    parentId: null,
    description: '',
    isActive: true,
    sopCount: 0
  }
  categoryDialog.value = true
}

const openEditDialog = (category) => {
  dialogMode.value = 'edit'
  categoryForm.value = {
    id: category.id,
    code: category.code,
    name: category.name,
    parentId: category.parentId,
    description: category.description,
    isActive: category.status === 'ACTIVE',
    sopCount: category.sopCount || 0
  }
  categoryDialog.value = true
}

const saveCategory = async () => {
  // Validation
  if (!categoryForm.value.code || !categoryForm.value.name) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Kode dan nama kategori harus diisi',
      life: 3000
    })
    return
  }
  
  isSaving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (dialogMode.value === 'create' || dialogMode.value === 'subCategory') {
      // Create new category
      const newCategory = {
        id: Date.now().toString(),
        code: categoryForm.value.code,
        name: categoryForm.value.name,
        parent: categoryForm.value.parentId 
          ? categories.value.find(c => c.id === categoryForm.value.parentId)?.name 
          : null,
        parentId: categoryForm.value.parentId,
        description: categoryForm.value.description,
        sopCount: 0,
        status: categoryForm.value.isActive ? 'ACTIVE' : 'INACTIVE',
        createdAt: new Date().toISOString(),
        children: []
      }
      
      categories.value.push(newCategory)
      
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Kategori berhasil ditambahkan',
        life: 3000
      })
    } else {
      // Update existing category
      const index = categories.value.findIndex(c => c.id === categoryForm.value.id)
      if (index !== -1) {
        categories.value[index] = {
          ...categories.value[index],
          name: categoryForm.value.name,
          description: categoryForm.value.description,
          status: categoryForm.value.isActive ? 'ACTIVE' : 'INACTIVE'
        }
        
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Kategori berhasil diupdate',
          life: 3000
        })
      }
    }
    
    categoryDialog.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menyimpan kategori',
      life: 3000
    })
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (category) => {
  selectedCategory.value = category
  deleteDialog.value = true
}

const deleteCategory = async () => {
  isDeleting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const index = categories.value.findIndex(c => c.id === selectedCategory.value.id)
    if (index !== -1) {
      categories.value.splice(index, 1)
    }
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Kategori berhasil dihapus',
      life: 3000
    })
    
    deleteDialog.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menghapus kategori',
      life: 3000
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.category-list {
  padding: 1.5rem;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.title-text h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin: 0.25rem 0 0 0;
  font-size: 0.95rem;
}

/* Statistics Cards */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.stat-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Filter Section */
.filter-card {
  margin-bottom: 1.5rem;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-left {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
}

.search-input {
  min-width: 300px;
}

.filter-dropdown {
  min-width: 150px;
}

/* Table View */
.category-table {
  font-size: 0.95rem;
}

.category-name-cell {
  display: flex;
  align-items: center;
}

.description-text {
  color: #64748b;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* Dialog */
.dialog-content {
  padding: 1rem 0;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #334155;
}

.form-field label.required::after {
  content: ' *';
  color: #ef4444;
}

.field-hint {
  display: block;
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-label {
  font-weight: 500;
  color: #334155;
}

.warning-message {
  margin-top: 1rem;
}

/* Confirmation Dialog */
.confirmation-content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1rem;
}

.confirmation-text {
  flex: 1;
}

.delete-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.delete-info p {
  margin: 0.5rem 0;
  color: #475569;
}

/* Content Card */
.content-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .category-list {
    padding: 1rem;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-left,
  .filter-right {
    width: 100%;
  }
  
  .search-input,
  .filter-dropdown {
    width: 100%;
    min-width: auto;
  }
}
</style>
