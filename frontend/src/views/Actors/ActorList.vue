<template>
  <div class="actor-list">
    <div class="page-header">
      <h1 class="page-title">Manajemen Aktor/Pelaksana</h1>
      <Button 
        label="Tambah Aktor" 
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
                  placeholder="Cari aktor/pelaksana..." 
                  class="search-input w-full"
                  @input="filterActors"
                />
              </div>
            </div>
            <div class="col-12 md:col-3">
              <Dropdown 
                v-model="filterDepartment" 
                :options="departments" 
                optionLabel="name"
                optionValue="id"
                placeholder="Pilih Unit Kerja" 
                class="w-full"
                showClear
                @change="filterActors"
              />
            </div>
          </div>
        </div>

        <!-- DataTable -->
        <DataTable 
          :value="filteredActors" 
          :loading="loading"
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          responsiveLayout="scroll"
          stripedRows
          class="mt-4"
        >
          <Column field="kodeAktor" header="Kode Aktor" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.kodeAktor" severity="info" />
            </template>
          </Column>
          <Column field="namaJabatan" header="Nama Jabatan/Posisi" :sortable="true">
            <template #body="slotProps">
              <div class="actor-name">
                <i class="pi pi-user mr-2"></i>
                <strong>{{ slotProps.data.namaJabatan }}</strong>
              </div>
            </template>
          </Column>
          <Column field="departmentName" header="Unit Kerja" :sortable="true">
            <template #body="slotProps">
              {{ slotProps.data.departmentName || '-' }}
            </template>
          </Column>
          <Column field="deskripsi" header="Deskripsi">
            <template #body="slotProps">
              {{ slotProps.data.deskripsi || '-' }}
            </template>
          </Column>
          <Column field="sopCount" header="Digunakan di SOP" :sortable="true">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.sopCount + ' SOP'" 
                :severity="slotProps.data.sopCount > 0 ? 'success' : 'secondary'"
              />
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
                  @click="editActor(slotProps.data)"
                  v-tooltip.top="'Edit'"
                />
                <Button 
                  icon="pi pi-trash" 
                  rounded
                  text
                  severity="danger"
                  @click="confirmDelete(slotProps.data)"
                  v-tooltip.top="'Hapus'"
                  :disabled="slotProps.data.sopCount > 0"
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
      :header="dialogMode === 'create' ? 'Tambah Aktor/Pelaksana Baru' : 'Edit Aktor/Pelaksana'"
      :modal="true"
      :style="{ width: '600px' }"
      :closable="true"
    >
      <div class="form-grid">
        <div class="field">
          <label for="kodeAktor">Kode Aktor *</label>
          <InputText 
            id="kodeAktor"
            v-model="formData.kodeAktor" 
            class="w-full"
            placeholder="Contoh: KETUA_TIM, ANGGOTA, ADMIN"
            :class="{ 'p-invalid': submitted && !formData.kodeAktor }"
          />
          <small class="p-error" v-if="submitted && !formData.kodeAktor">Kode aktor wajib diisi.</small>
          <small class="hint">Gunakan huruf kapital dan underscore (_) untuk kode</small>
        </div>

        <div class="field">
          <label for="namaJabatan">Nama Jabatan/Posisi *</label>
          <InputText 
            id="namaJabatan"
            v-model="formData.namaJabatan" 
            class="w-full"
            placeholder="Contoh: Ketua Tim Metodologi"
            :class="{ 'p-invalid': submitted && !formData.namaJabatan }"
          />
          <small class="p-error" v-if="submitted && !formData.namaJabatan">Nama jabatan wajib diisi.</small>
        </div>

        <div class="field">
          <label for="departmentId">Unit Kerja</label>
          <Dropdown 
            id="departmentId"
            v-model="formData.departmentId" 
            :options="departments" 
            optionLabel="name"
            optionValue="id"
            placeholder="Pilih Unit Kerja" 
            class="w-full"
            showClear
          />
          <small class="hint">Opsional - untuk mengaitkan dengan unit kerja tertentu</small>
        </div>

        <div class="field">
          <label for="deskripsi">Deskripsi</label>
          <Textarea 
            id="deskripsi"
            v-model="formData.deskripsi" 
            rows="3" 
            class="w-full"
            placeholder="Deskripsi tugas dan tanggung jawab..."
          />
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
        <Button label="Simpan" icon="pi pi-check" @click="saveActor" :loading="saving" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="deleteDialogVisible" 
      header="Konfirmasi Hapus" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500);" />
        <span v-if="selectedActor">
          Apakah Anda yakin ingin menghapus aktor <strong>{{ selectedActor.namaJabatan }}</strong>?
          <br><br>
          <small class="text-red-500" v-if="selectedActor.sopCount > 0">
            ⚠️ Aktor ini digunakan di {{ selectedActor.sopCount }} SOP dan tidak dapat dihapus!
          </small>
        </span>
      </div>
      <template #footer>
        <Button label="Tidak" icon="pi pi-times" @click="deleteDialogVisible = false" class="p-button-text" />
        <Button 
          label="Ya, Hapus" 
          icon="pi pi-check" 
          @click="deleteActor" 
          class="p-button-danger"
          :disabled="selectedActor && selectedActor.sopCount > 0"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Avatar from 'primevue/avatar'

const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogMode = ref('create') // 'create' or 'edit'
const submitted = ref(false)
const searchQuery = ref('')
const filterDepartment = ref(null)

// Data
const actors = ref([])
const departments = ref([])
const selectedActor = ref(null)

const formData = ref({
  id: null,
  kodeAktor: '',
  namaJabatan: '',
  departmentId: null,
  deskripsi: ''
})

// Mock Data
const mockActors = [
  {
    id: 1,
    kodeAktor: 'KETUA_TIM',
    namaJabatan: 'Ketua Tim Metodologi dan Analisis Statistik',
    departmentId: 1,
    departmentName: 'Direktorat Analisis dan Pengembangan Statistik',
    deskripsi: 'Bertanggung jawab atas metodologi dan analisis statistik',
    sopCount: 15,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    kodeAktor: 'KETUA_PROJECT',
    namaJabatan: 'Ketua Project Analisis Sektor',
    departmentId: 1,
    departmentName: 'Direktorat Analisis dan Pengembangan Statistik',
    deskripsi: 'Memimpin project analisis sektor tertentu',
    sopCount: 12,
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 3,
    kodeAktor: 'ANGGOTA',
    namaJabatan: 'Anggota Tim',
    departmentId: 1,
    departmentName: 'Direktorat Analisis dan Pengembangan Statistik',
    deskripsi: 'Anggota tim pelaksana',
    sopCount: 20,
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 4,
    kodeAktor: 'TIM_DISEMINASI',
    namaJabatan: 'Tim Diseminasi',
    departmentId: 2,
    departmentName: 'Direktorat Diseminasi Statistik',
    deskripsi: 'Bertanggung jawab atas diseminasi hasil analisis',
    sopCount: 8,
    createdAt: '2024-02-10T10:00:00Z'
  },
  {
    id: 5,
    kodeAktor: 'KOORDINATOR',
    namaJabatan: 'Koordinator Statistik Produksi',
    departmentId: 3,
    departmentName: 'Direktorat Statistik Produksi',
    deskripsi: 'Mengkoordinasikan kegiatan statistik produksi',
    sopCount: 10,
    createdAt: '2024-03-01T10:00:00Z'
  },
  {
    id: 6,
    kodeAktor: 'PETUGAS_LAPANGAN',
    namaJabatan: 'Petugas Pengumpul Data',
    departmentId: 4,
    departmentName: 'Direktorat Pengumpulan Data',
    deskripsi: 'Melakukan pengumpulan data di lapangan',
    sopCount: 5,
    createdAt: '2024-03-15T10:00:00Z'
  }
]

const mockDepartments = [
  { id: 1, name: 'Direktorat Analisis dan Pengembangan Statistik' },
  { id: 2, name: 'Direktorat Diseminasi Statistik' },
  { id: 3, name: 'Direktorat Statistik Produksi' },
  { id: 4, name: 'Direktorat Pengumpulan Data' },
  { id: 5, name: 'Direktorat Statistik Distribusi' }
]

// Computed
const filteredActors = computed(() => {
  let result = actors.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(actor => 
      actor.namaJabatan.toLowerCase().includes(query) ||
      actor.kodeAktor.toLowerCase().includes(query) ||
      (actor.deskripsi && actor.deskripsi.toLowerCase().includes(query))
    )
  }

  // Filter by department
  if (filterDepartment.value) {
    result = result.filter(actor => actor.departmentId === filterDepartment.value)
  }

  return result
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    actors.value = mockActors
    departments.value = mockDepartments
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data aktor',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const filterActors = () => {
  // Filtering is handled by computed property
}

const openDialog = () => {
  dialogMode.value = 'create'
  submitted.value = false
  formData.value = {
    id: null,
    kodeAktor: '',
    namaJabatan: '',
    departmentId: null,
    deskripsi: ''
  }
  dialogVisible.value = true
}

const editActor = (actor) => {
  dialogMode.value = 'edit'
  submitted.value = false
  formData.value = {
    id: actor.id,
    kodeAktor: actor.kodeAktor,
    namaJabatan: actor.namaJabatan,
    departmentId: actor.departmentId,
    deskripsi: actor.deskripsi
  }
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  submitted.value = false
}

const saveActor = async () => {
  submitted.value = true

  // Validation
  if (!formData.value.kodeAktor || !formData.value.namaJabatan) {
    return
  }

  saving.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (dialogMode.value === 'create') {
      // Create new actor
      const newActor = {
        id: actors.value.length + 1,
        ...formData.value,
        departmentName: departments.value.find(d => d.id === formData.value.departmentId)?.name || null,
        sopCount: 0,
        createdAt: new Date().toISOString()
      }
      actors.value.push(newActor)
      
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Aktor berhasil ditambahkan',
        life: 3000
      })
    } else {
      // Update existing actor
      const index = actors.value.findIndex(a => a.id === formData.value.id)
      if (index !== -1) {
        actors.value[index] = {
          ...actors.value[index],
          ...formData.value,
          departmentName: departments.value.find(d => d.id === formData.value.departmentId)?.name || null
        }
      }
      
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Aktor berhasil diperbarui',
        life: 3000
      })
    }

    closeDialog()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menyimpan data aktor',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (actor) => {
  selectedActor.value = actor
  deleteDialogVisible.value = true
}

const deleteActor = async () => {
  if (!selectedActor.value || selectedActor.value.sopCount > 0) {
    return
  }

  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))

    actors.value = actors.value.filter(a => a.id !== selectedActor.value.id)
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Aktor berhasil dihapus',
      life: 3000
    })
    
    deleteDialogVisible.value = false
    selectedActor.value = null
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menghapus aktor',
      life: 3000
    })
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.actor-list {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
}

/* Filter Section */
.filter-section {
  margin-bottom: 1rem;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-secondary);
}

.search-input {
  padding-left: 3rem;
}

/* Table Styling */
.actor-name {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Form Styling */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: var(--text-color);
}

.hint {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Confirmation Dialog */
.confirmation-content {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .actor-list {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-header Button {
    width: 100%;
  }
}
</style>
