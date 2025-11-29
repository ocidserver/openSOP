<template>
  <div class="sop-list">
    <Toast />
    
    <div class="page-header">
      <div>
        <h1 class="page-title">Daftar SOP</h1>
        <p class="page-subtitle" v-if="totalRecords > 0">
          Total: {{ totalRecords }} SOP
        </p>
      </div>
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
              <Select 
                v-model="filters.category" 
                :options="categories" 
                optionLabel="name"
                placeholder="Pilih Kategori" 
                class="w-full"
                showClear
              />
            </div>
            <div class="col-12 md:col-3">
              <Select 
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
          :rows="20"
          :rowsPerPageOptions="[10, 20, 50, 100]"
          :totalRecords="totalRecords"
          responsiveLayout="scroll"
          stripedRows
          class="mt-4"
          :rowHover="true"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} SOP"
        >
          <template #empty>
            <div class="text-center py-4">
              <i class="pi pi-inbox" style="font-size: 3rem; color: #9ca3af;"></i>
              <p class="text-gray-600 mt-3">Tidak ada data SOP</p>
            </div>
          </template>
          
          <Column field="code" header="Nomor SOP" :sortable="true" style="min-width: 180px;">
            <template #body="slotProps">
              <router-link 
                :to="`/sop/${slotProps.data.id}`"
                class="sop-link"
              >
                {{ slotProps.data.code }}
              </router-link>
            </template>
          </Column>
          <Column field="title" header="Judul" :sortable="true" style="min-width: 300px;"></Column>
          <Column field="category" header="Kategori" :sortable="true" style="min-width: 150px;"></Column>
          <Column field="department" header="Department" :sortable="true" style="min-width: 150px;"></Column>
          <Column field="version" header="Versi" :sortable="true" style="min-width: 80px;"></Column>
          <Column field="status" header="Status" :sortable="true" style="min-width: 120px;">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.status" 
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
          <Column field="updatedAt" header="Terakhir Diubah" :sortable="true" style="min-width: 140px;">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.updatedAt) }}
            </template>
          </Column>
          <Column header="Aksi" style="min-width: 180px;">
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { format } from 'date-fns';
import sopService from '@/services/sopService';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

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

// Data from API
const sops = ref([]);
const loading = ref(false);
const totalRecords = ref(0);

const filters = ref({
  search: '',
  category: null,
  status: null
});

const categories = ref([]);

const statuses = ref([
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Review', value: 'REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Revision', value: 'REVISION' },
  { label: 'Archived', value: 'ARCHIVED' },
  { label: 'Obsolete', value: 'OBSOLETE' }
]);

const getStatusSeverity = (status) => {
  const severityMap = {
    'ACTIVE': 'success',
    'APPROVED': 'success',
    'DRAFT': 'info',
    'REVIEW': 'warning',
    'REJECTED': 'danger',
    'REVISION': 'warning',
    'ARCHIVED': 'secondary',
    'OBSOLETE': 'danger'
  };
  return severityMap[status] || 'info';
};

const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy');
};

// Load SOPs from API
const loadSOPs = async () => {
  try {
    loading.value = true;
    const params = {
      page: 1,
      limit: 100,
      search: filters.value.search || undefined,
      category: filters.value.category?.id || undefined,
      status: filters.value.status || undefined
    };

    const response = await sopService.getSOPs(params);
    
    if (response.success) {
      const sopData = response.data;
      
      // Map backend data to frontend format
      sops.value = sopData.sops.map(sop => ({
        id: sop.id,
        code: sop.sopNumber,
        title: sop.title,
        category: sop.categories?.[0]?.category?.name || '-',
        version: `${sop.versionNumber}.0`,
        status: sop.status,
        updatedAt: sop.updatedAt,
        department: sop.department?.name || '-'
      }));
      
      totalRecords.value = sopData.pagination?.total || sops.value.length;
      
      console.log('Loaded SOPs:', sops.value.length);
    }
  } catch (error) {
    console.error('Error loading SOPs:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data SOP',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

// Load categories from API
const loadCategories = async () => {
  try {
    const response = await sopService.getCategories();
    if (response.success) {
      categories.value = response.data.map(cat => ({
        id: cat.id,
        name: cat.name,
        code: cat.code
      }));
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

const createSOP = () => {
  console.log('🔵 createSOP clicked - Attempting to navigate to /sop/create');
  console.log('Current user:', authStore.user);
  console.log('User role:', authStore.user?.role);
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

const deleteSOP = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus SOP ini?')) {
    return;
  }
  
  try {
    loading.value = true;
    await sopService.deleteSOP(id);
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'SOP berhasil dihapus',
      life: 3000
    });
    
    // Reload data
    await loadSOPs();
  } catch (error) {
    console.error('Error deleting SOP:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Gagal menghapus SOP',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  loadSOPs();
};

// Watch for filter changes
watch([() => filters.value.search], () => {
  // Debounce search
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    loadSOPs();
  }, 500);
});

const searchTimeout = ref(null);

onMounted(async () => {
  await loadCategories();
  await loadSOPs();
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
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #6c757d;
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
