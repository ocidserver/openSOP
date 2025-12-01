<template>
  <div class="sop-approval-container">
    <!-- Header -->
    <div class="approval-header">
      <div class="approval-header-content">
        <div class="approval-breadcrumb">
          <router-link to="/sop" class="breadcrumb-link">
            <i class="pi pi-home"></i>
            SOP
          </router-link>
          <i class="pi pi-chevron-right"></i>
          {{ sopDetail?.title || 'SOP Detail' }}
        </div>

        <h1 class="approval-title">
          {{ workflowTitle }}
        </h1>

        <div class="approval-status" :class="getStatusClass(approvalData?.status)">
          <i class="status-icon" :class="getStatusIcon(approvalData?.status)"></i>
          <span class="status-text">{{ getStatusText(approvalData?.status) }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressBar mode="indeterminate" />
      <p class="loading-text">{{ loadingText }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <Message severity="error" :text="errorMessage" />
      <Button
        label="Kembali"
        icon="pi pi-arrow-left"
        @click="$router.go(-1)"
        class="p-button-outlined"
      />
    </div>

    <!-- Main Content -->
    <div v-else class="approval-content">
      <!-- SOP Info -->
      <div class="sop-info-card">
        <Card>
          <template #content>
            <div class="sop-info-grid">
              <div class="info-item">
                <label>Nomor SOP</label>
                <span>{{ sopDetail?.sopNumber }}</span>
              </div>
              <div class="info-item">
                <label>Kategori</label>
                <span>{{ sopDetail?.categories?.[0]?.name }}</span>
              </div>
              <div class="info-item">
                <label>Status Saat Ini</label>
                <span>{{ sopDetail?.status }}</span>
              </div>
              <div class="info-item">
                <label>Departemen</label>
                <span>{{ sopDetail?.department?.name }}</span>
              </div>
              <div class="info-item">
                <label>Complexity</label>
                <span>{{ sopDetail?.complexity }}</span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Workflow Steps -->
      <div class="workflow-steps">
        <div class="steps-header">
          <h3>Proses Approval</h3>
          <p class="steps-description">Berikut adalah alur approval yang perlu dilalui</p>
        </div>

        <div class="steps-container">
          <div class="step-item" :class="{ getStepClass(1, currentStep) }">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">Review & Validasi</div>
              <div class="step-description">Supervisor melakukan review terhadap dokumen SOP</div>
              <div v-if="showStepInfo(1)" class="step-requirements">
                <h4>Yang Perlu Diperiksa:</h4>
                <ul>
                  <li v-for="requirement in getRequirements(1)">
                    {{ requirement }}
                  </li>
                </ul>
              </div>
              <div v-if="currentStep >= 1" class="step-status">
                <div class="status-indicator" :class="getStepStatusClass(1, workflowData?.step1Status)">
                  <i class="pi pi-check"></i>
                  <span>{{ getStepStatusText(1, workflowData?.step1Status) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="step-item" :class="{ getStepClass(2, currentStep) }">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">Persetujuan</div>
              <div class="step-description">Kepala Departemen melakukan persetujuan final dokumen SOP</div>
              <div v-if="showStepInfo(2)" class="step-requirements">
                <h4>Yang Perlu Diperiksa:</h4>
                <ul>
                  <li v-for="requirement in getRequirements(2)">
                    {{ requirement }}
                  </li>
                </ul>
              </div>
              <div v-if="currentStep >= 2" class="step-status">
                <div class="status-indicator" :class="getStepStatusClass(2, workflowData?.step2Status)">
                  <i class="pi pi-check"></i>
                  <span>{{ getStepStatusText(2, workflowData?.step2Status) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="step-item" :class="{ getStepClass(3, currentStep) }">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">Aktivasi</div>
              <div class="step-description">SOP resmi diaktifkan dan dapat digunakan oleh seluruh pemangku terkait</div>
              <div v-if="showStepInfo(3)" class="step-requirements">
                <h4>Yang Perlu Diperiksa:</h4>
                <ul>
                  <li v-for="requirement in getRequirements(3)">
                    {{ requirement }}
                  </li>
                </ul>
              </div>
              <div v-if="currentStep >= 3" class="step-status">
                <div class="status-indicator" :class="getStepStatusClass(3, workflowData?.step3Status)">
                  <i class="pi pi-check"></i>
                  <span>{{ getStepStatusText(3, workflowData?.step3Status) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="step-item" :class="{ getStepClass(4, currentStep) }">
            <div class="step-number">4</div>
            <div class="step-content">
              <div class="step-title">Distribusi & Publikasi</div>
              <div class="step-description">Dokumen SOP disebarkan ke seluruh pemangku terkait melalui email dan notifikasi sistem</div>
              <div v-if="showStepInfo(4)" class="step-requirements">
                <h4>Yang Perlu Diperiksa:</h4>
                <ul>
                  <li v-for="requirement in getRequirements(4)">
                    {{ requirement }}
                  </li>
                </ul>
              </div>
              <div v-if="currentStep >= 4" class="step-status">
                <div class="status-indicator" :class="getStepStatusClass(4, workflowData?.step4Status)">
                  <i class="pi pi-check"></i>
                  <span>{{ getStepStatusText(4, workflowData?.step4Status) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="approval-actions">
        <div v-if="canApprove && currentStep < 3" class="action-buttons">
          <Button
            label="Tolak"
            icon="pi pi-times"
            @click="rejectSOP"
            class="p-button-danger p-button-outlined"
          />
          <Button
            label="Setujui"
            icon="pi pi-check"
            @click="approveSOP"
            class="p-button-success p-button-outlined"
          />
        </div>

        <div v-if="canActivate && currentStep >= 3 && !isActivated" class="action-buttons">
          <Button
            label="Aktifkan SOP"
            icon="pi pi-play"
            @click="activateSOP"
            class="p-button-success p-button-outlined"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/toast'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'SOPApproval',
  props: {
    sopId: {
      type: String,
      required: true
    }
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()

    const sopDetail = ref(null)
    const loading = ref(false)
    const error = ref('')
    const workflowData = ref({})
    const currentStep = ref(1)

    onMounted(async () => {
      await loadSOPDetail()
    }),

    methods: {
      async loadSOPDetail() {
        try {
          loading.value = true
          error.value = ''

          const token = localStorage.getItem('token')

          const response = await fetch(`/api/sop/${this.sopId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Failed to load SOP document')
          }

          const sopData = await response.json()
          sopDetail.value = sopData

          // Load workflow data jika ada
          await this.loadWorkflowData(sopData.id)

        } catch (err) {
          console.error('Error loading SOP detail:', err)
          error.value = 'Gagal memuat detail SOP'
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
            life: 3000
          })
        } finally {
          loading.value = false
        }
      },

      async loadWorkflowData(sopId) {
        try {
          const token = localStorage.getItem('token')

          const response = await fetch(`/api/workflows/sop/${sopId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            workflowData.value = data
          } else {
            // Default workflow data jika tidak ada
            workflowData.value = {
              step1Status: 'pending',
              step2Status: 'pending',
              step3Status: 'pending',
              step4Status: 'pending'
            }
          }
        } catch (err) {
          console.warn('Could not load workflow data:', err)
        }
      },

      // Get requirements for each step
      getRequirements(step) {
        const requirements = {
          1: ['Dokumen SOP lengkap', 'Format penulisan sesuai standar', 'Substansi administrasi dan legal'],
          2: ['Compliance dengan regulasi', 'Kelayakan operasional', 'Historical perubahan'],
          3: ['Persetujuan dari atasan', 'Dokumentasi pendukung', 'Persetujuan teknis informasi'],
          4: ['Kesiapan implementasi', 'Pelatihan pemangku terkait', 'Mekanisme monitoring dan evaluasi']
        }
        return requirements[step] || []
      },

      // Check if we can show step info
      showStepInfo(step) {
        return !this.workflowData.value || this.workflowData.value[`step${step}Status`] === 'pending'
      },

      // Get step class for styling
      getStepClass(step, currentStep) {
        let classStr = 'step-item'
        if (currentStep > step) {
          classStr += ' step-completed'
        } else if (currentStep < step) {
          classStr += ' step-disabled'
        }
        return classStr
      },

      // Get step status class
      getStepStatusClass(step, status) {
        let classStr = 'status-indicator'
        if (status === 'completed') {
          classStr += ' status-success'
        } else if (status === 'failed') {
          classStr += ' status-error'
        }
        return classStr
      },

      // Get step status text
      getStepStatusText(step, status) {
        const statusTexts = {
          1: { completed: 'Review selesai', pending: 'Menunggu review', failed: 'Review gagal' },
          2: { completed: 'Persetujuan selesai', pending: 'Menunggu persetujuan', failed: 'Persetujuan gagal' },
          3: { completed: 'Aktivasi selesai', pending: 'Menunggu aktivasi', failed: 'Aktivasi gagal' },
          4: { completed: 'Distribusi selesai', pending: 'Menunggu distribusi', failed: 'Distribusi gagal' }
        }
        return statusTexts[step]?.[status] || statusTexts[step]?.pending || 'In Progress'
      },

      // Get status class for overall approval status
      getStatusClass(status) {
        let classStr = 'approval-status'
        if (status === 'ACTIVE') {
          classStr += ' status-active'
        } else if (status === 'APPROVED') {
          classStr += ' status-approved'
        } else if (status === 'REVIEW') {
          classStr += ' status-review'
        } else if (status === 'DRAFT') {
          classStr += ' status-draft'
        } else if (status === 'REVISION') {
          classStr += ' status-revision'
        } else if (status === 'ARCHIVED') {
          classStr += ' status-archived'
        }
        return classStr
      },

      // Get status icon
      getStatusIcon(status) {
        const icons = {
          ACTIVE: 'pi pi-circle-fill status-icon-active',
          APPROVED: 'pi pi-check-circle status-icon-success',
          REVIEW: 'pi pi-eye status-icon-warning',
          DRAFT: 'pi pi-pencil status-icon-info',
          REVISION: 'pi pi-refresh status-icon-info',
          ARCHIVED: 'pi pi-archive status-icon-secondary'
        }
        return icons[status] || 'pi pi-info-circle'
      },

      // Get status text
      getStatusText(status) {
        const statusTexts = {
          ACTIVE: 'Aktif',
          APPROVED: 'Disetujui',
          REVIEW: 'Dalam Review',
          DRAFT: 'Draft',
          REVISION: 'Revisi',
          ARCHIVED: 'Diarsipkan'
        }
        return statusTexts[status] || status
      },

      // Computed properties
      workflowTitle: computed(() => {
        return `Workflow Approval - ${sopDetail.value?.title || 'SOP'}`
      }),

      canApprove: computed(() => {
        return currentStep.value >= 3 && currentStep.value < 4 &&
               workflowData.value.step2Status === 'completed' &&
               sopDetail.value?.status === 'APPROVED'
      }),

      isActivated: computed(() => {
        return sopDetail.value?.status === 'ACTIVE'
      }),

      currentStep: computed(() => {
        return currentStep.value
      })
    },

    async approveSOP() {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(`/api/sop/${this.sopId}/approve`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to approve SOP')
        }

        const result = await response.json()

        if (result.success) {
          toast.add({
            severity: 'success',
            summary: 'SOP Berhasil Disetujui',
            detail: 'SOP telah disetujui dan dapat diaktifkan',
            life: 3000
          })

          // Update workflow data
          await this.loadWorkflowData(this.sopId)

          // Refresh SOP detail
          await this.loadSOPDetail()
        } else {
          throw new Error(result.message || 'Failed to approve SOP')
        }
      } catch (err) {
        console.error('Error approving SOP:', err)
        toast.add({
          severity: 'error',
          summary: 'Approval Gagal',
          detail: err.message,
          life: 3000
        })
      }
    },

    async rejectSOP() {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(`/api/sop/${this.sopId}/reject`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reason: 'Tidak memenuhi persyaratan',
            notes: ''
          })
        })

        if (!response.ok) {
          throw new Error('Failed to reject SOP')
        }

        const result = await response.json()

        if (result.success) {
          toast.add({
            severity: 'success',
            summary: 'SOP Ditolak',
            detail: 'SOP telah ditolak dengan alasan yang diberikan',
            life: 3000
          })

          // Update workflow data
          await this.loadWorkflowData(this.sopId)

          // Refresh SOP detail
          await this.loadSOPDetail()
        } else {
          throw new Error(result.message || 'Failed to reject SOP')
        }
      } catch (err) {
        console.error('Error rejecting SOP:', err)
        toast.add({
          severity: 'error',
          summary: 'Penolakan Gagal',
          detail: err.message,
          life: 3000
        })
      }
    },

    async activateSOP() {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(`/api/sop/${this.sopId}/activate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to activate SOP')
        }

        const result = await response.json()

        if (result.success) {
          toast.add({
            severity: 'success',
            summary: 'SOP Diaktifkan',
            detail: 'SOP telah diaktifkan dan siap digunakan',
            life: 3000
          })

          // Update workflow data
          await this.loadWorkflowData(this.sopId)

          // Refresh SOP detail
          await this.loadSOPDetail()
        } else {
          throw new Error(result.message || 'Failed to activate SOP')
        }
      } catch (err) {
        console.error('Error activating SOP:', err)
        toast.add({
          severity: 'error',
          summary: 'Aktivasi Gagal',
          detail: err.message,
          life: 3000
        })
      }
    }
  }
}
</script>

<style scoped>
.sop-approval-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.approval-header {
  margin-bottom: 2rem;
}

.approval-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.approval-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
}

.approval-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.approval-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.status-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.status-text {
  font-size: 1.2rem;
  font-weight: 600;
}

.status-active {
  background-color: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.status-approved {
  background-color: #22c55e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(34, 197, 94, 0.1);
}

.status-review {
  background-color: #f59e0b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);
}

.approval-content {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-text {
  font-size: 1.2rem;
  color: #6c757d;
}

.error-container {
  text-align: center;
  padding: 4rem 2rem;
}

.sop-info-card {
  margin-bottom: 2rem;
}

.sop-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.info-item span {
  color: #374151;
}

.workflow-steps {
  margin-bottom: 2rem;
}

.steps-header {
  margin-bottom: 1rem;
}

.steps-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: #2c3e50;
  color: white;
  font-weight: 600;
  border-radius: 6px 0 0 8px;
}

.step-content {
  flex: 1;
  padding-left: 1rem;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.step-requirements {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(44, 62, 80, 0.1);
  border-radius: 6px;
}

.step-requirements h4 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: #2c3e50;
}

.step-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.step-requirements li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.step-requirements li::before {
  content: '✓';
  color: #22c55e;
  font-weight: bold;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.step-status {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-success {
  background-color: #10b981;
  color: white;
}

.status-error {
  background-color: #e74c3c;
  color: white;
}

.step-completed {
  border-left: 4px solid #22c55e;
}

.step-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.approval-actions {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Responsive Design */
@media (max-width: 768px) {
  .sop-approval-container {
    padding: 1rem;
  }

  .steps-container {
    gap: 0.75rem;
  }

  .step-item {
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .sop-info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .sop-approval-container {
    background-color: #1f2937;
  }

  .sop-info-card {
    background-color: #374151;
  }

  .step-item {
    background-color: #374151;
    border-color: #4a5568;
  }

  .step-title {
    color: #a0aec0;
  }

  .step-description {
    color: #d1d5db;
  }

  .step-requirements {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .step-requirements h4 {
    color: #a0aec0;
  }

  .step-requirements li::before {
    color: #a0aec0;
  }
}
</style>