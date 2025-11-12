<template>
  <div class="sop-list">
    <div class="page-header">
      <h1 class="page-title">Daftar SOP</h1>
      <Button 
        label="Buat SOP Baru" 
        icon="pi pi-plus" 
        @click="createSOP"
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
                  placeholder="Cari SOP..." 
                  class="search-input w-full"
                />
              </div>
            </div>
            <div class="col-12 md:col-3">
              <Dropdown 
                v-model="filters.category" 
                :options="categories" 
                optionLabel="name"
                placeholder="Pilih Kategori" 
                class="w-full"
                showClear
              />
            </div>
            <div class="col-12 md:col-3">
              <Dropdown 
                v-model="filters.status" 
                :options="statuses" 
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih Status" 
                class="w-full"
                showClear
              />
            </div>
            <div class="col-12 md:col-2">
              <Button 
                label="Filter" 
                icon="pi pi-filter" 
                @click="applyFilters"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- DataTable -->
        <DataTable 
          :value="sops" 
          :loading="loading"
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          responsiveLayout="scroll"
          stripedRows
          class="mt-4"
        >
          <Column field="code" header="Kode SOP" :sortable="true">
            <template #body="slotProps">
              <router-link 
                :to="`/sop/${slotProps.data.id}`"
                class="sop-link"
              >
                {{ slotProps.data.code }}
              </router-link>
            </template>
          </Column>
          <Column field="title" header="Judul" :sortable="true"></Column>
          <Column field="category" header="Kategori" :sortable="true"></Column>
          <Column field="version" header="Versi" :sortable="true"></Column>
          <Column field="status" header="Status" :sortable="true">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.status" 
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
          <Column field="updatedAt" header="Terakhir Diubah" :sortable="true">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.updatedAt) }}
            </template>
          </Column>
          <Column header="Aksi">
            <template #body="slotProps">
              <Button 
                icon="pi pi-eye" 
                class="p-button-rounded p-button-text p-button-info"
                v-tooltip.top="'Lihat Detail'"
                @click="viewSOP(slotProps.data.id)"
              />
              <!-- Tombol Review untuk Supervisor jika status REVIEW -->
              <Button 
                v-if="isSupervisor && slotProps.data.status === 'REVIEW'"
                icon="pi pi-check-square" 
                class="p-button-rounded p-button-text p-button-success"
                v-tooltip.top="'Review SOP'"
                @click="reviewSOP(slotProps.data.id)"
              />
              <!-- Tombol Edit hanya untuk user yang berhak -->
              <Button 
                v-if="canEdit"
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text p-button-warning"
                v-tooltip.top="'Edit'"
                @click="editSOP(slotProps.data.id)"
              />
              <!-- Tombol Hapus hanya untuk Admin -->
              <Button 
                v-if="canDelete"
                icon="pi pi-trash" 
                class="p-button-rounded p-button-text p-button-danger"
                v-tooltip.top="'Hapus'"
                @click="deleteSOP(slotProps.data.id)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { format } from 'date-fns';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

const router = useRouter();
const authStore = useAuthStore();

// Check if user is supervisor
const isSupervisor = computed(() => {
  return ['ADMIN', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA', 'SUPERVISOR'].includes(authStore.user?.role);
});

// Check if user can edit
const canEdit = computed(() => {
  return ['ADMIN', 'SUPERVISOR'].includes(authStore.user?.role);
});

// Check if user can delete
const canDelete = computed(() => {
  return ['ADMIN'].includes(authStore.user?.role);
});

// Sample data
const sops = ref([
  {
    id: 1,
    code: 'SOP/BPS/2025/001',
    title: 'Prosedur Pengolahan Data Sensus',
    category: 'Pengolahan Data',
    version: '1.0',
    status: 'ACTIVE',
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 2,
    code: 'SOP/BPS/2025/002',
    title: 'Prosedur Verifikasi dan Validasi Data',
    category: 'Quality Control',
    version: '2.1',
    status: 'DRAFT',
    updatedAt: new Date('2025-02-01')
  },
  {
    id: 3,
    code: 'SOP/BPS/2025/003',
    title: 'Prosedur Publikasi Data Statistik',
    category: 'Publikasi',
    version: '1.3',
    status: 'REVIEW',
    updatedAt: new Date('2025-02-10')
  }
]);

const loading = ref(false);

const filters = ref({
  search: '',
  category: null,
  status: null
});

const categories = ref([
  { name: 'Pengolahan Data' },
  { name: 'Quality Control' },
  { name: 'Publikasi' },
  { name: 'Administrasi' }
]);

const statuses = ref([
  { label: 'Aktif', value: 'ACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Review', value: 'REVIEW' },
  { label: 'Archived', value: 'ARCHIVED' }
]);

const getStatusSeverity = (status) => {
  const severityMap = {
    'ACTIVE': 'success',
    'DRAFT': 'info',
    'REVIEW': 'warning',
    'ARCHIVED': 'danger'
  };
  return severityMap[status] || 'info';
};

const formatDate = (date) => {
  return format(new Date(date), 'dd MMM yyyy');
};

const createSOP = () => {
  router.push('/sop/create');
};

const viewSOP = (id) => {
  router.push(`/sop/${id}`);
};

const reviewSOP = (id) => {
  // Navigate to detail page with review mode
  router.push({ path: `/sop/${id}`, query: { mode: 'review' } });
};

const editSOP = (id) => {
  router.push(`/sop/${id}/edit`);
};

const deleteSOP = (id) => {
  console.log('Delete SOP:', id);
  // Implement delete functionality
};

const applyFilters = () => {
  loading.value = true;
  // Implement filter logic
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

onMounted(() => {
  // Load SOPs from API
});
</script>

<style scoped>
.sop-list {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
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

.sop-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.sop-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.mt-4 {
  margin-top: 1.5rem;
}

/* DataTable custom styling */
:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable .p-datatable-header) {
  background-color: #f8f9fa;
  border: none;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #e9ecef;
  color: #495057;
  font-weight: 600;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.875rem 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .filter-section {
    padding: 1rem;
  }
}
</style>
