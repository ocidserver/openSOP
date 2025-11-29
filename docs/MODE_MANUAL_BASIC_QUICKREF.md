# 📝 Mode Manual/Basic - Quick Reference

## 🎯 Overview

Fitur pembuatan SOP dengan dua komponen input:

1. **Tabel Langkah** - Excel-like grid untuk input langkah SOP
2. **Flowchart Canvas** - Visualisasi otomatis dari tabel langkah

---

## 1️⃣ PRISMA SCHEMA (Database)

**File:** `backend/prisma/schema.prisma`

```prisma
model SOPDocument {
  // ... existing fields ...

  // Mode Manual/Basic JSONB fields
  tabularSteps   Json?  @map("tabular_steps") @db.JsonB
  flowchartData  Json?  @map("flowchart_data") @db.JsonB
}

model SOPVersion {
  // ... existing fields ...

  // Version-specific JSONB fields
  tabularSteps   Json?  @map("tabular_steps") @db.JsonB
  flowchartData  Json?  @map("flowchart_data") @db.JsonB
}
```

**Migration:**

```bash
cd backend
npx prisma migrate dev --name add_manual_mode_columns
npx prisma generate
```

---

## 2️⃣ TYPESCRIPT INTERFACES

**File:** `frontend/src/types/sop.types.ts`

```typescript
// Tabular Step
export interface ISOPStep {
  step_id: number;
  activity: string; // Aktivitas
  actor: string; // Pelaksana
  mutu_waktu: string; // Mutu baku waktu
  mutu_output: string; // Mutu baku output
  notes: string; // Catatan
  order: number; // Urutan
  is_decision?: boolean;
}

// Flowchart Node
export interface IFlowchartNode {
  id: string;
  type: FlowchartNodeType; // start|end|task|decision
  label: string;
  poolId?: string; // Actor/Lane
  position: { x: number; y: number };
  data?: { step_id?: number; actor?: string };
}

// Flowchart Data Container
export interface IFlowchartData {
  version: string;
  nodes: IFlowchartNode[];
  connections: IFlowchartConnection[];
  metadata?: any;
}

// SOP Document
export interface ISOPDocument {
  title: string;
  departmentId: string;
  tabularSteps?: ISOPStep[];
  flowchartData?: IFlowchartData;
  // ... other fields
}
```

---

## 3️⃣ VUE COMPONENT

**File:** `frontend/src/components/SOP/StepTabularEditor.vue`

**Features:**

- ✅ DataTable dengan inline editing
- ✅ Drag & drop reordering
- ✅ CRUD operations (Add/Edit/Delete/Duplicate)
- ✅ Actor dropdown selection
- ✅ Validation
- ⏳ Excel import/export (TODO)

**Usage:**

```vue
<template>
  <StepTabularEditor
    v-model="steps"
    :actors="actorList"
    @steps-changed="handleChange"
  />
</template>

<script setup>
import StepTabularEditor from "@/components/SOP/StepTabularEditor.vue";
const steps = ref([]);
</script>
```

---

## 4️⃣ PINIA STORE

**File:** `frontend/src/stores/sopManual.ts`

```typescript
import { useSOPManualStore } from "@/stores/sopManual";

const store = useSOPManualStore();

// Add step
store.addStep({ activity: "New", actor: "Staff" });

// Update step
store.updateStep(stepId, { activity: "Updated" });

// Delete step
store.deleteStep(stepId);

// Generate flowchart from steps
store.generateFlowchartFromSteps();

// Validate
const validation = store.validate();
if (!validation.isValid) {
  console.error(validation.errors);
}

// Save to backend
await store.saveSOP({
  title: "My SOP",
  departmentId: "dept-123",
});

// Load from backend
await store.loadSOP(sopId);
```

---

## 5️⃣ BACKEND CONTROLLER

**File:** `backend/src/controllers/sopManual.controller.js`

### Create SOP

**Endpoint:** `POST /api/sop`

**Request:**

```json
{
  "title": "SOP Pelayanan Data",
  "description": "Prosedur pelayanan",
  "departmentId": "uuid-dept",
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
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "SOP created successfully",
  "data": {
    "id": "uuid",
    "sopNumber": "SOP/IPDS/2025/001",
    "tabularSteps": [...],
    "flowchartData": {...}
  }
}
```

### Update SOP

**Endpoint:** `PUT /api/sop/:id`

**Request:**

```json
{
  "tabularSteps": [...],
  "flowchartData": {...},
  "changeLog": "Updated steps"
}
```

### Get SOP

**Endpoint:** `GET /api/sop/:id`

**Response:** JSONB fields automatically parsed to objects/arrays

---

## 6️⃣ VALIDATION

### Backend

```javascript
validateTabularSteps(steps) {
  // Check: step_id, activity, actor required
  // Check: data types
  return { isValid, errors }
}

validateFlowchartData(flowchart) {
  // Check: version, nodes[], connections[]
  // Check: node structure
  return { isValid, errors }
}
```

### Frontend (Store)

```typescript
validate(): ISOPValidationResult {
  // Check: minimum 1 step
  // Check: activity & actor not empty
  // Warnings: mutu_waktu, mutu_output empty
  return { isValid, errors, warnings }
}
```

---

## 🚀 Quick Start

### 1. Run Migration

```bash
cd backend
npx prisma migrate dev --name add_manual_mode_columns
npx prisma generate
npm start
```

### 2. Frontend Setup

```bash
cd frontend
# Files already created:
# - src/types/sop.types.ts ✅
# - src/stores/sopManual.ts ✅
# - src/components/SOP/StepTabularEditor.vue ✅
npm run dev
```

### 3. Test API

```bash
# Create SOP
curl -X POST http://localhost:3000/api/sop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test","departmentId":"uuid","tabularSteps":[...]}'

# Get SOP
curl http://localhost:3000/api/sop/:id \
  -H "Authorization: Bearer TOKEN"
```

### 4. Usage in View

```vue
<!-- views/SOP/Create.vue -->
<template>
  <div>
    <InputText v-model="sop.title" placeholder="Judul SOP" />

    <StepTabularEditor v-model="sop.tabularSteps" :actors="actors" />

    <Button @click="saveSOP">Simpan</Button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useSOPManualStore } from "@/stores/sopManual";
import StepTabularEditor from "@/components/SOP/StepTabularEditor.vue";

const store = useSOPManualStore();
const sop = ref({ title: "", tabularSteps: [] });

const saveSOP = async () => {
  store.setTabularSteps(sop.value.tabularSteps);
  const result = await store.saveSOP(sop.value);
  console.log("Saved:", result);
};
</script>
```

---

## 📊 Data Flow

```
User Input (UI)
  → StepTabularEditor.vue
    → Pinia Store (sopManual)
      → Validation
        → API Call (POST/PUT)
          → Backend Controller
            → Prisma ORM
              → PostgreSQL (JSONB)
```

---

## ✅ Checklist

- [x] Database schema (JSONB columns)
- [x] TypeScript interfaces
- [x] Vue component (StepTabularEditor)
- [x] Pinia store (sopManual)
- [x] Backend controller
- [x] Validation logic
- [x] Migration file
- [x] Documentation
- [ ] Flowchart canvas component (Phase 2)
- [ ] Excel import/export (Phase 2)

---

## 📚 Full Documentation

See: [`docs/MODE_MANUAL_BASIC_IMPLEMENTATION.md`](./MODE_MANUAL_BASIC_IMPLEMENTATION.md)

**Version:** 1.0.0  
**Date:** November 15, 2025
