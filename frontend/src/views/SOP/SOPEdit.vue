<template>
  <div class="sop-edit">
    <Toast />
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Memuat data SOP...</p>
    </div>

    <!-- Error State -->
    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
      <Button label="Kembali" icon="pi pi-arrow-left" @click="goBack" class="p-button-text ml-3" />
    </Message>

    <!-- Edit Form -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i class="pi pi-file-edit"></i>
            Edit SOP
          </h1>
          <p class="page-subtitle">{{ sopData.sopNumber }} - {{ sopData.title }}</p>
        </div>
        <div class="header-actions">
          <Button 
            label="Kembali" 
            icon="pi pi-arrow-left" 
            @click="handleBack" 
            text
          />
        </div>
      </div>

      <!-- Progress Steps -->
      <Card class="progress-card">
        <template #content>
          <Steps :model="progressSteps" :activeStep="activeStep" :readonly="true" />
        </template>
      </Card>

      <!-- Step 1: Informasi Dasar -->
      <Card class="form-card" v-show="activeStep === 0">
        <template #title>
          <div class="card-title">
            <i class="pi pi-info-circle"></i>
            Informasi Dasar SOP
          </div>
        </template>
        <template #content>
          <div class="form-grid">
            <!-- Judul SOP -->
            <div class="form-field">
              <label for="title" class="required">Judul SOP</label>
              <InputText
                id="title"
                v-model="sopData.title"
                placeholder="Contoh: SOP Pelayanan Permintaan Data"
                class="w-full"
                :class="{ 'p-invalid': submitted && !sopData.title }"
              />
              <small v-if="submitted && !sopData.title" class="p-error">
                Judul SOP wajib diisi
              </small>
            </div>

            <!-- Deskripsi -->
            <div class="form-field">
              <label for="description">Deskripsi</label>
              <Textarea
                id="description"
                v-model="sopData.description"
                placeholder="Deskripsi singkat tentang SOP ini..."
                rows="3"
                autoResize
                class="w-full"
              />
            </div>

            <!-- Department -->
            <div class="form-field">
              <label for="department" class="required">Department/Unit Kerja</label>
              <Select
                id="department"
                v-model="sopData.departmentId"
                :options="departments"
                optionLabel="name"
                optionValue="id"
                placeholder="Pilih Department"
                class="w-full"
                :class="{ 'p-invalid': submitted && !sopData.departmentId }"
                :loading="loadingDepartments"
              />
              <small v-if="submitted && !sopData.departmentId" class="p-error">
                Department wajib dipilih
              </small>
            </div>

            <!-- Categories -->
            <div class="form-field">
              <label for="categories">Kategori SOP</label>
              <MultiSelect
                id="categories"
                v-model="sopData.categoryIds"
                :options="categories"
                optionLabel="name"
                optionValue="id"
                placeholder="Pilih Kategori (bisa lebih dari 1)"
                class="w-full"
                :loading="loadingCategories"
                display="chip"
              />
            </div>

            <!-- Aktor yang Terlibat -->
            <div class="form-field">
              <label for="actors">Aktor/Pelaksana yang Terlibat</label>
              <div class="actor-management">
                <div class="actor-list-container">
                  <div v-if="loadingActors" class="loading-state">
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Memuat daftar aktor...</span>
                  </div>
                  <div v-else-if="filteredActors.length === 0" class="empty-state">
                    <i class="pi pi-users"></i>
                    <span>Belum ada aktor tersedia</span>
                  </div>
                  <div v-else class="actor-checkbox-list">
                    <div 
                      v-for="actor in filteredActors" 
                      :key="actor.id"
                      class="actor-checkbox-item"
                      :class="{ 'selected': sopData.involvedActors.includes(actor.id) }"
                    >
                      <Checkbox
                        :id="`actor-${actor.id}`"
                        v-model="sopData.involvedActors"
                        :value="actor.id"
                        :binary="false"
                      />
                      <label :for="`actor-${actor.id}`" class="actor-label">
                        <i class="pi pi-user"></i>
                        <span class="actor-text">
                          {{ actor.name }}<span v-if="actor.position" class="actor-position"> ({{ actor.position }})</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tanggal Efektif -->
            <div class="form-field">
              <label for="effectiveDate">Tanggal Efektif</label>
              <DatePicker
                id="effectiveDate"
                v-model="sopData.effectiveDate"
                dateFormat="dd/mm/yy"
                placeholder="Pilih tanggal efektif"
                class="w-full"
                showIcon
              />
            </div>

            <!-- Tags -->
            <div class="form-field">
              <label for="tags">Tags/Kata Kunci</label>
              <InputText
                id="tags"
                v-model="tagInput"
                placeholder="Ketik tag dan tekan Enter"
                class="w-full"
                @keydown.enter.prevent="addTag"
              />
              <small class="form-hint">Ketik tag dan tekan Enter untuk menambahkan</small>
              <div v-if="sopData.tags && sopData.tags.length > 0" class="tags-display">
                <Chip 
                  v-for="(tag, index) in sopData.tags" 
                  :key="index" 
                  :label="tag" 
                  removable 
                  @remove="removeTag(index)" 
                />
              </div>
            </div>

            <!-- Field Tambahan -->
            <div class="form-field">
              <label for="legalBasis">Dasar Hukum</label>
              <Textarea
                id="legalBasis"
                v-model="sopData.legalBasis"
                placeholder="Contoh: UU No. 16 Tahun 1997, PP No. 51 Tahun 1999..."
                rows="3"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label for="executorQualification">Kualifikasi Pelaksana</label>
              <Textarea
                id="executorQualification"
                v-model="sopData.executorQualification"
                placeholder="Kualifikasi yang diperlukan untuk melaksanakan SOP ini..."
                rows="3"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label for="equipment">Peralatan/Perlengkapan</label>
              <Textarea
                id="equipment"
                v-model="sopData.equipment"
                placeholder="Peralatan yang dibutuhkan..."
                rows="3"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label for="warnings">Peringatan</label>
              <Textarea
                id="warnings"
                v-model="sopData.warnings"
                placeholder="Hal-hal yang perlu diperhatikan..."
                rows="3"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label for="recordKeeping">Pencatatan dan Pendataan</label>
              <Textarea
                id="recordKeeping"
                v-model="sopData.recordKeeping"
                placeholder="Dokumen dan pencatatan yang diperlukan..."
                rows="3"
                class="w-full"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Step 2: Langkah SOP -->
      <Card class="form-card" v-show="activeStep === 1">
        <template #title>
          <div class="card-title">
            <i class="pi pi-list"></i>
            Langkah-Langkah SOP
          </div>
        </template>
        <template #content>
          <StepTabularEditor
            ref="stepEditorRef"
            :initialSteps="sopData.tabularSteps"
            @steps-changed="handleStepsChanged"
          />
        </template>
      </Card>

      <!-- Step 3: Review -->
      <Card class="form-card" v-show="activeStep === 2">
        <template #title>
          <div class="card-title">
            <i class="pi pi-check-circle"></i>
            Review & Simpan
          </div>
        </template>
        <template #content>
          <div class="review-section">
            <h3>Informasi SOP</h3>
            <div class="review-item">
              <span class="review-label">Judul:</span>
              <span class="review-value">{{ sopData.title }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Department:</span>
              <span class="review-value">{{ getDepartmentName(sopData.departmentId) }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Kategori:</span>
              <span class="review-value">{{ getCategoryNames(sopData.categoryIds) }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Jumlah Langkah:</span>
              <span class="review-value">{{ sopData.tabularSteps.length }} langkah</span>
            </div>
            <div class="review-item">
              <span class="review-label">Aktor Terlibat:</span>
              <span class="review-value">{{ sopData.involvedActors.length }} aktor</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Navigation -->
      <Card class="navigation-card">
        <template #content>
          <div class="navigation-buttons">
            <Button 
              v-if="activeStep > 0"
              label="Sebelumnya" 
              icon="pi pi-arrow-left" 
              @click="prevStep"
              outlined
            />
            <div class="right-buttons">
              <Button 
                label="Batalkan" 
                icon="pi pi-times" 
                @click="handleBack"
                outlined
                severity="secondary"
              />
              <Button 
                v-if="activeStep < 2"
                label="Selanjutnya" 
                icon="pi pi-arrow-right" 
                @click="nextStep"
                :disabled="!canProceed"
              />
              <Button 
                v-if="activeStep === 2"
                label="Simpan Perubahan" 
                icon="pi pi-save" 
                @click="saveChanges"
                :loading="saving"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Confirm Dialog -->
      <Dialog v-model:visible="showConfirmDialog" modal header="Konfirmasi" :style="{ width: '30rem' }">
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--orange-500)"></i>
          <p>{{ confirmMessage }}</p>
        </div>
        <template #footer>
          <Button label="Tidak" icon="pi pi-times" @click="showConfirmDialog = false" text />
          <Button label="Ya" icon="pi pi-check" @click="confirmAction" />
        </template>
      </Dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSOPManualStore } from '@/stores/sopManual';
import { useToast } from 'primevue/usetoast';
import sopService from '@/services/sopService';
import { format, parseISO } from 'date-fns';

// PrimeVue Components
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import Chip from 'primevue/chip';
import Steps from 'primevue/steps';
import Message from 'primevue/message';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';

// Custom Components
import StepTabularEditor from '@/components/SOP/StepTabularEditor.vue';

// Composables
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const sopManualStore = useSOPManualStore();

// Refs
const stepEditorRef = ref(null);
const submitted = ref(false);
const saving = ref(false);
const loading = ref(true);
const error = ref(null);
const activeStep = ref(0);
const showConfirmDialog = ref(false);
const confirmMessage = ref('');
let confirmCallback = null;

// Tags Management
const tagInput = ref('');

// Data
const sopData = ref({
  id: null,
  sopNumber: '',
  title: '',
  description: '',
  purpose: '',
  scope: '',
  departmentId: '',
  categoryIds: [],
  involvedActors: [],
  tabularSteps: [],
  flowchartData: null,
  tags: [],
  effectiveDate: null,
  legalBasis: '',
  executorQualification: '',
  references: '',
  equipment: '',
  warnings: '',
  recordKeeping: '',
});

const departments = ref([]);
const categories = ref([]);
const actors = ref([]);
const loadingDepartments = ref(false);
const loadingCategories = ref(false);
const loadingActors = ref(false);

// Progress Steps
const progressSteps = ref([
  { label: 'Informasi Dasar' },
  { label: 'Langkah SOP' },
  { label: 'Review' }
]);

// Computed
const filteredActors = computed(() => {
  if (!actors.value || actors.value.length === 0) return [];
  
  const userDeptId = sopData.value.departmentId;
  const userId = authStore.user?.id;
  
  return actors.value.filter(actor => {
    if (!userDeptId) {
      return actor.createdById === userId;
    }
    return actor.departmentId === userDeptId || actor.createdById === userId;
  });
});

const canProceed = computed(() => {
  if (activeStep.value === 0) {
    return sopData.value.title && sopData.value.departmentId;
  }
  if (activeStep.value === 1) {
    return sopData.value.tabularSteps.length > 0;
  }
  return true;
});

// Methods
const loadSOP = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const sopId = route.params.id;
    const response = await sopService.getSOPById(sopId);
    
    if (response.success && response.data) {
      const sop = response.data;
      
      sopData.value = {
        id: sop.id,
        sopNumber: sop.sopNumber,
        title: sop.title || '',
        description: sop.description || '',
        purpose: sop.purpose || '',
        scope: sop.scope || '',
        departmentId: sop.departmentId || '',
        categoryIds: sop.categories?.map(c => c.categoryId) || [],
        involvedActors: sop.involvedActors?.map(a => a.actorId) || [],
        tabularSteps: sop.tabularSteps || [],
        flowchartData: sop.flowchartData || null,
        tags: sop.tags || [],
        effectiveDate: sop.effectiveDate ? parseISO(sop.effectiveDate) : null,
        legalBasis: sop.legalBasis || '',
        executorQualification: sop.executorQualification || '',
        references: sop.references || '',
        equipment: sop.equipment || '',
        warnings: sop.warnings || '',
        recordKeeping: sop.recordKeeping || '',
      };
      
      // Load to store
      sopManualStore.setTabularSteps(sopData.value.tabularSteps);
      if (sopData.value.flowchartData) {
        sopManualStore.setFlowchartData(sopData.value.flowchartData);
      }
    } else {
      error.value = 'SOP tidak ditemukan';
    }
  } catch (err) {
    console.error('Error loading SOP:', err);
    error.value = err.message || 'Gagal memuat data SOP';
  } finally {
    loading.value = false;
  }
};

const loadDepartments = async () => {
  try {
    loadingDepartments.value = true;
    const response = await sopService.getDepartments();
    if (response.success) {
      departments.value = response.data;
    }
  } catch (error) {
    console.error('Error loading departments:', error);
  } finally {
    loadingDepartments.value = false;
  }
};

const loadCategories = async () => {
  try {
    loadingCategories.value = true;
    const response = await sopService.getCategories();
    if (response.success) {
      categories.value = response.data;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  } finally {
    loadingCategories.value = false;
  }
};

const loadActors = async () => {
  try {
    loadingActors.value = true;
    const response = await sopService.getActors({ limit: 100, status: 'ACTIVE' });
    
    if (response.data?.data?.actors) {
      actors.value = response.data.data.actors;
    } else if (response.data?.actors) {
      actors.value = response.data.actors;
    } else if (Array.isArray(response.data)) {
      actors.value = response.data;
    } else {
      actors.value = [];
    }
  } catch (error) {
    console.error('Error loading actors:', error);
    actors.value = [];
  } finally {
    loadingActors.value = false;
  }
};

const handleStepsChanged = (steps) => {
  sopManualStore.setTabularSteps(steps);
  sopData.value.tabularSteps = steps;
};

const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !sopData.value.tags.includes(tag)) {
    sopData.value.tags.push(tag);
    tagInput.value = '';
  }
};

const removeTag = (index) => {
  sopData.value.tags.splice(index, 1);
};

const getDepartmentName = (id) => {
  const dept = departments.value.find(d => d.id === id);
  return dept ? dept.name : '-';
};

const getCategoryNames = (ids) => {
  if (!ids || ids.length === 0) return '-';
  return ids.map(id => {
    const cat = categories.value.find(c => c.id === id);
    return cat ? cat.name : '';
  }).filter(Boolean).join(', ');
};

const nextStep = () => {
  if (activeStep.value === 0) {
    submitted.value = true;
    if (!sopData.value.title || !sopData.value.departmentId) {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: 'Lengkapi informasi dasar terlebih dahulu',
        life: 3000
      });
      return;
    }
  }

  if (activeStep.value === 1) {
    if (sopData.value.tabularSteps.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: 'Tambahkan minimal 1 langkah SOP',
        life: 3000
      });
      return;
    }

    const validation = stepEditorRef.value?.validateSteps();
    if (validation && !validation.isValid) {
      toast.add({
        severity: 'error',
        summary: 'Validasi Gagal',
        detail: validation.errors[0],
        life: 5000
      });
      return;
    }
  }

  activeStep.value++;
};

const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--;
  }
};

const saveChanges = async () => {
  try {
    saving.value = true;

    sopManualStore.setTabularSteps(sopData.value.tabularSteps);
    if (sopData.value.flowchartData) {
      sopManualStore.setFlowchartData(sopData.value.flowchartData);
    }

    const result = await sopManualStore.saveSOP({
      ...sopData.value,
      effectiveDate: sopData.value.effectiveDate ? 
        format(sopData.value.effectiveDate, 'yyyy-MM-dd') : null,
    });

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Perubahan SOP berhasil disimpan',
      life: 3000
    });

    setTimeout(() => {
      router.push(`/sop/${result.id}`);
    }, 1500);

  } catch (error) {
    console.error('Error saving SOP:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal menyimpan perubahan SOP',
      life: 5000
    });
  } finally {
    saving.value = false;
  }
};

const handleBack = () => {
  confirmMessage.value = 'Ada perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?';
  showConfirmDialog.value = true;
  confirmCallback = () => {
    router.push(`/sop/${sopData.value.id}`);
  };
};

const confirmAction = () => {
  if (confirmCallback) {
    confirmCallback();
  }
  showConfirmDialog.value = false;
};

const goBack = () => {
  router.push('/sop');
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadSOP(),
    loadDepartments(),
    loadCategories(),
    loadActors()
  ]);
});
</script>

<style scoped lang="scss">
.sop-edit {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--text-color-secondary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  .page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;

    i {
      color: #3b82f6;
    }
  }

  .page-subtitle {
    color: #6b7280;
    font-size: 0.95rem;
    margin: 0.5rem 0 0 0;
  }
}

.progress-card {
  margin-bottom: 1.5rem;
}

.form-card {
  margin-bottom: 1.5rem;
  
  .card-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;

    i {
      color: #3b82f6;
    }
  }
}

.form-grid {
  display: grid;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: #374151;
    font-size: 0.95rem;

    &.required::after {
      content: ' *';
      color: #ef4444;
    }
  }

  .form-hint {
    color: #6b7280;
    font-size: 0.875rem;
    font-style: italic;
  }
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.review-section {
  .review-item {
    display: flex;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e5e7eb;
    
    &:last-child {
      border-bottom: none;
    }
    
    .review-label {
      font-weight: 500;
      color: #6b7280;
      min-width: 180px;
    }
    
    .review-value {
      color: #1f2937;
      flex: 1;
    }
  }
}

.navigation-card {
  position: sticky;
  bottom: 1rem;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .right-buttons {
    display: flex;
    gap: 0.75rem;
  }
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  
  p {
    margin: 0;
    color: #374151;
  }
}

// Actor Management Styles
.actor-management {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.actor-list-container {
  width: 100%;
  border: 2px solid var(--surface-border);
  border-radius: 8px;
  background-color: var(--surface-0);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 190px;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--text-color-secondary);
  min-height: 190px;
  
  i {
    font-size: 1.5rem;
  }
}

.actor-checkbox-list {
  height: 190px;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--surface-50);
    border-radius: 0 8px 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--surface-300);
    border-radius: 5px;
    border: 2px solid var(--surface-50);
    
    &:hover {
      background: var(--primary-400);
    }
  }
}

.actor-checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  height: 38px;
  border-bottom: 1px solid var(--surface-border);
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--surface-100);
    padding-left: 1rem;
    
    .actor-label > i {
      transform: scale(1.1);
    }
  }
  
  &.selected {
    background: linear-gradient(to right, var(--primary-50) 0%, var(--surface-0) 100%);
    border-left: 4px solid var(--primary-500);
    padding-left: calc(0.75rem - 4px);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--primary-500);
      box-shadow: 2px 0 8px rgba(var(--primary-500-rgb), 0.3);
    }
    
    .actor-text {
      color: var(--primary-600);
      font-weight: 600;
    }
    
    .actor-label > i {
      color: var(--primary-600);
    }
  }
  
  .p-checkbox {
    flex-shrink: 0;
  }
}

.actor-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  cursor: pointer;
  margin: 0;
  
  > i {
    color: var(--primary-color);
    font-size: 0.95rem;
    flex-shrink: 0;
  }
}

.actor-text {
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--text-color);
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actor-position {
  font-weight: 400;
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .sop-edit {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 0.75rem;
    
    .right-buttons {
      width: 100%;
      flex-direction: column;
      
      button {
        width: 100%;
      }
    }
  }
}
</style>
