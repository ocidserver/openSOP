<template>
  <div class="report-list">
    <div class="page-header">
      <h1 class="page-title">Laporan</h1>
      <div class="header-actions">
        <Button label="Schedule Report" icon="pi pi-calendar" outlined size="small" @click="scheduleReport" />
        <Button label="Riwayat Export" icon="pi pi-history" outlined size="small" @click="viewHistory" />
      </div>
    </div>

    <!-- Report Templates -->
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-4">
        <Card class="report-card" @click="generateReport('sop-summary')">
          <template #content>
            <div class="report-content">
              <div class="report-icon blue">
                <i class="pi pi-file"></i>
              </div>
              <div class="report-info">
                <h3>Ringkasan SOP</h3>
                <p>Laporan ringkasan semua SOP dengan status, kategori, dan statistik</p>
                <div class="report-meta">
                  <Tag value="Populer" severity="success" />
                  <span class="meta-text"><i class="pi pi-clock"></i> ~2 menit</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-4">
        <Card class="report-card" @click="generateReport('compliance')">
          <template #content>
            <div class="report-content">
              <div class="report-icon green">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="report-info">
                <h3>Laporan Compliance</h3>
                <p>Tingkat kepatuhan implementasi SOP per departemen dan periode</p>
                <div class="report-meta">
                  <Tag value="Penting" severity="warning" />
                  <span class="meta-text"><i class="pi pi-clock"></i> ~3 menit</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-4">
        <Card class="report-card" @click="generateReport('approval-workflow')">
          <template #content>
            <div class="report-content">
              <div class="report-icon purple">
                <i class="pi pi-share-alt"></i>
              </div>
              <div class="report-info">
                <h3>Workflow Approval</h3>
                <p>Laporan proses approval SOP, waktu review, dan bottleneck</p>
                <div class="report-meta">
                  <Tag value="Analitik" severity="info" />
                  <span class="meta-text"><i class="pi pi-clock"></i> ~4 menit</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-4">
        <Card class="report-card" @click="generateReport('user-activity')">
          <template #content>
            <div class="report-content">
              <div class="report-icon orange">
                <i class="pi pi-users"></i>
              </div>
              <div class="report-info">
                <h3>Aktivitas Pengguna</h3>
                <p>Log aktivitas pengguna dalam sistem (create, edit, approve)</p>
                <div class="report-meta">
                  <Tag value="Audit" severity="danger" />
                  <span class="meta-text"><i class="pi pi-clock"></i> ~5 menit</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-4">
        <Card class="report-card" @click="generateReport('evaluation')">
          <template #content>
            <div class="report-content">
              <div class="report-icon yellow">
                <i class="pi pi-star"></i>
              </div>
              <div class="report-info">
                <h3>Penilaian SOP</h3>
                <p>Laporan hasil penilaian dan evaluasi SOP oleh pengguna</p>
                <div class="report-meta">
                  <Tag value="Evaluasi" />
                  <span class="meta-text"><i class="pi pi-clock"></i> ~3 menit</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-4">
        <Card class="report-card" @click="generateReport('department-performance')">
          <template #content>
            <div class="report-content">
              <div class="report-icon teal">
                <i class="pi pi-building"></i>
              </div>
              <div class="report-info">
                <h3>Performa Departemen</h3>
                <p>Analisis performa setiap departemen dalam pengelolaan SOP</p>
                <div class="report-meta">
                  <Tag value="Management" severity="help" />
                  <span class="meta-text"><i class="pi pi-clock"></i> ~4 menit</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Custom Report -->
    <Card class="mt-4">
      <template #title>Buat Laporan Kustom</template>
      <template #content>
        <div class="custom-report-form">
          <div class="form-grid">
            <div class="field">
              <label>Jenis Laporan</label>
              <Dropdown v-model="customReport.type" :options="reportTypes" optionLabel="label" optionValue="value" placeholder="Pilih jenis laporan" />
            </div>

            <div class="field">
              <label>Periode</label>
              <Calendar v-model="customReport.dateRange" selectionMode="range" :manualInput="false" dateFormat="dd/mm/yy" placeholder="Pilih rentang tanggal" showIcon />
            </div>

            <div class="field">
              <label>Departemen</label>
              <MultiSelect v-model="customReport.departments" :options="departments" optionLabel="name" optionValue="id" placeholder="Semua Departemen" display="chip" />
            </div>

            <div class="field">
              <label>Kategori SOP</label>
              <MultiSelect v-model="customReport.categories" :options="categories" optionLabel="name" optionValue="id" placeholder="Semua Kategori" display="chip" />
            </div>

            <div class="field">
              <label>Status SOP</label>
              <MultiSelect v-model="customReport.statuses" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Semua Status" display="chip" />
            </div>

            <div class="field">
              <label>Format Export</label>
              <SelectButton v-model="customReport.format" :options="formatOptions" optionLabel="label" optionValue="value" />
            </div>
          </div>

          <div class="form-actions">
            <Button label="Reset" icon="pi pi-refresh" outlined @click="resetCustomReport" />
            <Button label="Generate Laporan" icon="pi pi-file-export" @click="generateCustomReport" :loading="generating" />
          </div>
        </div>
      </template>
    </Card>

    <!-- Recent Reports -->
    <Card class="mt-4">
      <template #title>Laporan Terbaru</template>
      <template #content>
        <DataTable :value="recentReports" :paginator="true" :rows="10" responsiveLayout="scroll">
          <template #empty>
            <div class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>Belum ada laporan yang dibuat</p>
            </div>
          </template>

          <Column field="name" header="Nama Laporan" sortable>
            <template #body="slotProps">
              <div class="report-name-cell">
                <i :class="slotProps.data.icon" class="mr-2"></i>
                <strong>{{ slotProps.data.name }}</strong>
              </div>
            </template>
          </Column>

          <Column field="type" header="Jenis" sortable>
            <template #body="slotProps">
              <Tag :value="slotProps.data.type" />
            </template>
          </Column>

          <Column field="generatedBy" header="Dibuat Oleh" sortable></Column>

          <Column field="generatedAt" header="Tanggal Dibuat" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.generatedAt) }}
            </template>
          </Column>

          <Column field="size" header="Ukuran" sortable></Column>

          <Column field="format" header="Format">
            <template #body="slotProps">
              <Tag :value="slotProps.data.format" severity="info" />
            </template>
          </Column>

          <Column header="Aksi">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button icon="pi pi-download" rounded text size="small" @click="downloadReport(slotProps.data)" v-tooltip.top="'Download'" />
                <Button icon="pi pi-eye" rounded text size="small" @click="previewReport(slotProps.data)" v-tooltip.top="'Preview'" />
                <Button icon="pi pi-trash" rounded text severity="danger" size="small" @click="deleteReport(slotProps.data)" v-tooltip.top="'Hapus'" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Schedule Dialog -->
    <Dialog v-model:visible="scheduleDialog" modal header="Jadwalkan Laporan" :style="{ width: '500px' }">
      <div class="schedule-form">
        <div class="field">
          <label>Jenis Laporan</label>
          <Dropdown v-model="schedule.reportType" :options="reportTypes" optionLabel="label" optionValue="value" placeholder="Pilih jenis laporan" />
        </div>

        <div class="field">
          <label>Frekuensi</label>
          <Dropdown v-model="schedule.frequency" :options="frequencyOptions" optionLabel="label" optionValue="value" placeholder="Pilih frekuensi" />
        </div>

        <div class="field">
          <label>Email Penerima</label>
          <Chips v-model="schedule.recipients" placeholder="Masukkan email dan tekan Enter" />
        </div>

        <div class="field">
          <label>Format</label>
          <SelectButton v-model="schedule.format" :options="formatOptions" optionLabel="label" optionValue="value" />
        </div>
      </div>

      <template #footer>
        <Button label="Batal" text @click="scheduleDialog = false" />
        <Button label="Simpan Jadwal" icon="pi pi-check" @click="saveSchedule" />
      </template>
    </Dialog>

    <!-- History Dialog -->
    <Dialog v-model:visible="historyDialog" modal header="Riwayat Export" :style="{ width: '700px' }">
      <DataTable :value="exportHistory" :paginator="true" :rows="5">
        <Column field="reportName" header="Laporan"></Column>
        <Column field="exportedAt" header="Tanggal Export">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.exportedAt) }}
          </template>
        </Column>
        <Column field="exportedBy" header="Oleh"></Column>
        <Column field="status" header="Status">
          <template #body="slotProps">
            <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
          </template>
        </Column>
      </DataTable>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import SelectButton from 'primevue/selectbutton'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Chips from 'primevue/chips'

const router = useRouter()
const toast = useToast()
const generating = ref(false)

// Report Types
const reportTypes = ref([
  { label: 'Ringkasan SOP', value: 'sop-summary' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Workflow Approval', value: 'approval-workflow' },
  { label: 'Aktivitas Pengguna', value: 'user-activity' },
  { label: 'Penilaian SOP', value: 'evaluation' },
  { label: 'Performa Departemen', value: 'department-performance' }
])

const departments = ref([
  { id: 1, name: 'Metodologi dan Informasi Statistik' },
  { id: 2, name: 'Statistik Sosial' },
  { id: 3, name: 'Statistik Produksi' },
  { id: 4, name: 'Statistik Distribusi' }
])

const categories = ref([
  { id: 1, name: 'Operasional' },
  { id: 2, name: 'Teknis' },
  { id: 3, name: 'Administrasi' },
  { id: 4, name: 'Keamanan' }
])

const statusOptions = ref([
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Review', value: 'REVIEW' },
  { label: 'Aktif', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' }
])

const formatOptions = ref([
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'xlsx' },
  { label: 'CSV', value: 'csv' }
])

const frequencyOptions = ref([
  { label: 'Harian', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' },
  { label: 'Triwulan', value: 'quarterly' }
])

// Custom Report Form
const customReport = ref({
  type: null,
  dateRange: null,
  departments: [],
  categories: [],
  statuses: [],
  format: 'pdf'
})

// Recent Reports Data
const recentReports = ref([
  {
    id: 1,
    name: 'Laporan Ringkasan SOP - November 2025',
    type: 'Ringkasan SOP',
    icon: 'pi pi-file',
    generatedBy: 'Ahmad Fauzi',
    generatedAt: '2025-11-10',
    size: '2.4 MB',
    format: 'PDF'
  },
  {
    id: 2,
    name: 'Compliance Report Q4 2025',
    type: 'Compliance',
    icon: 'pi pi-check-circle',
    generatedBy: 'Siti Nurhaliza',
    generatedAt: '2025-11-09',
    size: '1.8 MB',
    format: 'Excel'
  },
  {
    id: 3,
    name: 'User Activity Log - Oktober 2025',
    type: 'Aktivitas',
    icon: 'pi pi-users',
    generatedBy: 'Budi Santoso',
    generatedAt: '2025-11-01',
    size: '3.2 MB',
    format: 'PDF'
  }
])

// Schedule Dialog
const scheduleDialog = ref(false)
const schedule = ref({
  reportType: null,
  frequency: null,
  recipients: [],
  format: 'pdf'
})

// History Dialog
const historyDialog = ref(false)
const exportHistory = ref([
  { id: 1, reportName: 'Ringkasan SOP', exportedAt: '2025-11-10', exportedBy: 'Ahmad Fauzi', status: 'Success' },
  { id: 2, reportName: 'Compliance', exportedAt: '2025-11-09', exportedBy: 'Siti Nurhaliza', status: 'Success' },
  { id: 3, reportName: 'User Activity', exportedAt: '2025-11-08', exportedBy: 'Budi Santoso', status: 'Failed' }
])

const generateReport = async (type) => {
  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.add({ 
      severity: 'success', 
      summary: 'Berhasil', 
      detail: 'Laporan sedang diproses. Anda akan menerima notifikasi saat selesai.', 
      life: 5000 
    })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal membuat laporan', life: 3000 })
  } finally {
    generating.value = false
  }
}

const generateCustomReport = async () => {
  if (!customReport.value.type) {
    toast.add({ severity: 'warn', summary: 'Perhatian', detail: 'Mohon pilih jenis laporan', life: 3000 })
    return
  }

  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.add({ 
      severity: 'success', 
      summary: 'Berhasil', 
      detail: 'Laporan kustom sedang diproses.', 
      life: 5000 
    })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal membuat laporan', life: 3000 })
  } finally {
    generating.value = false
  }
}

const resetCustomReport = () => {
  customReport.value = {
    type: null,
    dateRange: null,
    departments: [],
    categories: [],
    statuses: [],
    format: 'pdf'
  }
}

const downloadReport = (report) => {
  toast.add({ severity: 'info', summary: 'Download', detail: `Mengunduh ${report.name}...`, life: 3000 })
}

const previewReport = (report) => {
  toast.add({ severity: 'info', summary: 'Preview', detail: `Membuka preview ${report.name}...`, life: 3000 })
}

const deleteReport = (report) => {
  toast.add({ severity: 'warn', summary: 'Hapus', detail: `Menghapus ${report.name}...`, life: 3000 })
}

const scheduleReport = () => {
  scheduleDialog.value = true
}

const saveSchedule = () => {
  toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Jadwal laporan berhasil disimpan', life: 3000 })
  scheduleDialog.value = false
}

const viewHistory = () => {
  historyDialog.value = true
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusSeverity = (status) => {
  return status === 'Success' ? 'success' : 'danger'
}

onMounted(() => {
  // Load data
})
</script>

<style scoped>
.report-list {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Report Cards */
.report-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-color: var(--primary-color);
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.report-icon.blue { background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); color: #667eea; }
.report-icon.green { background: linear-gradient(135deg, #10b98120 0%, #05966920 100%); color: #10b981; }
.report-icon.purple { background: linear-gradient(135deg, #8b5cf620 0%, #7c3aed20 100%); color: #8b5cf6; }
.report-icon.orange { background: linear-gradient(135deg, #f5970020 0%, #ea580c20 100%); color: #f59700; }
.report-icon.yellow { background: linear-gradient(135deg, #fbbf2420 0%, #f59e0b20 100%); color: #fbbf24; }
.report-icon.teal { background: linear-gradient(135deg, #14b8a620 0%, #0d948620 100%); color: #14b8a6; }

.report-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.report-info p {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.report-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.meta-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.813rem;
  color: var(--text-color-secondary);
}

/* Custom Report Form */
.custom-report-form {
  padding: 0.5rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

/* Recent Reports */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-color-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.report-name-cell {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

/* Schedule Form */
.schedule-form {
  padding: 0.5rem 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
