# Flowchart Visualization - SOPDetail Page

## ✅ Yang Sudah Diimplementasikan

### 1. **Dependencies Installed**

```bash
npm install bpmn-js bpmn-js-properties-panel
```

- **bpmn-js**: Library untuk viewing dan editing BPMN diagrams
- **bpmn-js-properties-panel**: Panel properti untuk konfigurasi elemen (opsional)

### 2. **Komponen Baru**

#### **BpmnViewer.vue** (`src/components/BpmnViewer.vue`)

- ✅ Read-only BPMN diagram viewer
- ✅ Auto-convert flowchartData ke BPMN XML
- ✅ Zoom fit-viewport otomatis
- ✅ Loading state dengan spinner
- ✅ Dark mode support
- ✅ Responsive design

**Props:**

- `xml`: String - BPMN XML (opsional)
- `flowchartData`: Array - Data flowchart dari backend (opsional)

#### **BpmnEditor.vue** (`src/components/BpmnEditor.vue`)

- ✅ Full BPMN diagram editor
- ✅ Drag & drop elements
- ✅ Toolbar dengan actions:
  - Simpan diagram
  - Batal (cancel)
  - Export XML
  - Export SVG
- ✅ Context menu untuk edit elemen
- ✅ Properties panel (placeholder)
- ✅ Dark mode support

**Events:**

- `@save`: Emit ketika save (returns {xml, flowchartData})
- `@cancel`: Emit ketika cancel

#### **SOPFlowchart.vue** (`src/components/SOPFlowchart.vue`) - **NEW! 🆕**

- ✅ Custom SVG-based flowchart dengan swimlanes horizontal
- ✅ Format sesuai standar SOP AP BPS
- ✅ Swimlanes untuk setiap aktor (horizontal lanes)
- ✅ 5 tipe simbol flowchart:
  - **Start/End Event**: Lingkaran (hijau untuk start, merah untuk end)
  - **Task/Process**: Rectangle dengan rounded corners
  - **Gateway/Decision**: Diamond shape (belah ketupat)
  - **Intermediate Event**: Double circle
  - **Document**: Document shape dengan wave bottom
- ✅ Auto-layout algoritma untuk posisi nodes
- ✅ Connection lines dengan arrow markers
- ✅ Decision branching (Ya/Tidak) dengan colored paths
- ✅ Interactive (hover effects, clickable nodes)
- ✅ Legend untuk keterangan simbol
- ✅ Dark mode support
- ✅ Responsive & scrollable canvas

**Props:**

- `flowchartData`: Array - Data aktivitas flowchart
- `aktors`: Array - Data aktor/pelaksana

### 3. **SOPDetail.vue Updates**

#### **Fitur Baru:**

**A. Multi-View Mode dengan SelectButton** 🆕

```vue
<SelectButton v-model="viewMode" :options="viewOptions" />
```

- **3 Mode Visualisasi:**
  1. **BPMN** - Standar BPMN diagram (bpmn-js)
  2. **Flowchart SOP** - Custom flowchart dengan swimlanes (sesuai standar BPS)
  3. **Tabel** - Matriks aktivitas tradisional
- Default: Flowchart SOP view
- User bisa switch antar mode dengan mudah

**A. Toggle View (Diagram vs Tabel)**

```vue
<Button
  :label="showTable ? 'Tampilkan Diagram' : 'Tampilkan Tabel'"
  @click="toggleView"
/>
```

- User bisa switch antara visualisasi BPMN diagram dan tabel matriks
- Default: BPMN Diagram view

**B. Edit Flowchart Dialog**

```vue
<Button label="Edit Flowchart" @click="openFlowchartEditor" v-if="canEdit" />
```

- Membuka full-screen dialog dengan BpmnEditor
- Role-based access (ADMIN, SUPERVISOR, PIMPINAN)
- Save changes ke `bpmnXML` state

**C. Edit Metadata Dialog**

```vue
<Button label="Edit" @click="editSOP" v-if="canEdit" />
```

- Membuka dialog untuk edit metadata SOP
- Terpisah dari flowchart editor
- TODO: Implement form fields

### 4. **Styling**

- ✅ BPMN.js CSS imported di `main.js`
- ✅ Custom styling untuk dark mode
- ✅ Responsive layout
- ✅ Dialog full-screen untuk editor (95vw x 90vh)

## 🔧 Cara Penggunaan

### **1. View SOP Detail**

```
/sop/SOP-036-17000-2025
```

- Akan menampilkan BPMN diagram berdasarkan `flowchartData`
- Jika ada `bpmnXML`, akan render dari XML
- Auto-convert 5 tipe simbol ke BPMN elements:
  - KAPSUL → Start/End Event
  - KOTAK → Task
  - BELAH_KETUPAT → Exclusive Gateway
  - ANAK_PANAH → Sequence Flow
  - SEGILIMA → Intermediate Event

### **2. Toggle View**

- Klik tombol "Tampilkan Tabel" untuk melihat matriks aktivitas
- Klik tombol "Tampilkan Diagram" untuk kembali ke BPMN view

### **3. Edit Flowchart**

- Klik "Edit Flowchart" (hanya jika user memiliki akses)
- Dialog editor akan terbuka full-screen
- Drag & drop elemen dari palette (kiri)
- Klik elemen untuk edit properties
- Klik "Simpan" untuk save changes
- Klik "Batal" untuk cancel

### **4. Export Diagram**

Di editor mode:

- **Export XML**: Download file `.bpmn` untuk backup/sharing
- **Export SVG**: Download diagram sebagai image vector

## 🎨 BPMN Element Mapping

| Tipe Simbol    | BPMN Element       | Visual                 |
| -------------- | ------------------ | ---------------------- |
| KAPSUL (start) | Start Event        | ⚪ (lingkaran)         |
| KAPSUL (end)   | End Event          | ⚪ (lingkaran tebal)   |
| KOTAK          | Task               | ▭ (persegi rounded)    |
| BELAH_KETUPAT  | Exclusive Gateway  | ◇ (belah ketupat)      |
| ANAK_PANAH     | Sequence Flow      | → (panah)              |
| SEGILIMA       | Intermediate Event | ⚪◉ (lingkaran double) |

## 📝 TODO / Next Steps

### **High Priority:**

1. ✅ ~~Install bpmn-js~~
2. ✅ ~~Create BpmnViewer component~~
3. ✅ ~~Create BpmnEditor component~~
4. ✅ ~~Integrate ke SOPDetail~~
5. ⏳ **Parse BPMN XML back to flowchartData** (di `BpmnEditor.saveFlowchart`)
6. ⏳ **Implement metadata edit form**
7. ⏳ **Backend API untuk save BPMN XML**

### **Medium Priority:**

8. ⏳ Custom BPMN palette dengan swimlanes (aktor)
9. ⏳ Properties panel integration untuk edit mutu baku
10. ⏳ Auto-layout algorithm untuk posisi elements
11. ⏳ Validation rules (harus ada start dan end)

### **Low Priority:**

12. ⏳ Collaboration diagram dengan lanes (swimlanes visual)
13. ⏳ Print/PDF generation dari BPMN diagram
14. ⏳ Version comparison (diff between XML versions)
15. ⏳ Real-time collaboration editing

## 🐛 Known Issues

1. **TypeScript Errors**:

   - Errors saat compile karena Vue 3 + TypeScript strict mode
   - Tidak mempengaruhi runtime, hanya editor warnings
   - Fix: Ignore atau tambahkan type definitions

2. **BPMN XML Parsing**:

   - Belum ada parser dari XML → flowchartData
   - Saat ini save XML saja, tidak update table view
   - Perlu implement XML parser

3. **Swimlanes**:
   - BPMN.js default tidak support custom swimlanes
   - Perlu custom modeler atau plugin
   - Alternatif: Gunakan collaboration diagram dengan participants

## 🚀 Testing

### **Manual Testing:**

1. Navigate ke `/sop/SOP-036-17000-2025`
2. Lihat BPMN diagram loading
3. Toggle view ke tabel → kembali ke diagram
4. Login sebagai ADMIN/SUPERVISOR
5. Klik "Edit Flowchart"
6. Drag element dari palette, edit, save
7. Verify diagram updated

### **Data Flow:**

```
flowchartData (Array)
  ↓
createBpmnXML()
  ↓
BPMN XML (String)
  ↓
BpmnViewer.importXML()
  ↓
Canvas rendering
```

**Edit Flow:**

```
BpmnEditor
  ↓
User edits
  ↓
Save button
  ↓
modeler.saveXML()
  ↓
Emit @save(xml)
  ↓
SOPDetail.saveFlowchart()
  ↓
Update bpmnXML ref
  ↓
API call (TODO)
```

## 📚 Resources

- **bpmn-js Docs**: https://bpmn.io/toolkit/bpmn-js/
- **Examples**: https://github.com/bpmn-io/bpmn-js-examples
- **BPMN 2.0 Spec**: https://www.omg.org/spec/BPMN/2.0/
- **Custom Modeler**: https://github.com/bpmn-io/bpmn-js-examples/tree/master/custom-modeling-rules

## 💡 Tips

1. **Performance**: Untuk SOP dengan banyak aktivitas (>50), consider pagination atau virtualization
2. **Validation**: Implement validation sebelum save (harus ada start dan end event)
3. **Auto-save**: Consider auto-save draft setiap 30 detik
4. **Undo/Redo**: BPMN.js sudah include command stack untuk undo/redo (Ctrl+Z / Ctrl+Y)
5. **Keyboard Shortcuts**:
   - `Ctrl+Z`: Undo
   - `Ctrl+Y`: Redo
   - `Del`: Delete element
   - `Ctrl+C/V`: Copy/Paste
   - `Space`: Hand tool (pan)

---

**Status**: ✅ **IMPLEMENTED** - Ready for testing  
**Last Updated**: 2025-01-11  
**Version**: 1.0.0
