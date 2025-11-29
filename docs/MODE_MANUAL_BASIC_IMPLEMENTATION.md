# 📋 Mode Manual/Basic - Implementation Guide

## Overview

Mode Manual/Basic memungkinkan pembuatan SOP melalui dua komponen input utama:

1. **Tabel Langkah (Excel-like Grid):** Input data langkah SOP secara tabular
2. **Flowchart Canvas:** Visualisasi flowchart berdasarkan tabel langkah

## 🗄️ Database Schema

### Prisma Schema Changes

```prisma
model SOPDocument {
  // ... existing fields ...

  // Mode Manual/Basic: Tabular Steps & Flowchart Data
  tabularSteps        Json?             @map("tabular_steps") @db.JsonB
  flowchartData       Json?             @map("flowchart_data") @db.JsonB
}

model SOPVersion {
  // ... existing fields ...

  // Mode Manual/Basic: Version-specific data
  tabularSteps      Json?         @map("tabular_steps") @db.JsonB
  flowchartData     Json?         @map("flowchart_data") @db.JsonB
}
```

### JSON Structure

#### Tabular Steps (Array of Objects)

```json
[
  {
    "step_id": 1,
    "activity": "Menerima permohonan data dari pemohon",
    "actor": "Staff Administrasi",
    "mutu_waktu": "5 menit",
    "mutu_output": "Form permohonan terverifikasi",
    "notes": "Periksa kelengkapan dokumen",
    "order": 0,
    "is_decision": false,
    "created_at": "2025-11-15T10:00:00Z",
    "updated_at": "2025-11-15T10:00:00Z"
  },
  {
    "step_id": 2,
    "activity": "Validasi kelengkapan dokumen",
    "actor": "Kepala Seksi",
    "mutu_waktu": "10 menit",
    "mutu_output": "Dokumen tervalidasi",
    "notes": "",
    "order": 1,
    "is_decision": true,
    "created_at": "2025-11-15T10:05:00Z",
    "updated_at": "2025-11-15T10:05:00Z"
  }
]
```

#### Flowchart Data (Object)

```json
{
  "version": "1.0.0",
  "nodes": [
    {
      "id": "start_1",
      "type": "start",
      "label": "Mulai",
      "position": { "x": 100, "y": 50 },
      "size": { "width": 80, "height": 80 }
    },
    {
      "id": "task_1",
      "type": "task",
      "label": "Menerima permohonan",
      "poolId": "Staff Administrasi",
      "position": { "x": 100, "y": 150 },
      "data": {
        "step_id": 1,
        "actor": "Staff Administrasi",
        "description": "Menerima permohonan data dari pemohon"
      }
    },
    {
      "id": "decision_1",
      "type": "decision",
      "label": "Dokumen lengkap?",
      "position": { "x": 100, "y": 250 },
      "data": {
        "step_id": 2
      }
    },
    {
      "id": "end_1",
      "type": "end",
      "label": "Selesai",
      "position": { "x": 100, "y": 450 }
    }
  ],
  "connections": [
    {
      "id": "conn_1",
      "type": "sequence",
      "sourceId": "start_1",
      "targetId": "task_1"
    },
    {
      "id": "conn_2",
      "type": "sequence",
      "sourceId": "task_1",
      "targetId": "decision_1"
    },
    {
      "id": "conn_3",
      "type": "conditional",
      "sourceId": "decision_1",
      "targetId": "end_1",
      "label": "Ya"
    }
  ],
  "metadata": {
    "created_by": "user_123",
    "created_at": "2025-11-15T10:00:00Z",
    "canvas_size": { "width": 1200, "height": 800 },
    "zoom_level": 1.0
  }
}
```

## 🔧 Migration

### Run Prisma Migration

```bash
cd backend

# Generate migration
npx prisma migrate dev --name add_manual_mode_columns

# Or run SQL directly
psql -U sop_user -d sop_management -f prisma/migrations/add_manual_mode_columns.sql

# Generate Prisma Client
npx prisma generate
```

## 📝 TypeScript Types

File: `frontend/src/types/sop.types.ts`

```typescript
export interface ISOPStep {
  step_id: number;
  activity: string;
  actor: string;
  mutu_waktu: string;
  mutu_output: string;
  notes: string;
  order: number;
  parent_id?: number | null;
  is_decision?: boolean;
  is_subprocess?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IFlowchartNode {
  id: string;
  type: FlowchartNodeType;
  label: string;
  poolId?: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  data?: any;
}

export interface IFlowchartData {
  version: string;
  nodes: IFlowchartNode[];
  connections: IFlowchartConnection[];
  metadata?: any;
}
```

## 🎨 Frontend Components

### 1. StepTabularEditor.vue

**Location:** `frontend/src/components/SOP/StepTabularEditor.vue`

**Features:**

- Excel-like DataTable with inline editing
- Drag & drop reordering
- Add/Edit/Delete/Duplicate steps
- Actor dropdown selection
- Import/Export Excel
- Validation

**Usage:**

```vue
<template>
  <StepTabularEditor
    v-model="steps"
    :actors="actorList"
    @steps-changed="handleStepsChanged"
  />
</template>

<script setup>
import { ref } from "vue";
import StepTabularEditor from "@/components/SOP/StepTabularEditor.vue";

const steps = ref([]);
const actorList = ref([
  { id: 1, name: "Kepala Seksi" },
  { id: 2, name: "Staff Statistik" },
]);

const handleStepsChanged = (newSteps) => {
  console.log("Steps updated:", newSteps);
};
</script>
```

### 2. SOPManual Store (Pinia)

**Location:** `frontend/src/stores/sopManual.ts`

**Key Methods:**

```typescript
// Add step
sopManualStore.addStep({
  activity: "New activity",
  actor: "Staff",
  mutu_waktu: "5 minutes",
  mutu_output: "Output expected",
});

// Update step
sopManualStore.updateStep(stepId, { activity: "Updated" });

// Delete step
sopManualStore.deleteStep(stepId);

// Generate flowchart
sopManualStore.generateFlowchartFromSteps();

// Validate
const validation = sopManualStore.validate();

// Save to backend
await sopManualStore.saveSOP({
  title: "My SOP",
  departmentId: "dept_123",
});
```

## 🔌 Backend API

### Controller: `sopManual.controller.js`

#### Create SOP

**Endpoint:** `POST /api/sop`

**Request Body:**

```json
{
  "title": "SOP Pelayanan Data",
  "description": "Prosedur pelayanan permintaan data",
  "purpose": "Memberikan pelayanan data yang cepat",
  "scope": "Seluruh unit IPDS",
  "departmentId": "uuid-department",
  "categoryIds": ["uuid-cat-1", "uuid-cat-2"],
  "tabularSteps": [
    {
      "step_id": 1,
      "activity": "Terima permohonan",
      "actor": "Staff Admin",
      "mutu_waktu": "5 menit",
      "mutu_output": "Form terverifikasi",
      "notes": "",
      "order": 0
    }
  ],
  "flowchartData": {
    "version": "1.0.0",
    "nodes": [...],
    "connections": [...]
  },
  "tags": ["pelayanan", "data"],
  "effectiveDate": "2025-12-01"
}
```

**Response:**

```json
{
  "success": true,
  "message": "SOP created successfully",
  "data": {
    "id": "uuid-sop",
    "sopNumber": "SOP/IPDS/2025/001",
    "title": "SOP Pelayanan Data",
    "tabularSteps": [...],
    "flowchartData": {...},
    "currentVersion": {
      "versionNumber": 1,
      "tabularSteps": [...],
      "flowchartData": {...}
    }
  }
}
```

#### Update SOP

**Endpoint:** `PUT /api/sop/:id`

**Request Body:**

```json
{
  "title": "Updated Title",
  "tabularSteps": [...],
  "flowchartData": {...},
  "changeLog": "Added new steps",
  "changeReason": "Process improvement"
}
```

#### Get SOP

**Endpoint:** `GET /api/sop/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "sopNumber": "SOP/IPDS/2025/001",
    "title": "SOP Title",
    "tabularSteps": [...],  // JSONB parsed to array
    "flowchartData": {...}, // JSONB parsed to object
    "department": {...},
    "versions": [...]
  }
}
```

## 🧪 Validation Logic

### Backend Validation

```javascript
// Validate tabular steps
function validateTabularSteps(steps) {
  const errors = [];

  steps.forEach((step, index) => {
    if (!step.step_id) {
      errors.push(`Step ${index}: step_id required`);
    }
    if (!step.activity || step.activity.trim() === "") {
      errors.push(`Step ${index}: activity required`);
    }
    if (!step.actor || step.actor.trim() === "") {
      errors.push(`Step ${index}: actor required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate flowchart
function validateFlowchartData(flowchart) {
  const errors = [];

  if (!flowchart.version) {
    errors.push("Flowchart version required");
  }
  if (!Array.isArray(flowchart.nodes)) {
    errors.push("Nodes must be an array");
  }
  if (!Array.isArray(flowchart.connections)) {
    errors.push("Connections must be an array");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### Frontend Validation

```typescript
// In Pinia store
validate(): ISOPValidationResult {
  const errors: any[] = [];
  const warnings: any[] = [];

  if (this.tabularSteps.length === 0) {
    errors.push({
      field: 'tabularSteps',
      message: 'Minimal 1 langkah diperlukan',
      type: 'error'
    });
  }

  this.tabularSteps.forEach((step, index) => {
    if (!step.activity.trim()) {
      errors.push({
        field: `tabularSteps[${index}].activity`,
        message: `Langkah ${index + 1}: Aktivitas wajib diisi`,
        type: 'error'
      });
    }

    if (!step.mutu_waktu) {
      warnings.push({
        field: `tabularSteps[${index}].mutu_waktu`,
        message: `Langkah ${index + 1}: Sebaiknya isi mutu waktu`,
        type: 'warning'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

## 🚀 Usage Flow

### Complete Implementation Example

```vue
<!-- views/SOP/Create.vue -->
<template>
  <div class="sop-create">
    <h2>Buat SOP Baru - Mode Manual/Basic</h2>

    <!-- Basic Info Form -->
    <Card>
      <template #title>Informasi Dasar</template>
      <template #content>
        <div class="form-grid">
          <InputText v-model="sop.title" placeholder="Judul SOP" />
          <Textarea v-model="sop.description" placeholder="Deskripsi" />
          <Dropdown v-model="sop.departmentId" :options="departments" />
        </div>
      </template>
    </Card>

    <!-- Tabular Steps Editor -->
    <Card class="mt-4">
      <template #title>Langkah-langkah SOP</template>
      <template #content>
        <StepTabularEditor
          v-model="sop.tabularSteps"
          :actors="actors"
          @steps-changed="onStepsChanged"
        />
      </template>
    </Card>

    <!-- Flowchart Viewer (Optional) -->
    <Card class="mt-4" v-if="sop.flowchartData">
      <template #title>Visualisasi Flowchart</template>
      <template #content>
        <FlowchartCanvas :data="sop.flowchartData" />
      </template>
    </Card>

    <!-- Actions -->
    <div class="actions mt-4">
      <Button label="Generate Flowchart" @click="generateFlowchart" />
      <Button label="Simpan Draft" @click="saveDraft" />
      <Button label="Submit untuk Review" @click="submitForReview" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSOPManualStore } from "@/stores/sopManual";
import { useToast } from "primevue/usetoast";
import StepTabularEditor from "@/components/SOP/StepTabularEditor.vue";

const router = useRouter();
const sopManualStore = useSOPManualStore();
const toast = useToast();

const sop = ref({
  title: "",
  description: "",
  departmentId: "",
  tabularSteps: [],
  flowchartData: null,
});

const actors = ref([]);
const departments = ref([]);

const onStepsChanged = (steps) => {
  sopManualStore.setTabularSteps(steps);
};

const generateFlowchart = () => {
  sopManualStore.generateFlowchartFromSteps();
  sop.value.flowchartData = sopManualStore.flowchartData;

  toast.add({
    severity: "success",
    summary: "Berhasil",
    detail: "Flowchart berhasil dibuat",
  });
};

const saveDraft = async () => {
  try {
    const validation = sopManualStore.validate();
    if (!validation.isValid) {
      toast.add({
        severity: "error",
        summary: "Validasi Gagal",
        detail: validation.errors[0].message,
      });
      return;
    }

    const result = await sopManualStore.saveSOP(sop.value);

    toast.add({
      severity: "success",
      summary: "Tersimpan",
      detail: "SOP berhasil disimpan sebagai draft",
    });

    router.push(`/sop/${result.id}`);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
    });
  }
};

const submitForReview = async () => {
  // Similar to saveDraft but change status to REVIEW
};

onMounted(async () => {
  // Load actors and departments
  // actors.value = await actorService.getActors();
  // departments.value = await departmentService.getDepartments();
});
</script>
```

## 📊 Data Flow Diagram

```
┌──────────────┐
│   Frontend   │
│  (Vue + UI)  │
└──────┬───────┘
       │
       │ User Input (Tabel Langkah)
       │
       ▼
┌──────────────┐
│ StepTabular  │
│   Editor     │ ◄──── Excel-like DataTable
└──────┬───────┘
       │
       │ Array<ISOPStep>
       │
       ▼
┌──────────────┐
│ SOPManual    │
│   Store      │ ◄──── State Management
│   (Pinia)    │       Validation
└──────┬───────┘       Auto-save
       │
       │ Generate
       │
       ▼
┌──────────────┐
│  Flowchart   │
│    Data      │ ◄──── Auto-generated
│ (IFlowchart) │       from steps
└──────┬───────┘
       │
       │ API Call (POST /api/sop)
       │
       ▼
┌──────────────┐
│   Backend    │
│  Controller  │ ◄──── Validation
└──────┬───────┘       Business Logic
       │
       │ Prisma ORM
       │
       ▼
┌──────────────┐
│ PostgreSQL   │
│   Database   │ ◄──── JSONB Storage
│              │       tabular_steps
│              │       flowchart_data
└──────────────┘
```

## ✅ Checklist Implementation

- [x] Prisma schema extension (JSONB columns)
- [x] TypeScript interfaces (ISOPStep, IFlowchartNode, IFlowchartData)
- [x] StepTabularEditor.vue component
- [x] SOPManual Pinia store
- [x] Backend controller (sopManual.controller.js)
- [x] Validation logic (frontend & backend)
- [x] Migration SQL file
- [ ] Flowchart canvas component (TODO)
- [ ] Excel import/export logic (TODO)
- [ ] Integration tests (TODO)

## 🎯 Next Steps

1. **Run Migration:**

   ```bash
   cd backend
   npx prisma migrate dev --name add_manual_mode_columns
   npx prisma generate
   ```

2. **Install Component:**

   ```bash
   cd frontend
   # Component already created at src/components/SOP/StepTabularEditor.vue
   ```

3. **Test API:**

   ```bash
   # Test create SOP
   curl -X POST http://localhost:3000/api/sop \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "title": "Test SOP",
       "departmentId": "uuid",
       "tabularSteps": [...]
     }'
   ```

4. **Implement Flowchart Canvas** (Optional next phase)

---

**Documentation Version:** 1.0.0  
**Last Updated:** November 15, 2025  
**Author:** openSOP Development Team
