<template>
  <div class="sop-create">
    <Toast />
    
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="pi pi-file-plus"></i>
          Buat SOP Baru
        </h1>
        <p class="page-subtitle">Mode Manual/Basic - Input Langkah SOP</p>
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
              <Button
                label="Tambah Aktor Baru"
                icon="pi pi-plus"
                @click="showAddActorDialog = true"
                class="p-button-outlined p-button-sm mt-2"
                type="button"
              />
            </div>
            <small class="form-hint">
              <i class="pi pi-info-circle"></i>
              Pilih aktor yang akan terlibat. Daftar menampilkan aktor dari department Anda dan yang pernah Anda tambahkan.
            </small>
          </div>

          <!-- Tujuan -->
          <div class="form-field">
            <label for="purpose">Tujuan SOP</label>
            <Textarea
              id="purpose"
              v-model="sopData.purpose"
              placeholder="Jelaskan tujuan dari SOP ini..."
              rows="3"
              autoResize
              class="w-full"
            />
          </div>

          <!-- Ruang Lingkup -->
          <div class="form-field">
            <label for="scope">Ruang Lingkup</label>
            <Textarea
              id="scope"
              v-model="sopData.scope"
              placeholder="Jelaskan ruang lingkup penerapan SOP..."
              rows="3"
              autoResize
              class="w-full"
            />
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

          <!-- Dasar Hukum -->
          <div class="form-field">
            <label for="legalBasis">Dasar Hukum</label>
            <Textarea
              id="legalBasis"
              v-model="sopData.legalBasis"
              placeholder="Contoh: UU No. 16 Tahun 1997, PP No. 51 Tahun 1999..."
              rows="3"
              autoResize
              class="w-full"
            />
            <small class="form-hint">Sebutkan peraturan/undang-undang yang menjadi dasar SOP ini</small>
          </div>

          <!-- Kualifikasi Pelaksana -->
          <div class="form-field">
            <label for="executorQualification">Kualifikasi Pelaksana</label>
            <Textarea
              id="executorQualification"
              v-model="sopData.executorQualification"
              placeholder="Contoh: Minimal D3, memiliki sertifikat..."
              rows="3"
              autoResize
              class="w-full"
            />
            <small class="form-hint">Jelaskan kualifikasi/kompetensi yang dibutuhkan pelaksana SOP</small>
          </div>

          <!-- Keterkaitan -->
          <div class="form-field">
            <label for="references">Keterkaitan</label>
            <Textarea
              id="references"
              v-model="sopData.references"
              placeholder="Contoh: SOP terkait, dokumen referensi..."
              rows="3"
              autoResize
              class="w-full"
            />
            <small class="form-hint">Sebutkan SOP lain atau dokumen yang terkait/berkaitan</small>
          </div>

          <!-- Peralatan/Perlengkapan -->
          <div class="form-field">
            <label for="equipment">Peralatan/Perlengkapan</label>
            <Textarea
              id="equipment"
              v-model="sopData.equipment"
              placeholder="Contoh: Komputer, printer, formulir, software..."
              rows="3"
              autoResize
              class="w-full"
            />
            <small class="form-hint">Daftar peralatan dan perlengkapan yang dibutuhkan</small>
          </div>

          <!-- Peringatan -->
          <div class="form-field">
            <label for="warnings">Peringatan</label>
            <Textarea
              id="warnings"
              v-model="sopData.warnings"
              placeholder="Contoh: Hati-hati dalam pengisian data, pastikan backup data..."
              rows="3"
              autoResize
              class="w-full"
            />
            <small class="form-hint">Hal-hal penting yang perlu diperhatikan atau diwaspadai</small>
          </div>

          <!-- Pencatatan dan Pendataan -->
          <div class="form-field">
            <label for="recordKeeping">Pencatatan dan Pendataan</label>
            <Textarea
              id="recordKeeping"
              v-model="sopData.recordKeeping"
              placeholder="Contoh: Catat di logbook, arsipkan dokumen, entry ke database..."
              rows="3"
              autoResize
              class="w-full"
            />
            <small class="form-hint">Jelaskan sistem pencatatan dan pendataan yang digunakan</small>
          </div>
        </div>
      </template>
    </Card>

    <!-- Step 2: Langkah-langkah SOP (Tabular) -->
    <Card class="form-card" v-show="activeStep === 1">
      <template #title>
        <div class="card-title">
          <i class="pi pi-list"></i>
          Langkah-langkah SOP
        </div>
      </template>
      <template #content>
        <Message severity="info" :closable="false" class="mb-4">
          <strong>Petunjuk:</strong> Tambahkan langkah-langkah SOP secara berurutan. 
          Setiap langkah harus memiliki aktivitas dan pelaksana yang jelas.
        </Message>

        <StepTabularEditor
          ref="stepEditorRef"
          v-model="sopData.tabularSteps"
          :actors="actors"
          @steps-changed="handleStepsChanged"
        />

        <div class="step-summary mt-4" v-if="sopData.tabularSteps.length > 0">
          <Panel header="Ringkasan Langkah" :toggleable="true">
            <div class="summary-stats">
              <div class="stat-item">
                <i class="pi pi-check-circle"></i>
                <span class="stat-label">Total Langkah:</span>
                <span class="stat-value">{{ sopData.tabularSteps.length }}</span>
              </div>
              <div class="stat-item">
                <i class="pi pi-users"></i>
                <span class="stat-label">Jumlah Aktor:</span>
                <span class="stat-value">{{ uniqueActors }}</span>
              </div>
            </div>
          </Panel>
        </div>
      </template>
    </Card>

    <!-- Step 3: Flowchart (Optional) -->
    <Card class="form-card" v-show="activeStep === 2">
      <template #title>
        <div class="card-title">
          <i class="pi pi-sitemap"></i>
          Visualisasi Flowchart
        </div>
      </template>
      <template #content>
        <Message severity="info" :closable="false" class="mb-4">
          Flowchart akan dibuat otomatis berdasarkan langkah-langkah yang telah Anda input.
          Anda dapat melewati tahap ini dan melanjutkan ke review.
        </Message>

        <div class="flowchart-actions">
          <Button
            label="Generate Flowchart Otomatis"
            icon="pi pi-cog"
            @click="generateFlowchart"
            :disabled="sopData.tabularSteps.length === 0"
            class="p-button-success"
          />
        </div>

        <div v-if="sopData.flowchartData" class="flowchart-preview mt-4">
          <Panel header="Preview Flowchart">
            <div class="flowchart-info">
              <p><strong>Nodes:</strong> {{ sopData.flowchartData.nodes?.length || 0 }}</p>
              <p><strong>Connections:</strong> {{ sopData.flowchartData.connections?.length || 0 }}</p>
              <p><strong>Version:</strong> {{ sopData.flowchartData.version }}</p>
            </div>
            <Message severity="success" :closable="false" class="mt-3">
              Flowchart berhasil dibuat! Data flowchart akan disimpan bersama SOP.
            </Message>
          </Panel>
        </div>

        <div v-else class="empty-flowchart">
          <i class="pi pi-image empty-icon"></i>
          <p>Belum ada flowchart. Klik tombol "Generate Flowchart" untuk membuatnya.</p>
        </div>
      </template>
    </Card>

    <!-- Step 4: Review & Submit -->
    <Card class="form-card" v-show="activeStep === 3">
      <template #title>
        <div class="card-title">
          <i class="pi pi-eye"></i>
          Review & Submit
        </div>
      </template>
      <template #content>
        <Message severity="warn" :closable="false" class="mb-4">
          Periksa kembali semua informasi sebelum menyimpan SOP.
        </Message>

        <div class="review-section">
          <Panel header="Informasi Dasar" :toggleable="true">
            <div class="review-item">
              <span class="review-label">Judul:</span>
              <span class="review-value">{{ sopData.title || '-' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Department:</span>
              <span class="review-value">
                {{ departments.find(d => d.id === sopData.departmentId)?.name || '-' }}
              </span>
            </div>
            <div class="review-item">
              <span class="review-label">Kategori:</span>
              <span class="review-value">
                <Tag 
                  v-for="catId in sopData.categoryIds" 
                  :key="catId"
                  :value="categories.find(c => c.id === catId)?.name"
                  class="mr-2"
                />
                <span v-if="sopData.categoryIds.length === 0">-</span>
              </span>
            </div>
            <div class="review-item">
              <span class="review-label">Aktor yang Terlibat:</span>
              <span class="review-value">
                <Tag 
                  v-for="actorId in sopData.involvedActors" 
                  :key="actorId"
                  :value="actors.find(a => a.id === actorId)?.name"
                  icon="pi pi-user"
                  class="mr-2"
                  severity="info"
                />
                <span v-if="sopData.involvedActors.length === 0">-</span>
              </span>
            </div>
            <div class="review-item">
              <span class="review-label">Tanggal Efektif:</span>
              <span class="review-value">
                {{ sopData.effectiveDate ? formatDate(sopData.effectiveDate) : '-' }}
              </span>
            </div>
            <div class="review-item" v-if="sopData.legalBasis">
              <span class="review-label">Dasar Hukum:</span>
              <span class="review-value">{{ sopData.legalBasis }}</span>
            </div>
            <div class="review-item" v-if="sopData.executorQualification">
              <span class="review-label">Kualifikasi Pelaksana:</span>
              <span class="review-value">{{ sopData.executorQualification }}</span>
            </div>
            <div class="review-item" v-if="sopData.references">
              <span class="review-label">Keterkaitan:</span>
              <span class="review-value">{{ sopData.references }}</span>
            </div>
            <div class="review-item" v-if="sopData.equipment">
              <span class="review-label">Peralatan/Perlengkapan:</span>
              <span class="review-value">{{ sopData.equipment }}</span>
            </div>
            <div class="review-item" v-if="sopData.warnings">
              <span class="review-label">Peringatan:</span>
              <span class="review-value">{{ sopData.warnings }}</span>
            </div>
            <div class="review-item" v-if="sopData.recordKeeping">
              <span class="review-label">Pencatatan dan Pendataan:</span>
              <span class="review-value">{{ sopData.recordKeeping }}</span>
            </div>
          </Panel>

          <Panel header="Langkah-langkah SOP" :toggleable="true" class="mt-3">
            <div class="review-item">
              <span class="review-label">Jumlah Langkah:</span>
              <span class="review-value">{{ sopData.tabularSteps.length }} langkah</span>
            </div>
            <div class="review-item">
              <span class="review-label">Aktor Terlibat:</span>
              <span class="review-value">{{ uniqueActors }} aktor</span>
            </div>
            <DataTable 
              :value="sopData.tabularSteps" 
              class="mt-3"
              :paginator="true"
              :rows="5"
              stripedRows
            >
              <Column field="step_id" header="No" style="width: 60px"></Column>
              <Column field="activity" header="Aktivitas"></Column>
              <Column field="actor" header="Pelaksana"></Column>
              <Column field="mutu_waktu" header="Waktu"></Column>
            </DataTable>
          </Panel>

          <Panel header="Flowchart" :toggleable="true" class="mt-3">
            <div class="review-item">
              <span class="review-label">Status Flowchart:</span>
              <span class="review-value">
                <Tag 
                  :value="sopData.flowchartData ? 'Sudah dibuat' : 'Belum dibuat'"
                  :severity="sopData.flowchartData ? 'success' : 'warn'"
                />
              </span>
            </div>
          </Panel>
        </div>
      </template>
    </Card>

    <!-- Navigation Buttons -->
    <Card class="navigation-card">
      <template #content>
        <div class="navigation-buttons">
          <Button
            label="Sebelumnya"
            icon="pi pi-chevron-left"
            @click="prevStep"
            :disabled="activeStep === 0"
            class="p-button-secondary"
          />
          
          <div class="right-buttons">
            <Button
              label="Simpan Draft"
              icon="pi pi-save"
              @click="saveDraft"
              :loading="saving"
              class="p-button-secondary"
              outlined
            />
            
            <Button
              v-if="activeStep < 3"
              label="Selanjutnya"
              icon="pi pi-chevron-right"
              iconPos="right"
              @click="nextStep"
              :disabled="!canProceed"
            />
            
            <Button
              v-if="activeStep === 3"
              label="Submit untuk Review"
              icon="pi pi-check"
              @click="submitForReview"
              :loading="saving"
              class="p-button-success"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Confirmation Dialog -->
    <Dialog
      v-model:visible="showConfirmDialog"
      header="Konfirmasi"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--orange-500)"></i>
        <p>{{ confirmMessage }}</p>
      </div>
      <template #footer>
        <Button label="Tidak" icon="pi pi-times" @click="showConfirmDialog = false" text />
        <Button label="Ya" icon="pi pi-check" @click="confirmAction" />
      </template>
    </Dialog>

    <!-- Add Actor Dialog -->
    <Dialog
      v-model:visible="showAddActorDialog"
      header="Tambah Aktor/Pelaksana Baru"
      :modal="true"
      :closable="true"
      :style="{ width: '500px' }"
    >
      <div class="add-actor-form">
        <div class="form-field">
          <label for="actorName" class="required">Nama Aktor</label>
          <InputText
            id="actorName"
            v-model="newActorName"
            placeholder="Contoh: Staff Administrasi"
            class="w-full"
            @keyup.enter="addNewActor"
          />
        </div>
        <div class="form-field mt-3">
          <label for="actorPosition">Jabatan/Posisi</label>
          <InputText
            id="actorPosition"
            v-model="newActorPosition"
            placeholder="Contoh: Staff"
            class="w-full"
            @keyup.enter="addNewActor"
          />
        </div>
        <Message severity="info" :closable="false" class="mt-3">
          Aktor baru akan ditambahkan ke daftar dan dapat digunakan untuk SOP ini.
        </Message>
      </div>
      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          @click="cancelAddActor"
          text
        />
        <Button
          label="Tambah"
          icon="pi pi-check"
          @click="addNewActor"
          :loading="addingActor"
          :disabled="!newActorName"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useSOPManualStore } from '@/stores/sopManual';
import { useAuthStore } from '@/stores/auth';
import sopService from '@/services/sopService';
import { format } from 'date-fns';

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
import Panel from 'primevue/panel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';

// Custom Components
import StepTabularEditor from '@/components/SOP/StepTabularEditor.vue';

// Composables
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const sopManualStore = useSOPManualStore();

// Refs
const stepEditorRef = ref(null);
const submitted = ref(false);
const saving = ref(false);
const activeStep = ref(0);
const showConfirmDialog = ref(false);
const confirmMessage = ref('');
let confirmCallback = null;

// Actor Management
const showAddActorDialog = ref(false);
const newActorName = ref('');
const newActorPosition = ref('');
const addingActor = ref(false);

// Tags Management
const tagInput = ref('');

// Data
const sopData = ref({
  title: '',
  description: '',
  purpose: '',
  scope: '',
  departmentId: '',
  categoryIds: [],
  involvedActors: [],       // Aktor yang terlibat
  tabularSteps: [],
  flowchartData: null,
  tags: [],
  effectiveDate: null,
  // Field tambahan
  legalBasis: '',           // Dasar Hukum
  executorQualification: '', // Kualifikasi Pelaksana
  references: '',           // Keterkaitan
  equipment: '',            // Peralatan/Perlengkapan
  warnings: '',             // Peringatan
  recordKeeping: '',        // Pencatatan dan Pendataan
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
  { label: 'Flowchart' },
  { label: 'Review' }
]);

// Computed
const uniqueActors = computed(() => {
  const actorSet = new Set(sopData.value.tabularSteps.map(step => step.actor));
  return actorSet.size;
});

// Filter actors: show only actors from user's department or created by user
const filteredActors = computed(() => {
  if (!actors.value || actors.value.length === 0) return [];
  
  const userDeptId = sopData.value.departmentId;
  const userId = authStore.user?.id;
  
  // Filter: aktor dari department yang dipilih atau yang dibuat oleh user ini
  return actors.value.filter(actor => {
    // Jika belum pilih department, tampilkan semua yang dibuat user
    if (!userDeptId) {
      return actor.createdById === userId;
    }
    
    // Tampilkan aktor dari department yang dipilih atau yang dibuat user
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
const loadDepartments = async () => {
  try {
    loadingDepartments.value = true;
    const response = await sopService.getDepartments();
    if (response.success) {
      departments.value = response.data;
    }
  } catch (error) {
    console.error('Error loading departments:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data department',
      life: 3000
    });
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
    
    const response = await sopService.getActors({
      limit: 100, // Load banyak actors
      status: 'ACTIVE'
    });
    
    console.log('Actors loaded:', response.data);
    
    if (response.data?.data?.actors) {
      actors.value = response.data.data.actors;
    } else if (response.data?.actors) {
      actors.value = response.data.actors;
    } else if (Array.isArray(response.data)) {
      actors.value = response.data;
    } else {
      console.warn('Unexpected actors response format:', response.data);
      actors.value = [];
    }
    
    console.log('Actors array:', actors.value);
  } catch (error) {
    console.error('Error loading actors:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data aktor',
      life: 3000
    });
    // Fallback to empty array
    actors.value = [];
  } finally {
    loadingActors.value = false;
  }
};

const handleStepsChanged = (steps) => {
  sopManualStore.setTabularSteps(steps);
};

// ============================================
// ACTOR MANAGEMENT
// ============================================

const addNewActor = async () => {
  if (!newActorName.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'Nama aktor wajib diisi',
      life: 3000
    });
    return;
  }

  try {
    addingActor.value = true;

    // Create actor via API
    console.log('Creating actor with data:', {
      name: newActorName.value.trim(),
      position: newActorPosition.value.trim() || null,
      departmentId: sopData.value.departmentId || null,
      isActive: true
    });
    
    const response = await sopService.createActor({
      name: newActorName.value.trim(),
      position: newActorPosition.value.trim() || null,
      departmentId: sopData.value.departmentId || null,
      isActive: true
      // code will be auto-generated by backend
      // createdById will be set from auth token in backend
    });

    console.log('Actor created successfully:', response.data);

    // Add to local actors list
    const newActor = response.data.actor || response.data;
    actors.value.push(newActor);

    // Auto-select the new actor
    const actorId = newActor.id;
    if (!sopData.value.involvedActors.includes(actorId)) {
      sopData.value.involvedActors.push(actorId);
    }

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `Aktor "${newActorName.value}" berhasil ditambahkan`,
      life: 3000
    });

    // Reset and close dialog
    cancelAddActor();

  } catch (error) {
    console.error('Error adding actor - Full error:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.response?.data);
    
    const errorMessage = error.response?.data?.error?.message 
      || error.response?.data?.message 
      || error.message 
      || 'Gagal menambahkan aktor';
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    });
  } finally {
    addingActor.value = false;
  }
};

const cancelAddActor = () => {
  showAddActorDialog.value = false;
  newActorName.value = '';
  newActorPosition.value = '';
};

// ============================================
// TAGS MANAGEMENT
// ============================================

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

// ============================================
// FLOWCHART
// ============================================

const generateFlowchart = () => {
  if (sopData.value.tabularSteps.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'Tambahkan langkah SOP terlebih dahulu',
      life: 3000
    });
    return;
  }

  sopManualStore.setTabularSteps(sopData.value.tabularSteps);
  sopManualStore.generateFlowchartFromSteps();
  sopData.value.flowchartData = sopManualStore.flowchartData;

  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: 'Flowchart berhasil dibuat',
    life: 3000
  });
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

    // Validate steps
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

const saveDraft = async () => {
  try {
    saving.value = true;

    // Validate basic info
    if (!sopData.value.title || !sopData.value.departmentId) {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: 'Judul dan Department wajib diisi',
        life: 3000
      });
      return;
    }

    // Prepare data
    sopManualStore.setTabularSteps(sopData.value.tabularSteps);
    if (sopData.value.flowchartData) {
      sopManualStore.setFlowchartData(sopData.value.flowchartData);
    }

    // Save to backend
    const result = await sopManualStore.saveSOP({
      ...sopData.value,
      status: 'DRAFT', // Explicitly set status as DRAFT
      effectiveDate: sopData.value.effectiveDate ? 
        format(sopData.value.effectiveDate, 'yyyy-MM-dd') : null,
    });

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'SOP berhasil disimpan sebagai draft',
      life: 3000
    });

    // Redirect to SOP detail
    setTimeout(() => {
      router.push(`/sop/${result.id}`);
    }, 1500);

  } catch (error) {
    console.error('Error saving SOP:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal menyimpan SOP',
      life: 5000
    });
  } finally {
    saving.value = false;
  }
};

const submitForReview = async () => {
  confirmMessage.value = 'Apakah Anda yakin ingin submit SOP ini untuk review? SOP akan dikirim ke supervisor untuk ditinjau.';
  showConfirmDialog.value = true;
  confirmCallback = async () => {
    try {
      saving.value = true;

      // Validate all
      const validation = sopManualStore.validate();
      if (!validation.isValid) {
        toast.add({
          severity: 'error',
          summary: 'Validasi Gagal',
          detail: validation.errors[0].message,
          life: 5000
        });
        return;
      }

      // Save with status REVIEW
      sopManualStore.setTabularSteps(sopData.value.tabularSteps);
      if (sopData.value.flowchartData) {
        sopManualStore.setFlowchartData(sopData.value.flowchartData);
      }

      const result = await sopManualStore.saveSOP({
        ...sopData.value,
        status: 'REVIEW',
        effectiveDate: sopData.value.effectiveDate ? 
          format(sopData.value.effectiveDate, 'yyyy-MM-dd') : null,
      });

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'SOP berhasil disubmit untuk review',
        life: 3000
      });

      setTimeout(() => {
        router.push(`/sop/${result.id}`);
      }, 1500);

    } catch (error) {
      console.error('Error submitting SOP:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Gagal submit SOP',
        life: 5000
      });
    } finally {
      saving.value = false;
      showConfirmDialog.value = false;
    }
  };
};

const confirmAction = () => {
  if (confirmCallback) {
    confirmCallback();
  }
};

const handleBack = () => {
  if (sopManualStore.isDirty) {
    confirmMessage.value = 'Ada perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?';
    showConfirmDialog.value = true;
    confirmCallback = () => {
      sopManualStore.reset();
      router.push('/sop');
    };
  } else {
    router.push('/sop');
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMMM yyyy');
};

// Lifecycle
onMounted(async () => {
  console.log('🟢 SOPCreate component mounted successfully!');
  console.log('Loading data: departments, categories, actors...');
  
  await Promise.all([
    loadDepartments(),
    loadCategories(),
    loadActors()
  ]);

  console.log('✅ Data loaded:', {
    departments: departments.value.length,
    categories: categories.value.length,
    actors: actors.value.length
  });

  // Try to restore auto-save
  if (sopManualStore.restoreFromAutoSave()) {
    toast.add({
      severity: 'info',
      summary: 'Draft Dipulihkan',
      detail: 'Draft SOP sebelumnya berhasil dipulihkan',
      life: 3000
    });
    sopData.value.tabularSteps = sopManualStore.tabularSteps;
    sopData.value.flowchartData = sopManualStore.flowchartData;
  }
});
</script>

<style scoped lang="scss">
.sop-create {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
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

.step-summary {
  .summary-stats {
    display: flex;
    gap: 2rem;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      i {
        color: #10b981;
        font-size: 1.25rem;
      }
      
      .stat-label {
        color: #6b7280;
        font-size: 0.95rem;
      }
      
      .stat-value {
        font-weight: 600;
        color: #1f2937;
        font-size: 1.1rem;
      }
    }
  }
}

.flowchart-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.flowchart-info {
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 6px;
  
  p {
    margin: 0.5rem 0;
  }
}

.empty-flowchart {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 0.95rem;
  }
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

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .sop-create {
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

// ============================================
// ACTOR MANAGEMENT STYLES
// ============================================

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
  min-height: 190px; // Reserve space for 5 compact items
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
  height: 190px; // Exactly 5 compact items (38px per item)
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
  height: 38px; // Compact height
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
    
    .actor-name {
      color: var(--primary-600);
      font-weight: 600;
    }
    
    .actor-label > i {
      color: var(--primary-600);
    }
  }
  
  .p-checkbox {
    flex-shrink: 0;
    
    .p-checkbox-box {
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--primary-500);
      }
    }
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

.actor-selector {
  width: 100%;

  :deep(.actor-multiselect) {
    width: 100%;
    
    .p-multiselect {
      width: 100%;
      min-height: 3rem;
    }

    .p-multiselect-label {
      width: 100%;
      padding: 0.75rem;
    }
  }
}

.selected-actors-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.selected-actor-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: var(--surface-50);
  border-left: 3px solid var(--primary-color);
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--surface-100);
    transform: translateX(2px);
  }

  i {
    color: var(--primary-color);
    font-size: 1rem;
    flex-shrink: 0;
  }

  .actor-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-color);
  }

  .actor-position {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    font-style: italic;
  }
}

.placeholder-text {
  color: var(--text-color-secondary);
  font-size: 0.95rem;
}

.actor-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  width: 100%;

  i {
    color: var(--primary-color);
    font-size: 1rem;
    flex-shrink: 0;
  }

  .actor-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;

    .actor-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-color);
    }

    .actor-position {
      color: var(--text-color-secondary);
      font-size: 0.85rem;
    }
  }
}

:deep(.p-multiselect-panel) {
  .p-multiselect-items {
    .p-multiselect-item {
      padding: 0.75rem 1rem;
      
      &:hover {
        background-color: var(--surface-100);
      }
    }
  }
}

.actor-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  i {
    font-size: 0.875rem;
  }
}

.add-actor-form {
  .form-field {
    margin-bottom: 0;
  }
  
  label {
    font-weight: 500;
    color: #374151;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    
    &.required::after {
      content: ' *';
      color: #ef4444;
    }
  }
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  
  p {
    margin: 0;
    font-size: 1rem;
    color: #374151;
  }
}
</style>

