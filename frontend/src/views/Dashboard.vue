<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Selamat datang, {{ authStore.user?.name }}! 👋</p>
      </div>
      <div class="header-actions">
        <Button label="Refresh" icon="pi pi-refresh" outlined size="small" @click="refreshData" :loading="loading" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">Total SOP</div>
                <div class="stat-value">{{ stats.totalSOP }}</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> 12%
                </div>
              </div>
              <div class="stat-icon blue">
                <i class="pi pi-file"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">SOP Aktif</div>
                <div class="stat-value">{{ stats.activeSOP }}</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> 8%
                </div>
              </div>
              <div class="stat-icon green">
                <i class="pi pi-check-circle"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">Perlu Review</div>
                <div class="stat-value">{{ stats.pendingReview }}</div>
                <div class="stat-change">
                  <i class="pi pi-minus"></i> 0%
                </div>
              </div>
              <div class="stat-icon orange">
                <i class="pi pi-clock"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-label">Kategori</div>
                <div class="stat-value">{{ stats.categories }}</div>
                <div class="stat-change positive">
                  <i class="pi pi-plus"></i> 2
                </div>
              </div>
              <div class="stat-icon purple">
                <i class="pi pi-tags"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid mt-4">
      <div class="col-12 lg:col-8">
        <Card>
          <template #title>
            <div class="card-header">
              <span>SOP Terbaru</span>
              <Button label="Lihat Semua" text size="small" @click="$router.push('/sop')" />
            </div>
          </template>
          <template #content>
            <DataTable :value="recentSOPs" class="p-datatable-sm">
              <Column field="code" header="Kode"></Column>
              <Column field="title" header="Judul"></Column>
              <Column field="category" header="Kategori">
                <template #body="slotProps">
                  <Tag :value="slotProps.data.category" severity="info" />
                </template>
              </Column>
              <Column field="status" header="Status">
                <template #body="slotProps">
                  <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-4">
        <Card class="mb-3">
          <template #title>Quick Actions</template>
          <template #content>
            <div class="flex flex-column gap-2">
              <!-- Admin & User dapat membuat SOP -->
              <Button 
                label="Buat SOP Baru" 
                icon="pi pi-plus" 
                class="w-full" 
                @click="$router.push('/sop/create')" 
                v-if="canCreateSOP" 
              />
              <!-- Semua role dapat melihat SOP -->
              <Button 
                label="Lihat Semua SOP" 
                icon="pi pi-list" 
                severity="secondary" 
                outlined 
                class="w-full" 
                @click="$router.push('/sop')" 
              />
              <!-- Admin & Supervisor dapat akses laporan -->
              <Button 
                label="Laporan" 
                icon="pi pi-chart-bar" 
                severity="help" 
                outlined 
                class="w-full" 
                @click="$router.push('/reports')" 
                v-if="canViewReports"
              />
              <!-- Hanya Admin dapat manage user -->
              <Button 
                label="Kelola Pengguna" 
                icon="pi pi-users" 
                severity="info" 
                outlined 
                class="w-full" 
                @click="$router.push('/users')" 
                v-if="isAdmin"
              />
            </div>
          </template>
        </Card>

        <Card>
          <template #title>Aktivitas Terkini</template>
          <template #content>
            <div class="activity-list">
              <div v-for="activity in activities" :key="activity.id" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-text">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const isAdmin = computed(() => authStore.user?.role === 'ADMIN')
const isSupervisor = computed(() => authStore.user?.role === 'SUPERVISOR')
const isUser = computed(() => authStore.user?.role === 'USER')
const isGuest = computed(() => authStore.user?.role === 'GUEST')

// Permissions berdasarkan role
const canCreateSOP = computed(() => ['ADMIN', 'USER'].includes(authStore.user?.role))
const canEditSOP = computed(() => ['ADMIN', 'USER'].includes(authStore.user?.role))
const canApproveSOP = computed(() => ['ADMIN', 'SUPERVISOR'].includes(authStore.user?.role))
const canViewReports = computed(() => ['ADMIN', 'SUPERVISOR', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA'].includes(authStore.user?.role))
const canManageUsers = computed(() => authStore.user?.role === 'ADMIN')
const canManageDepartments = computed(() => authStore.user?.role === 'ADMIN')

const stats = ref({
  totalSOP: 25,
  activeSOP: 18,
  pendingReview: 3,
  categories: 8
})

const recentSOPs = ref([
  { id: 1, code: 'SOP-001', title: 'Prosedur Pengumpulan Data', category: 'Operasional', status: 'ACTIVE' },
  { id: 2, code: 'SOP-002', title: 'Pengolahan Data Statistik', category: 'Teknis', status: 'REVIEW' },
  { id: 3, code: 'SOP-003', title: 'Publikasi Laporan', category: 'Administrasi', status: 'DRAFT' }
])

const activities = ref([
  { id: 1, title: 'SOP baru dibuat', time: '2 jam lalu', icon: 'pi pi-plus-circle', type: 'create' },
  { id: 2, title: 'Review selesai', time: '5 jam lalu', icon: 'pi pi-check-circle', type: 'approve' },
  { id: 3, title: 'SOP diperbarui', time: '1 hari lalu', icon: 'pi pi-pencil', type: 'edit' }
])

const getStatusSeverity = (status) => {
  const severityMap = {
    'ACTIVE': 'success',
    'REVIEW': 'warning',
    'DRAFT': 'info',
    'ARCHIVED': 'danger'
  }
  return severityMap[status] || 'secondary'
}

const refreshData = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Load data
})
</script>

<style scoped>
.dashboard {
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

.page-subtitle {
  color: var(--text-color-secondary);
  font-size: 0.938rem;
  margin: 0.5rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Stat Cards */
.stat-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
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
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.813rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change i {
  font-size: 0.75rem;
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

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  color: #667eea;
}

.stat-icon.green {
  background: linear-gradient(135deg, #10b98120 0%, #05966920 100%);
  color: #10b981;
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f5970020 0%, #ea580c20 100%);
  color: #f59700;
}

.stat-icon.purple {
  background: linear-gradient(135deg, #8b5cf620 0%, #7c3aed20 100%);
  color: #8b5cf6;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.create {
  background-color: #dbeafe;
  color: #3b82f6;
}

.activity-icon.approve {
  background-color: #d1fae5;
  color: #10b981;
}

.activity-icon.edit {
  background-color: #fed7aa;
  color: #f59e0b;
}

.activity-text {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.875rem;
}

.activity-time {
  color: #6c757d;
  font-size: 0.75rem;
  margin-top: 0.125rem;
}

/* Responsive */
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

  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
}
</style>
