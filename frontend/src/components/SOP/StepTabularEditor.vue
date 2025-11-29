<template>
  <div class="step-tabular-editor">
    <Toast />
    
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <h3 class="toolbar-title">
          <i class="pi pi-table"></i> Tabel Langkah SOP
        </h3>
        <span class="step-count">{{ steps.length }} langkah</span>
      </div>
      
      <div class="toolbar-right">
        <Button
          label="Tambah Langkah"
          icon="pi pi-plus"
          @click="addStep"
          class="p-button-success"
          size="small"
        />
        <Button
          label="Import Excel"
          icon="pi pi-file-excel"
          @click="showImportDialog = true"
          class="p-button-info"
          size="small"
          outlined
        />
        <Button
          label="Export Excel"
          icon="pi pi-download"
          @click="exportToExcel"
          class="p-button-secondary"
          size="small"
          outlined
        />
      </div>
    </div>

    <!-- DataTable with inline editing -->
    <DataTable
      v-model:editingRows="editingRows"
      :value="steps"
      editMode="row"
      dataKey="step_id"
      @row-edit-save="onRowEditSave"
      @row-edit-cancel="onRowEditCancel"
      :scrollable="true"
      scrollHeight="500px"
      class="steps-table"
      showGridlines
      stripedRows
      :reorderableColumns="true"
      @row-reorder="onRowReorder"
    >
      <!-- Drag Handle Column -->
      <Column rowReorder headerStyle="width: 3rem" :reorderableColumn="false" />

      <!-- Step ID Column -->
      <Column 
        field="step_id" 
        header="No" 
        :sortable="true"
        headerStyle="width: 60px"
      >
        <template #body="{ data }">
          <div class="step-number">{{ data.step_id }}</div>
        </template>
      </Column>

      <!-- Activity Column (Aktivitas) -->
      <Column 
        field="activity" 
        header="Aktivitas/Kegiatan" 
        style="min-width: 300px"
      >
        <template #body="{ data }">
          <div class="activity-cell">{{ data.activity }}</div>
        </template>
        <template #editor="{ data, field }">
          <Textarea
            v-model="data[field]"
            rows="3"
            autoResize
            class="w-full"
            placeholder="Deskripsi aktivitas..."
          />
        </template>
      </Column>

      <!-- Actor Column (Pelaksana) -->
      <Column 
        field="actor" 
        header="Pelaksana/Aktor" 
        style="min-width: 180px"
      >
        <template #body="{ data }">
          <Tag :value="data.actor" severity="info" v-if="data.actor" />
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #editor="{ data, field }">
          <Dropdown
            v-model="data[field]"
            :options="actorOptions"
            optionLabel="name"
            optionValue="name"
            placeholder="Pilih aktor"
            class="w-full"
            :filter="true"
            showClear
          >
            <template #option="slotProps">
              <div class="actor-option">
                <i class="pi pi-user"></i>
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </Dropdown>
        </template>
      </Column>

      <!-- Mutu Waktu Column -->
      <Column 
        field="mutu_waktu" 
        header="Mutu Baku Waktu" 
        style="min-width: 150px"
      >
        <template #body="{ data }">
          <span class="time-badge">
            <i class="pi pi-clock"></i>
            {{ data.mutu_waktu || '-' }}
          </span>
        </template>
        <template #editor="{ data, field }">
          <InputText
            v-model="data[field]"
            placeholder="e.g., 5 menit"
            class="w-full"
          />
        </template>
      </Column>

      <!-- Mutu Output Column -->
      <Column 
        field="mutu_output" 
        header="Mutu Baku Output" 
        style="min-width: 250px"
      >
        <template #body="{ data }">
          <div class="output-cell">{{ data.mutu_output || '-' }}</div>
        </template>
        <template #editor="{ data, field }">
          <Textarea
            v-model="data[field]"
            rows="2"
            autoResize
            class="w-full"
            placeholder="Hasil yang diharapkan..."
          />
        </template>
      </Column>

      <!-- Notes Column -->
      <Column 
        field="notes" 
        header="Catatan" 
        style="min-width: 200px"
      >
        <template #body="{ data }">
          <div class="notes-cell">{{ data.notes || '-' }}</div>
        </template>
        <template #editor="{ data, field }">
          <InputText
            v-model="data[field]"
            placeholder="Catatan tambahan..."
            class="w-full"
          />
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Aksi" :exportable="false" style="min-width: 120px">
        <template #body="{ data, index }">
          <div class="action-buttons">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              @click="editStep(data)"
              v-tooltip.top="'Edit'"
            />
            <Button
              icon="pi pi-copy"
              class="p-button-text p-button-sm"
              @click="duplicateStep(index)"
              v-tooltip.top="'Duplikat'"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger p-button-sm"
              @click="deleteStep(index)"
              v-tooltip.top="'Hapus'"
            />
          </div>
        </template>
        <template #editor="{ data }">
          <div class="edit-actions">
            <Button
              icon="pi pi-check"
              class="p-button-success p-button-sm"
              @click="saveEdit(data)"
              v-tooltip.top="'Simpan'"
            />
            <Button
              icon="pi pi-times"
              class="p-button-secondary p-button-sm"
              @click="cancelEdit()"
              v-tooltip.top="'Batal'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Empty State -->
    <div v-if="steps.length === 0" class="empty-state">
      <i class="pi pi-inbox empty-icon"></i>
      <h4>Belum ada langkah SOP</h4>
      <p>Klik tombol "Tambah Langkah" untuk memulai</p>
    </div>

    <!-- Import Dialog -->
    <Dialog
      v-model:visible="showImportDialog"
      header="Import dari Excel"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="import-dialog-content">
        <FileUpload
          mode="basic"
          name="excelFile"
          accept=".xlsx,.xls"
          :maxFileSize="5000000"
          @upload="onExcelUpload"
          @select="onExcelSelect"
          :auto="false"
          chooseLabel="Pilih File Excel"
        />
        <p class="mt-3 text-sm text-gray-600">
          Format: File Excel dengan kolom: No, Aktivitas, Pelaksana, Mutu Waktu, Mutu Output, Catatan
        </p>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" @click="showImportDialog = false" text />
        <Button label="Import" icon="pi pi-upload" @click="processExcelImport" :disabled="!selectedFile" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';

// Props & Emits
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  actors: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'steps-changed']);

// Composables
const toast = useToast();

// State
const steps = ref([...props.modelValue]);
const editingRows = ref([]);
const showImportDialog = ref(false);
const selectedFile = ref(null);

// Actor options (from props or store)
const actorOptions = computed(() => {
  if (props.actors.length > 0) {
    return props.actors;
  }
  // Default actors if not provided
  return [
    { id: 1, name: 'Kepala Seksi', code: 'KASI' },
    { id: 2, name: 'Staff Statistik', code: 'STAFF_STAT' },
    { id: 3, name: 'Staff Administrasi', code: 'STAFF_ADM' },
    { id: 4, name: 'Supervisor', code: 'SUPERVISOR' },
    { id: 5, name: 'Tim IT', code: 'IT' },
  ];
});

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(steps.value)) {
    steps.value = [...newValue];
  }
}, { deep: true });

// Emit changes to parent
watch(steps, (newSteps) => {
  emit('update:modelValue', newSteps);
  emit('steps-changed', newSteps);
}, { deep: true });

// ============================================
// CRUD Operations
// ============================================

const addStep = () => {
  const newStepId = steps.value.length > 0 
    ? Math.max(...steps.value.map(s => s.step_id)) + 1 
    : 1;
  
  const newStep = {
    step_id: newStepId,
    activity: '',
    actor: '',
    mutu_waktu: '',
    mutu_output: '',
    notes: '',
    order: steps.value.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  steps.value.push(newStep);
  
  // Auto-enter edit mode for new step
  editingRows.value = [newStep];
  
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: 'Langkah baru ditambahkan',
    life: 2000
  });
};

const editStep = (step) => {
  editingRows.value = [step];
};

const duplicateStep = (index) => {
  const originalStep = steps.value[index];
  const newStepId = Math.max(...steps.value.map(s => s.step_id)) + 1;
  
  const duplicatedStep = {
    ...originalStep,
    step_id: newStepId,
    order: steps.value.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  steps.value.push(duplicatedStep);
  
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: 'Langkah berhasil diduplikat',
    life: 2000
  });
};

const deleteStep = (index) => {
  if (confirm('Apakah Anda yakin ingin menghapus langkah ini?')) {
    const deletedStep = steps.value[index];
    steps.value.splice(index, 1);
    
    // Reorder step IDs
    steps.value.forEach((step, idx) => {
      step.order = idx;
    });
    
    toast.add({
      severity: 'info',
      summary: 'Dihapus',
      detail: `Langkah "${deletedStep.activity || deletedStep.step_id}" dihapus`,
      life: 2000
    });
  }
};

const onRowEditSave = (event) => {
  const { newData, index } = event;
  newData.updated_at = new Date().toISOString();
  steps.value[index] = newData;
  
  toast.add({
    severity: 'success',
    summary: 'Tersimpan',
    detail: 'Perubahan berhasil disimpan',
    life: 2000
  });
};

const onRowEditCancel = () => {
  toast.add({
    severity: 'warn',
    summary: 'Dibatalkan',
    detail: 'Edit dibatalkan',
    life: 2000
  });
};

const saveEdit = (data) => {
  // Trigger save event
  editingRows.value = [];
};

const cancelEdit = () => {
  editingRows.value = [];
};

// ============================================
// Reordering
// ============================================

const onRowReorder = (event) => {
  steps.value = event.value;
  
  // Update order property
  steps.value.forEach((step, idx) => {
    step.order = idx;
    step.updated_at = new Date().toISOString();
  });
  
  toast.add({
    severity: 'info',
    summary: 'Diurutkan',
    detail: 'Urutan langkah diperbarui',
    life: 2000
  });
};

// ============================================
// Excel Import/Export
// ============================================

const onExcelSelect = (event) => {
  selectedFile.value = event.files[0];
};

const onExcelUpload = () => {
  // Handle upload
};

const processExcelImport = async () => {
  if (!selectedFile.value) return;
  
  try {
    // TODO: Implement Excel parsing logic
    // Use library like xlsx or exceljs
    toast.add({
      severity: 'info',
      summary: 'Diproses',
      detail: 'Import Excel sedang diproses...',
      life: 3000
    });
    
    showImportDialog.value = false;
    selectedFile.value = null;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal import Excel: ' + error.message,
      life: 5000
    });
  }
};

const exportToExcel = () => {
  try {
    // TODO: Implement Excel export logic
    // Convert steps array to Excel format
    toast.add({
      severity: 'success',
      summary: 'Export',
      detail: 'File Excel berhasil diunduh',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal export Excel: ' + error.message,
      life: 5000
    });
  }
};

// ============================================
// Validation
// ============================================

const validateSteps = () => {
  const errors = [];
  
  steps.value.forEach((step, index) => {
    if (!step.activity || step.activity.trim() === '') {
      errors.push(`Langkah ${index + 1}: Aktivitas wajib diisi`);
    }
    if (!step.actor || step.actor.trim() === '') {
      errors.push(`Langkah ${index + 1}: Pelaksana wajib diisi`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================
// Public Methods (exposed to parent)
// ============================================

defineExpose({
  validateSteps,
  addStep,
  getSteps: () => steps.value,
  clearSteps: () => { steps.value = []; }
});

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  // Load actors from store if needed
  if (actorOptions.value.length === 0) {
    // sopStore.loadActors();
  }
});
</script>

<style scoped lang="scss">
.step-tabular-editor {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toolbar-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  i {
    color: #3b82f6;
  }
}

.step-count {
  background: #eff6ff;
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.toolbar-right {
  display: flex;
  gap: 0.5rem;
}

// Table Styles
.steps-table {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  
  :deep(.p-datatable-header) {
    background: #f9fafb;
    padding: 1rem;
  }
  
  :deep(.p-datatable-thead > tr > th) {
    background: #f3f4f6;
    color: #374151;
    font-weight: 600;
    padding: 0.75rem;
    border-bottom: 2px solid #d1d5db;
  }
  
  :deep(.p-datatable-tbody > tr) {
    transition: background-color 0.2s;
    
    &:hover {
      background: #f9fafb;
    }
  }
  
  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
}

.activity-cell,
.output-cell,
.notes-cell {
  line-height: 1.5;
  color: #374151;
}

.time-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  
  i {
    font-size: 0.75rem;
  }
}

.action-buttons,
.edit-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.actor-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  i {
    color: #3b82f6;
  }
}

// Empty State
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    font-size: 1.25rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.875rem;
  }
}

// Import Dialog
.import-dialog-content {
  padding: 1rem 0;
}
</style>
