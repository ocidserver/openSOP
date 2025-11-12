<template>
  <div class="sop-evaluation">
    <div class="page-header">
      <h1 class="page-title">Penilaian SOP</h1>
      <Button label="Export Penilaian" icon="pi pi-download" outlined @click="exportEvaluations" />
    </div>

    <!-- Filter Section -->
    <Card class="filter-card">
      <template #content>
        <div class="filter-grid">
          <div class="field">
            <label>Cari SOP</label>
            <InputText v-model="filters.search" placeholder="Cari kode atau judul SOP..." />
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
            <label>Rating Minimum</label>
            <Dropdown v-model="filters.minRating" :options="ratingOptions" optionLabel="label" optionValue="value" placeholder="Semua Rating" showClear />
          </div>
        </div>
      </template>
    </Card>

    <!-- Statistics Cards -->
    <div class="grid mt-4">
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">Total Penilaian</div>
                <div class="stat-value">{{ stats.totalEvaluations }}</div>
              </div>
              <div class="stat-icon blue">
                <i class="pi pi-star"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">Rata-rata Rating</div>
                <div class="stat-value">{{ stats.averageRating.toFixed(1) }}/5</div>
              </div>
              <div class="stat-icon green">
                <i class="pi pi-star-fill"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">Rating Tinggi</div>
                <div class="stat-value">{{ stats.highRated }}</div>
              </div>
              <div class="stat-icon purple">
                <i class="pi pi-thumbs-up"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">Perlu Perbaikan</div>
                <div class="stat-value">{{ stats.needsImprovement }}</div>
              </div>
              <div class="stat-icon orange">
                <i class="pi pi-exclamation-circle"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- SOP Evaluation Table -->
    <Card class="mt-4">
      <template #title>
        <div class="card-header">
          <span>Daftar Penilaian SOP</span>
          <div class="header-actions">
            <SelectButton v-model="viewMode" :options="viewModeOptions" />
          </div>
        </div>
      </template>
      <template #content>
        <!-- Table View -->
        <DataTable 
          v-show="viewMode === 'table'"
          :value="filteredEvaluations" 
          :paginator="true" 
          :rows="10" 
          :rowsPerPageOptions="[10, 20, 50]"
          responsiveLayout="scroll"
        >
          <template #empty>
            <div class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>Tidak ada penilaian ditemukan</p>
            </div>
          </template>

          <Column field="sopCode" header="Kode SOP" sortable>
            <template #body="slotProps">
              <strong>{{ slotProps.data.sopCode }}</strong>
            </template>
          </Column>

          <Column field="sopTitle" header="Judul SOP" sortable>
            <template #body="slotProps">
              <div class="sop-title-cell">
                {{ slotProps.data.sopTitle }}
                <small class="text-secondary">{{ slotProps.data.category }}</small>
              </div>
            </template>
          </Column>

          <Column field="department" header="Departemen" sortable></Column>

          <Column field="avgRating" header="Rating" sortable>
            <template #body="slotProps">
              <div class="rating-cell">
                <Rating :modelValue="slotProps.data.avgRating" readonly :cancel="false" />
                <span class="rating-text">{{ slotProps.data.avgRating.toFixed(1) }}</span>
              </div>
            </template>
          </Column>

          <Column field="totalReviews" header="Jumlah Review" sortable></Column>

          <Column field="lastReviewDate" header="Review Terakhir" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.lastReviewDate) }}
            </template>
          </Column>

          <Column header="Aksi">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button icon="pi pi-eye" rounded text size="small" @click="viewEvaluation(slotProps.data)" v-tooltip.top="'Lihat Detail'" />
                <Button icon="pi pi-star" rounded text size="small" @click="addEvaluation(slotProps.data)" v-tooltip.top="'Tambah Penilaian'" />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- Card View -->
        <div v-show="viewMode === 'card'" class="evaluation-cards">
          <div v-for="evaluation in filteredEvaluations" :key="evaluation.id" class="evaluation-card-item">
            <Card>
              <template #header>
                <div class="card-badge">
                  <Tag :value="evaluation.category" severity="info" />
                </div>
              </template>
              <template #title>
                <div class="evaluation-title">
                  <strong>{{ evaluation.sopCode }}</strong>
                  <Rating :modelValue="evaluation.avgRating" readonly :cancel="false" />
                </div>
              </template>
              <template #subtitle>
                {{ evaluation.sopTitle }}
              </template>
              <template #content>
                <div class="evaluation-meta">
                  <div class="meta-item">
                    <i class="pi pi-building"></i>
                    <span>{{ evaluation.department }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="pi pi-users"></i>
                    <span>{{ evaluation.totalReviews }} review</span>
                  </div>
                  <div class="meta-item">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatDate(evaluation.lastReviewDate) }}</span>
                  </div>
                </div>
              </template>
              <template #footer>
                <div class="card-actions">
                  <Button label="Lihat Detail" icon="pi pi-eye" text size="small" @click="viewEvaluation(evaluation)" />
                  <Button label="Nilai" icon="pi pi-star" size="small" @click="addEvaluation(evaluation)" />
                </div>
              </template>
            </Card>
          </div>
        </div>
      </template>
    </Card>

    <!-- Evaluation Dialog -->
    <Dialog v-model:visible="evaluationDialog" modal :header="dialogTitle" :style="{ width: '600px' }">
      <div class="evaluation-form">
        <div class="field">
          <label>SOP</label>
          <div class="sop-info">
            <strong>{{ selectedSOP?.sopCode }}</strong> - {{ selectedSOP?.sopTitle }}
          </div>
        </div>

        <Divider />

        <div class="field">
          <label>Kriteria Penilaian</label>
          
          <div class="criteria-item">
            <div class="criteria-header">
              <span>Kelengkapan Konten</span>
              <Rating v-model="evaluationForm.contentCompleteness" :cancel="false" />
            </div>
            <small>Apakah konten SOP lengkap dan mencakup semua aspek yang diperlukan?</small>
          </div>

          <div class="criteria-item">
            <div class="criteria-header">
              <span>Kejelasan Prosedur</span>
              <Rating v-model="evaluationForm.procedureClarity" :cancel="false" />
            </div>
            <small>Apakah prosedur dijelaskan dengan jelas dan mudah dipahami?</small>
          </div>

          <div class="criteria-item">
            <div class="criteria-header">
              <span>Kemudahan Implementasi</span>
              <Rating v-model="evaluationForm.easeOfImplementation" :cancel="false" />
            </div>
            <small>Seberapa mudah SOP ini diimplementasikan dalam praktik?</small>
          </div>

          <div class="criteria-item">
            <div class="criteria-header">
              <span>Relevansi</span>
              <Rating v-model="evaluationForm.relevance" :cancel="false" />
            </div>
            <small>Apakah SOP masih relevan dengan kondisi dan kebutuhan saat ini?</small>
          </div>

          <div class="criteria-item">
            <div class="criteria-header">
              <span>Efektivitas</span>
              <Rating v-model="evaluationForm.effectiveness" :cancel="false" />
            </div>
            <small>Seberapa efektif SOP ini dalam mencapai tujuannya?</small>
          </div>
        </div>

        <Divider />

        <div class="field">
          <label>Rating Keseluruhan</label>
          <div class="overall-rating">
            <Rating v-model="overallRating" :cancel="false" :stars="5" size="large" />
            <span class="rating-value">{{ overallRating.toFixed(1) }}/5</span>
          </div>
        </div>

        <div class="field">
          <label>Komentar/Saran</label>
          <Textarea v-model="evaluationForm.comments" rows="4" placeholder="Berikan komentar atau saran untuk perbaikan SOP..." />
        </div>

        <div class="field">
          <label>Rekomendasi</label>
          <Dropdown v-model="evaluationForm.recommendation" :options="recommendationOptions" optionLabel="label" optionValue="value" placeholder="Pilih rekomendasi" />
        </div>
      </div>

      <template #footer>
        <Button label="Batal" text @click="evaluationDialog = false" />
        <Button label="Simpan Penilaian" icon="pi pi-check" @click="submitEvaluation" :loading="saving" />
      </template>
    </Dialog>

    <!-- Detail Dialog -->
    <Dialog v-model:visible="detailDialog" modal header="Detail Penilaian" :style="{ width: '800px' }">
      <div v-if="selectedSOP" class="evaluation-detail">
        <div class="detail-header">
          <div>
            <h3>{{ selectedSOP.sopCode }}</h3>
            <p>{{ selectedSOP.sopTitle }}</p>
          </div>
          <div class="overall-score">
            <Rating :modelValue="selectedSOP.avgRating" readonly :cancel="false" size="large" />
            <span class="score-text">{{ selectedSOP.avgRating.toFixed(1) }}/5</span>
            <small>{{ selectedSOP.totalReviews }} review</small>
          </div>
        </div>

        <Divider />

        <div class="criteria-breakdown">
          <h4>Breakdown Kriteria</h4>
          <div v-for="criteria in selectedSOP.criteriaScores" :key="criteria.name" class="criteria-score">
            <div class="criteria-name">{{ criteria.name }}</div>
            <div class="criteria-bar">
              <ProgressBar :value="criteria.score * 20" :showValue="false" />
              <span class="score">{{ criteria.score.toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <Divider />

        <div class="reviews-section">
          <h4>Review Terbaru</h4>
          <div v-for="review in selectedSOP.reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-info">
                <Avatar :label="review.reviewer.charAt(0)" shape="circle" />
                <div>
                  <strong>{{ review.reviewer }}</strong>
                  <small>{{ review.department }}</small>
                </div>
              </div>
              <div class="review-meta">
                <Rating :modelValue="review.rating" readonly :cancel="false" />
                <small>{{ formatDate(review.date) }}</small>
              </div>
            </div>
            <p class="review-comment">{{ review.comment }}</p>
            <Tag v-if="review.recommendation" :value="review.recommendation" :severity="getRecommendationSeverity(review.recommendation)" />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Rating from 'primevue/rating'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Divider from 'primevue/divider'
import ProgressBar from 'primevue/progressbar'
import Avatar from 'primevue/avatar'

const router = useRouter()
const toast = useToast()

// View Mode
const viewMode = ref('table')
const viewModeOptions = ref([
  { label: 'Tabel', value: 'table' },
  { label: 'Kartu', value: 'card' }
])

// Filters
const filters = ref({
  search: '',
  department: null,
  category: null,
  minRating: null
})

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

const ratingOptions = ref([
  { label: '1 Bintang', value: 1 },
  { label: '2 Bintang', value: 2 },
  { label: '3 Bintang', value: 3 },
  { label: '4 Bintang', value: 4 },
  { label: '5 Bintang', value: 5 }
])

const recommendationOptions = ref([
  { label: 'Sangat Direkomendasikan', value: 'HIGHLY_RECOMMENDED' },
  { label: 'Direkomendasikan', value: 'RECOMMENDED' },
  { label: 'Perlu Perbaikan Kecil', value: 'NEEDS_MINOR_IMPROVEMENT' },
  { label: 'Perlu Perbaikan Besar', value: 'NEEDS_MAJOR_IMPROVEMENT' },
  { label: 'Perlu Revisi Total', value: 'NEEDS_REVISION' }
])

// Statistics
const stats = ref({
  totalEvaluations: 142,
  averageRating: 4.2,
  highRated: 89,
  needsImprovement: 12
})

// Evaluations Data
const evaluations = ref([
  {
    id: 1,
    sopCode: 'SOP-001',
    sopTitle: 'Prosedur Pengumpulan Data Lapangan',
    category: 'Operasional',
    department: 'Metodologi',
    avgRating: 4.5,
    totalReviews: 12,
    lastReviewDate: '2025-11-10',
    criteriaScores: [
      { name: 'Kelengkapan Konten', score: 4.6 },
      { name: 'Kejelasan Prosedur', score: 4.5 },
      { name: 'Kemudahan Implementasi', score: 4.3 },
      { name: 'Relevansi', score: 4.7 },
      { name: 'Efektivitas', score: 4.4 }
    ],
    reviews: [
      {
        id: 1,
        reviewer: 'Ahmad Fauzi',
        department: 'Metodologi',
        rating: 5,
        date: '2025-11-10',
        comment: 'SOP sangat lengkap dan mudah diikuti. Sangat membantu dalam pelaksanaan tugas.',
        recommendation: 'HIGHLY_RECOMMENDED'
      },
      {
        id: 2,
        reviewer: 'Siti Nurhaliza',
        department: 'Produksi',
        rating: 4,
        date: '2025-11-08',
        comment: 'Baik secara keseluruhan, namun perlu penambahan contoh kasus.',
        recommendation: 'RECOMMENDED'
      }
    ]
  },
  {
    id: 2,
    sopCode: 'SOP-002',
    sopTitle: 'Pengolahan Data Statistik',
    category: 'Teknis',
    department: 'Statistik Sosial',
    avgRating: 4.2,
    totalReviews: 8,
    lastReviewDate: '2025-11-09',
    criteriaScores: [
      { name: 'Kelengkapan Konten', score: 4.1 },
      { name: 'Kejelasan Prosedur', score: 4.3 },
      { name: 'Kemudahan Implementasi', score: 4.0 },
      { name: 'Relevansi', score: 4.5 },
      { name: 'Efektivitas', score: 4.1 }
    ],
    reviews: []
  },
  {
    id: 3,
    sopCode: 'SOP-003',
    sopTitle: 'Publikasi Laporan Statistik',
    category: 'Administrasi',
    department: 'Neraca',
    avgRating: 3.8,
    totalReviews: 10,
    lastReviewDate: '2025-11-07',
    criteriaScores: [
      { name: 'Kelengkapan Konten', score: 3.7 },
      { name: 'Kejelasan Prosedur', score: 3.9 },
      { name: 'Kemudahan Implementasi', score: 3.8 },
      { name: 'Relevansi', score: 4.0 },
      { name: 'Efektivitas', score: 3.6 }
    ],
    reviews: []
  }
])

// Filtered Evaluations
const filteredEvaluations = computed(() => {
  let result = evaluations.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(e => 
      e.sopCode.toLowerCase().includes(search) ||
      e.sopTitle.toLowerCase().includes(search)
    )
  }

  if (filters.value.department) {
    const dept = departments.value.find(d => d.id === filters.value.department)
    if (dept) {
      result = result.filter(e => e.department === dept.name)
    }
  }

  if (filters.value.category) {
    const cat = categories.value.find(c => c.id === filters.value.category)
    if (cat) {
      result = result.filter(e => e.category === cat.name)
    }
  }

  if (filters.value.minRating) {
    result = result.filter(e => e.avgRating >= filters.value.minRating)
  }

  return result
})

// Dialog State
const evaluationDialog = ref(false)
const detailDialog = ref(false)
const selectedSOP = ref(null)
const saving = ref(false)

const evaluationForm = ref({
  contentCompleteness: 0,
  procedureClarity: 0,
  easeOfImplementation: 0,
  relevance: 0,
  effectiveness: 0,
  comments: '',
  recommendation: null
})

const overallRating = computed(() => {
  const scores = [
    evaluationForm.value.contentCompleteness,
    evaluationForm.value.procedureClarity,
    evaluationForm.value.easeOfImplementation,
    evaluationForm.value.relevance,
    evaluationForm.value.effectiveness
  ]
  const sum = scores.reduce((a, b) => a + b, 0)
  const count = scores.filter(s => s > 0).length
  return count > 0 ? sum / count : 0
})

const dialogTitle = computed(() => {
  return selectedSOP.value ? `Penilaian SOP: ${selectedSOP.value.sopCode}` : 'Penilaian SOP'
})

const addEvaluation = (sop) => {
  selectedSOP.value = sop
  evaluationForm.value = {
    contentCompleteness: 0,
    procedureClarity: 0,
    easeOfImplementation: 0,
    relevance: 0,
    effectiveness: 0,
    comments: '',
    recommendation: null
  }
  evaluationDialog.value = true
}

const viewEvaluation = (sop) => {
  selectedSOP.value = sop
  detailDialog.value = true
}

const submitEvaluation = async () => {
  if (overallRating.value === 0) {
    toast.add({ severity: 'warn', summary: 'Perhatian', detail: 'Mohon berikan rating untuk semua kriteria', life: 3000 })
    return
  }

  saving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Penilaian berhasil disimpan', life: 3000 })
    evaluationDialog.value = false
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menyimpan penilaian', life: 3000 })
  } finally {
    saving.value = false
  }
}

const exportEvaluations = () => {
  toast.add({ severity: 'info', summary: 'Export', detail: 'Mengekspor data penilaian...', life: 3000 })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getRecommendationSeverity = (recommendation) => {
  const severityMap = {
    'HIGHLY_RECOMMENDED': 'success',
    'RECOMMENDED': 'info',
    'NEEDS_MINOR_IMPROVEMENT': 'warning',
    'NEEDS_MAJOR_IMPROVEMENT': 'warning',
    'NEEDS_REVISION': 'danger'
  }
  return severityMap[recommendation] || 'secondary'
}

onMounted(() => {
  // Load data
})
</script>

<style scoped>
.sop-evaluation {
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

/* Stat Cards */
.stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); color: #667eea; }
.stat-icon.green { background: linear-gradient(135deg, #10b98120 0%, #05966920 100%); color: #10b981; }
.stat-icon.purple { background: linear-gradient(135deg, #8b5cf620 0%, #7c3aed20 100%); color: #8b5cf6; }
.stat-icon.orange { background: linear-gradient(135deg, #f5970020 0%, #ea580c20 100%); color: #f59700; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

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

.sop-title-cell {
  display: flex;
  flex-direction: column;
}

.text-secondary {
  color: var(--text-color-secondary);
  font-size: 0.813rem;
}

.rating-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-text {
  font-weight: 600;
  color: var(--text-color);
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

/* Card View */
.evaluation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.evaluation-card-item {
  position: relative;
}

.card-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
}

.evaluation-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evaluation-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

/* Evaluation Form */
.evaluation-form {
  padding: 0.5rem 0;
}

.sop-info {
  padding: 0.75rem;
  background: var(--surface-100);
  border-radius: 6px;
}

.criteria-item {
  padding: 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.criteria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.overall-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-100);
  border-radius: 8px;
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

/* Detail Dialog */
.evaluation-detail {
  padding: 0.5rem 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.detail-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.detail-header p {
  margin: 0;
  color: var(--text-color-secondary);
}

.overall-score {
  text-align: center;
}

.score-text {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0.5rem 0;
}

.criteria-breakdown {
  margin: 1rem 0;
}

.criteria-breakdown h4 {
  margin-bottom: 1rem;
}

.criteria-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.criteria-name {
  flex: 0 0 200px;
  font-weight: 500;
}

.criteria-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.criteria-bar .score {
  font-weight: 600;
  color: var(--primary-color);
}

.reviews-section {
  margin: 1rem 0;
}

.reviews-section h4 {
  margin-bottom: 1rem;
}

.review-item {
  padding: 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reviewer-info div {
  display: flex;
  flex-direction: column;
}

.reviewer-info strong {
  font-size: 0.875rem;
}

.reviewer-info small {
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

.review-meta {
  text-align: right;
}

.review-meta small {
  display: block;
  color: var(--text-color-secondary);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.review-comment {
  margin: 0.5rem 0;
  color: var(--text-color);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .evaluation-cards {
    grid-template-columns: 1fr;
  }

  .detail-header {
    flex-direction: column;
  }

  .criteria-score {
    flex-direction: column;
    align-items: flex-start;
  }

  .criteria-name {
    flex: none;
    margin-bottom: 0.5rem;
  }

  .criteria-bar {
    width: 100%;
  }
}
</style>
