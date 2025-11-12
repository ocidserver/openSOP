<template>
  <div class="monitoring-dashboard">
    <div class="page-header">
      <h1 class="page-title">Dashboard Monitoring</h1>
      <div class="header-actions">
        <Button label="Export Data" icon="pi pi-download" outlined size="small" @click="exportData" />
        <Button label="Refresh" icon="pi pi-refresh" outlined size="small" @click="refreshData" :loading="loading" />
      </div>
    </div>

    <!-- Filter Section -->
    <Card class="filter-card">
      <template #content>
        <div class="filter-grid">
          <div class="field">
            <label>Periode</label>
            <Dropdown v-model="filters.period" :options="periodOptions" optionLabel="label" optionValue="value" placeholder="Pilih Periode" />
          </div>
          <div class="field">
            <label>Departemen</label>
            <Dropdown v-model="filters.department" :options="departments" optionLabel="name" optionValue="id" placeholder="Semua Departemen" showClear />
          </div>
          <div class="field">
            <label>Kategori</label>
            <Dropdown v-model="filters.category" :options="categories" optionLabel="name" optionValue="id" placeholder="Semua Kategori" showClear />
          </div>
          <div class="field">
            <label>Status</label>
            <MultiSelect v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Semua Status" display="chip" />
          </div>
        </div>
      </template>
    </Card>

    <!-- KPI Cards -->
    <div class="grid mt-4">
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="kpi-card">
          <template #content>
            <div class="kpi-content">
              <div class="kpi-info">
                <div class="kpi-label">Total SOP</div>
                <div class="kpi-value">{{ kpiData.totalSOP }}</div>
                <div class="kpi-trend positive">
                  <i class="pi pi-arrow-up"></i> {{ kpiData.sopGrowth }}% dari bulan lalu
                </div>
              </div>
              <div class="kpi-icon blue">
                <i class="pi pi-file"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="kpi-card">
          <template #content>
            <div class="kpi-content">
              <div class="kpi-info">
                <div class="kpi-label">Compliance Rate</div>
                <div class="kpi-value">{{ kpiData.complianceRate }}%</div>
                <div class="kpi-trend" :class="kpiData.complianceTrend >= 0 ? 'positive' : 'negative'">
                  <i :class="kpiData.complianceTrend >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i> 
                  {{ Math.abs(kpiData.complianceTrend) }}% dari target
                </div>
              </div>
              <div class="kpi-icon green">
                <i class="pi pi-check-circle"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="kpi-card">
          <template #content>
            <div class="kpi-content">
              <div class="kpi-info">
                <div class="kpi-label">Perlu Review</div>
                <div class="kpi-value">{{ kpiData.pendingReview }}</div>
                <div class="kpi-trend warning">
                  <i class="pi pi-clock"></i> {{ kpiData.avgReviewTime }} hari rata-rata
                </div>
              </div>
              <div class="kpi-icon orange">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="kpi-card">
          <template #content>
            <div class="kpi-content">
              <div class="kpi-info">
                <div class="kpi-label">Rata-rata Skor</div>
                <div class="kpi-value">{{ kpiData.avgScore }}/5</div>
                <div class="kpi-trend positive">
                  <i class="pi pi-star-fill"></i> {{ kpiData.evaluatedSOP }} SOP dinilai
                </div>
              </div>
              <div class="kpi-icon purple">
                <i class="pi pi-star"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid mt-4">
      <div class="col-12 lg:col-8">
        <Card>
          <template #title>Trend SOP per Bulan</template>
          <template #content>
            <Chart type="line" :data="sopTrendData" :options="chartOptions" class="chart-container" />
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-4">
        <Card>
          <template #title>Status SOP</template>
          <template #content>
            <Chart type="doughnut" :data="statusChartData" :options="doughnutOptions" class="chart-container" />
          </template>
        </Card>
      </div>
    </div>

    <div class="grid mt-4">
      <div class="col-12 lg:col-6">
        <Card>
          <template #title>SOP per Kategori</template>
          <template #content>
            <Chart type="bar" :data="categoryChartData" :options="barChartOptions" class="chart-container" />
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-6">
        <Card>
          <template #title>SOP per Departemen</template>
          <template #content>
            <Chart type="bar" :data="departmentChartData" :options="barChartOptions" class="chart-container" />
          </template>
        </Card>
      </div>
    </div>

    <!-- Performance Table -->
    <Card class="mt-4">
      <template #title>
        <div class="card-header">
          <span>Performance Departemen</span>
          <Button label="Lihat Detail" text size="small" @click="viewDetails" />
        </div>
      </template>
      <template #content>
        <DataTable :value="departmentPerformance" :paginator="true" :rows="10" responsiveLayout="scroll">
          <Column field="department" header="Departemen" sortable>
            <template #body="slotProps">
              <div class="department-cell">
                <i class="pi pi-building mr-2"></i>
                {{ slotProps.data.department }}
              </div>
            </template>
          </Column>
          <Column field="totalSOP" header="Total SOP" sortable></Column>
          <Column field="activeSOP" header="SOP Aktif" sortable></Column>
          <Column field="compliance" header="Compliance" sortable>
            <template #body="slotProps">
              <div class="compliance-cell">
                <ProgressBar :value="slotProps.data.compliance" :showValue="false" style="height: 0.5rem; width: 100px;" />
                <span class="ml-2">{{ slotProps.data.compliance }}%</span>
              </div>
            </template>
          </Column>
          <Column field="avgScore" header="Rata-rata Skor" sortable>
            <template #body="slotProps">
              <div class="score-cell">
                <Rating :modelValue="slotProps.data.avgScore" readonly :cancel="false" />
                <span class="ml-2">({{ slotProps.data.avgScore.toFixed(1) }})</span>
              </div>
            </template>
          </Column>
          <Column field="status" header="Status" sortable>
            <template #body="slotProps">
              <Tag :value="slotProps.data.status" :severity="getPerformanceSeverity(slotProps.data.status)" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Recent Activities -->
    <Card class="mt-4">
      <template #title>Aktivitas Terkini</template>
      <template #content>
        <Timeline :value="recentActivities" class="custom-timeline">
          <template #opposite="slotProps">
            <small class="activity-time">{{ slotProps.item.time }}</small>
          </template>
          <template #content="slotProps">
            <div class="activity-content">
              <div class="activity-header">
                <strong>{{ slotProps.item.title }}</strong>
                <Tag :value="slotProps.item.type" :severity="getActivitySeverity(slotProps.item.type)" size="small" />
              </div>
              <p class="activity-description">{{ slotProps.item.description }}</p>
              <div class="activity-meta">
                <span><i class="pi pi-user mr-1"></i>{{ slotProps.item.user }}</span>
                <span><i class="pi pi-building mr-1"></i>{{ slotProps.item.department }}</span>
              </div>
            </div>
          </template>
          <template #marker="slotProps">
            <span class="custom-marker" :class="slotProps.item.type">
              <i :class="slotProps.item.icon"></i>
            </span>
          </template>
        </Timeline>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Chart from 'primevue/chart'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Rating from 'primevue/rating'
import Timeline from 'primevue/timeline'

const router = useRouter()
const toast = useToast()
const loading = ref(false)

// Filters
const filters = ref({
  period: '30days',
  department: null,
  category: null,
  status: []
})

const periodOptions = ref([
  { label: '7 Hari Terakhir', value: '7days' },
  { label: '30 Hari Terakhir', value: '30days' },
  { label: '3 Bulan Terakhir', value: '3months' },
  { label: '6 Bulan Terakhir', value: '6months' },
  { label: '1 Tahun Terakhir', value: '1year' }
])

const statusOptions = ref([
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Review', value: 'REVIEW' },
  { label: 'Aktif', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' }
])

const departments = ref([
  { id: 1, name: 'Metodologi dan Informasi Statistik' },
  { id: 2, name: 'Statistik Sosial' },
  { id: 3, name: 'Statistik Produksi' },
  { id: 4, name: 'Statistik Distribusi' },
  { id: 5, name: 'Neraca dan Analisis Statistik' }
])

const categories = ref([
  { id: 1, name: 'Operasional' },
  { id: 2, name: 'Teknis' },
  { id: 3, name: 'Administrasi' },
  { id: 4, name: 'Keamanan' }
])

// KPI Data
const kpiData = ref({
  totalSOP: 156,
  sopGrowth: 12,
  complianceRate: 87.5,
  complianceTrend: 5.2,
  pendingReview: 8,
  avgReviewTime: 3.5,
  avgScore: 4.2,
  evaluatedSOP: 142
})

// SOP Trend Chart Data
const sopTrendData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
  datasets: [
    {
      label: 'SOP Dibuat',
      data: [12, 15, 10, 18, 14, 20, 16, 22, 19, 24, 21, 26],
      fill: false,
      borderColor: '#667eea',
      tension: 0.4
    },
    {
      label: 'SOP Disetujui',
      data: [10, 13, 9, 16, 12, 18, 15, 20, 17, 22, 19, 23],
      fill: false,
      borderColor: '#10b981',
      tension: 0.4
    }
  ]
})

// Status Chart Data
const statusChartData = ref({
  labels: ['Aktif', 'Review', 'Draft', 'Archived'],
  datasets: [
    {
      data: [120, 8, 15, 13],
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
    }
  ]
})

// Category Chart Data
const categoryChartData = ref({
  labels: ['Operasional', 'Teknis', 'Administrasi', 'Keamanan', 'Lainnya'],
  datasets: [
    {
      label: 'Jumlah SOP',
      data: [45, 38, 32, 25, 16],
      backgroundColor: '#667eea'
    }
  ]
})

// Department Chart Data
const departmentChartData = ref({
  labels: ['Metodologi', 'Sosial', 'Produksi', 'Distribusi', 'Neraca'],
  datasets: [
    {
      label: 'Jumlah SOP',
      data: [35, 28, 32, 30, 31],
      backgroundColor: '#8b5cf6'
    }
  ]
})

// Chart Options
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
})

const doughnutOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
})

const barChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
})

// Department Performance Data
const departmentPerformance = ref([
  { department: 'Metodologi dan Informasi Statistik', totalSOP: 35, activeSOP: 32, compliance: 91, avgScore: 4.5, status: 'Excellent' },
  { department: 'Statistik Sosial', totalSOP: 28, activeSOP: 25, compliance: 89, avgScore: 4.3, status: 'Good' },
  { department: 'Statistik Produksi', totalSOP: 32, activeSOP: 28, compliance: 87, avgScore: 4.2, status: 'Good' },
  { department: 'Statistik Distribusi', totalSOP: 30, activeSOP: 26, compliance: 85, avgScore: 4.0, status: 'Fair' },
  { department: 'Neraca dan Analisis Statistik', totalSOP: 31, activeSOP: 27, compliance: 88, avgScore: 4.4, status: 'Good' }
])

// Recent Activities
const recentActivities = ref([
  {
    id: 1,
    title: 'SOP Baru Disetujui',
    description: 'SOP-156: Prosedur Pengumpulan Data Lapangan',
    user: 'Ahmad Fauzi',
    department: 'Metodologi',
    time: '10 menit lalu',
    type: 'approved',
    icon: 'pi pi-check-circle'
  },
  {
    id: 2,
    title: 'SOP Diperbarui',
    description: 'SOP-089: Update workflow pengolahan data',
    user: 'Siti Nurhaliza',
    department: 'Statistik Sosial',
    time: '1 jam lalu',
    type: 'updated',
    icon: 'pi pi-pencil'
  },
  {
    id: 3,
    title: 'SOP Dibuat',
    description: 'SOP-157: Prosedur backup database',
    user: 'Budi Santoso',
    department: 'IT',
    time: '3 jam lalu',
    type: 'created',
    icon: 'pi pi-plus-circle'
  },
  {
    id: 4,
    title: 'Penilaian SOP',
    description: 'SOP-145 mendapat rating 4.5 dari 5',
    user: 'Rina Wijaya',
    department: 'Produksi',
    time: '5 jam lalu',
    type: 'evaluated',
    icon: 'pi pi-star-fill'
  }
])

const getPerformanceSeverity = (status) => {
  const severityMap = {
    'Excellent': 'success',
    'Good': 'info',
    'Fair': 'warning',
    'Poor': 'danger'
  }
  return severityMap[status] || 'secondary'
}

const getActivitySeverity = (type) => {
  const severityMap = {
    'approved': 'success',
    'updated': 'info',
    'created': 'primary',
    'evaluated': 'warning'
  }
  return severityMap[type] || 'secondary'
}

const refreshData = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil diperbarui', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memperbarui data', life: 3000 })
  } finally {
    loading.value = false
  }
}

const exportData = () => {
  toast.add({ severity: 'info', summary: 'Export', detail: 'Mengekspor data...', life: 3000 })
  // Implement export logic
}

const viewDetails = () => {
  router.push('/reports')
}

onMounted(() => {
  // Load initial data
})
</script>

<style scoped>
.monitoring-dashboard {
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

.filter-card {
  border-radius: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

/* KPI Cards */
.kpi-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.kpi-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-label {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.kpi-trend {
  font-size: 0.813rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.kpi-trend.positive { color: #10b981; }
.kpi-trend.negative { color: #ef4444; }
.kpi-trend.warning { color: #f59e0b; }

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.kpi-icon.blue { background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); color: #667eea; }
.kpi-icon.green { background: linear-gradient(135deg, #10b98120 0%, #05966920 100%); color: #10b981; }
.kpi-icon.orange { background: linear-gradient(135deg, #f5970020 0%, #ea580c20 100%); color: #f59700; }
.kpi-icon.purple { background: linear-gradient(135deg, #8b5cf620 0%, #7c3aed20 100%); color: #8b5cf6; }

.chart-container {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.department-cell {
  display: flex;
  align-items: center;
}

.compliance-cell {
  display: flex;
  align-items: center;
}

.score-cell {
  display: flex;
  align-items: center;
}

/* Timeline */
.custom-timeline {
  max-width: 100%;
}

.activity-time {
  color: var(--text-color-secondary);
}

.activity-content {
  padding: 0.5rem 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.activity-description {
  color: var(--text-color-secondary);
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.813rem;
  color: var(--text-color-secondary);
}

.custom-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--surface-border);
}

.custom-marker.approved { background-color: #d1fae5; color: #10b981; }
.custom-marker.updated { background-color: #dbeafe; color: #3b82f6; }
.custom-marker.created { background-color: #ede9fe; color: #8b5cf6; }
.custom-marker.evaluated { background-color: #fef3c7; color: #f59e0b; }

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

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .kpi-value {
    font-size: 1.5rem;
  }

  .kpi-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
