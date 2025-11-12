<template>
  <div class="sop-detail">
    <!-- Action Bar -->
    <div class="action-bar">
      <Button 
        icon="pi pi-arrow-left" 
        label="Kembali" 
        @click="goBack" 
        class="p-button-text" 
      />
      <div class="action-buttons">
        <!-- Tombol Approve dan Reject untuk Supervisor saat review -->
        <template v-if="isReviewMode && canApprove">
          <Button 
            icon="pi pi-times" 
            label="Reject" 
            @click="showRejectDialog" 
            severity="danger"
            outlined
          />
          <Button 
            icon="pi pi-check" 
            label="Approve" 
            @click="showApproveDialog" 
            severity="success"
          />
        </template>
        
        <!-- Tombol normal untuk non-review -->
        <template v-else>
          <Button 
            icon="pi pi-file-pdf" 
            label="Unduh PDF" 
            @click="downloadPDF" 
            class="p-button-outlined" 
          />
          <Button 
            icon="pi pi-pencil" 
            label="Edit" 
            @click="editSOP" 
            class="p-button-outlined" 
            v-if="canEdit"
          />
        </template>
      </div>
    </div>

    <!-- HEADER SECTION: Identitas SOP -->
    <Card class="metadata-card">
      <template #title>
        <div class="sop-header">
          <div class="sop-logo">
            <img src="@/assets/images/logo-opensop.png" alt="Logo BPS" />
          </div>
          <div class="sop-title-section">
            <h1 class="sop-title">{{ sopData.judul }}</h1>
            <div class="sop-number">{{ sopData.nomorSOP }}</div>
          </div>
        </div>
      </template>
      <template #content>
        <!-- Metadata Grid -->
        <div class="metadata-grid">
          <!-- Kolom Kiri -->
          <div class="metadata-column">
            <div class="metadata-item">
              <label>Tanggal Penetapan</label>
              <div class="metadata-value">{{ formatDate(sopData.tanggalPenetapan) }}</div>
            </div>
            
            <div class="metadata-item">
              <label>Tanggal Berlaku</label>
              <div class="metadata-value">{{ formatDate(sopData.tanggalBerlaku) }}</div>
            </div>
            
            <div class="metadata-item">
              <label>Tanggal Revisi</label>
              <div class="metadata-value">{{ sopData.tanggalRevisi ? formatDate(sopData.tanggalRevisi) : 'N/A' }}</div>
            </div>
            
            <div class="metadata-item">
              <label>Status</label>
              <Tag :value="sopData.status" :severity="getStatusSeverity(sopData.status)" />
            </div>

            <div class="metadata-item">
              <label>Jenis SOP</label>
              <div class="metadata-value">{{ sopData.jenisSOP }}</div>
            </div>

            <div class="metadata-item">
              <label>Klasifikasi</label>
              <div class="metadata-value">
                {{ sopData.klasifikasiCakupan }} - {{ sopData.klasifikasiKelengkapan }} - {{ sopData.klasifikasiSifat }}
              </div>
            </div>
          </div>

          <!-- Kolom Kanan -->
          <div class="metadata-column">
            <div class="metadata-item">
              <label>Unit Kerja</label>
              <div class="metadata-value">{{ sopData.unitKerja }}</div>
            </div>

            <div class="metadata-item">
              <label>Disahkan Oleh</label>
              <div class="metadata-value">{{ sopData.pengesahanUser }}</div>
            </div>

            <div class="metadata-item">
              <label>Tanggal Pengesahan</label>
              <div class="metadata-value">{{ sopData.tanggalPengesahan ? formatDate(sopData.tanggalPengesahan) : 'Belum disahkan' }}</div>
            </div>

            <div class="metadata-item" v-if="sopData.keterkaitan && sopData.keterkaitan.length > 0">
              <label>SOP Terkait</label>
              <div class="related-sop">
                <router-link 
                  v-for="related in sopData.keterkaitan" 
                  :key="related.id"
                  :to="`/sop/${related.sopTerkaitId}`"
                  class="related-link"
                >
                  {{ related.nomorSOP }} ({{ related.tipeHubungan }})
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <!-- Detail Information -->
        <Accordion :multiple="true" :activeIndex="[0, 1, 2]">
          <AccordionTab header="Dasar Hukum">
            <div class="content-section" v-html="sopData.dasarHukum || 'N/A'"></div>
          </AccordionTab>

          <AccordionTab header="Maksud dan Tujuan">
            <div class="content-section" v-html="sopData.maksudTujuan || 'N/A'"></div>
          </AccordionTab>

          <AccordionTab header="Kualifikasi Pelaksana">
            <div class="content-section" v-html="sopData.kualifikasiPelaksana || 'N/A'"></div>
          </AccordionTab>

          <AccordionTab header="Peralatan dan Perlengkapan">
            <div class="content-section" v-html="sopData.peralatanPerlengkapan || 'N/A'"></div>
          </AccordionTab>

          <AccordionTab header="Peringatan" v-if="sopData.peringatan">
            <div class="content-section warning-box" v-html="sopData.peringatan"></div>
          </AccordionTab>

          <AccordionTab header="Catatan Pendataan" v-if="sopData.catatanPendataan">
            <div class="content-section" v-html="sopData.catatanPendataan"></div>
          </AccordionTab>
        </Accordion>
      </template>
    </Card>

    <!-- BODY SECTION: Flowchart Prosedur -->
    <Card class="flowchart-card">
      <template #title>
        <div class="flowchart-header">
          <h2>Prosedur Kerja</h2>
          <div class="flowchart-actions">
            <Button 
              icon="pi pi-pencil" 
              label="Edit Flowchart" 
              @click="openFlowchartEditor" 
              class="p-button-outlined"
              v-if="canEdit"
            />
            <SelectButton 
              v-model="viewMode" 
              :options="viewOptions" 
              optionLabel="label"
              optionValue="value"
              aria-labelledby="view-mode-selector"
              :unselectable="false"
            />
          </div>
        </div>
      </template>
      <template #content>
        <!-- Flowchart SOP (Custom Swimlanes) -->
        <div v-show="viewMode === 'flowchart'" class="sop-flowchart-view">
          <SOPFlowchart 
            :flowchartData="flowchartData"
            :aktors="aktors"
          />
        </div>

        <!-- BPMN Diagram View -->
        <div v-show="viewMode === 'bpmn'" class="bpmn-view">
          <BpmnViewer 
            :flowchartData="flowchartData"
            :aktors="aktors"
            :xml="bpmnXML"
          />
        </div>

        <!-- Table View (Original) -->
        <div v-show="viewMode === 'table'" class="flowchart-container">
          <div class="table-responsive">
            <table class="flowchart-table">
              <thead>
                <tr>
                  <th rowspan="2" class="col-no">No</th>
                  <th rowspan="2" class="col-kegiatan">Aktivitas Kegiatan</th>
                  <th colspan="4" class="col-pelaksana-header">Pelaksana</th>
                  <th rowspan="2" class="col-mutu">Kelengkapan</th>
                  <th rowspan="2" class="col-mutu">Waktu</th>
                  <th rowspan="2" class="col-mutu">Output</th>
                  <th rowspan="2" class="col-keterangan">Keterangan</th>
                </tr>
                <tr>
                  <th 
                    v-for="aktor in aktors" 
                    :key="aktor.id" 
                    class="col-aktor"
                  >
                    {{ aktor.namaJabatan }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="aktivitas in flowchartData" :key="aktivitas.id">
                  <td class="text-center">{{ aktivitas.noKegiatan }}</td>
                  <td class="kegiatan-cell">
                    <div class="activity-content">
                      <div 
                        class="activity-symbol" 
                        :class="`symbol-${aktivitas.tipeSimbol.toLowerCase()}`"
                      >
                        <div class="symbol-content">
                          {{ getSymbolLabel(aktivitas.tipeSimbol) }}
                        </div>
                      </div>
                      <div class="activity-text">{{ aktivitas.aktivitasKegiatan }}</div>
                      
                      <!-- Decision Branch (if any) -->
                      <div v-if="aktivitas.tipeSimbol === 'BELAH_KETUPAT'" class="decision-branch">
                        <div class="branch-yes">
                          <i class="pi pi-arrow-right"></i> Ya: {{ aktivitas.nextActivityYes || 'Lanjut' }}
                        </div>
                        <div class="branch-no">
                          <i class="pi pi-arrow-left"></i> Tidak: {{ aktivitas.nextActivityNo || 'Selesai' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Aktor Columns (Swimlanes) -->
                  <td 
                    v-for="aktor in aktors" 
                    :key="aktor.id"
                    class="aktor-cell"
                    :class="{ 'active-aktor': aktivitas.aktorId === aktor.id }"
                  >
                    <div v-if="aktivitas.aktorId === aktor.id" class="process-box">
                      <i class="pi pi-circle-fill"></i>
                    </div>
                  </td>

                  <!-- Mutu Baku Columns -->
                  <td class="mutu-cell">
                    <div v-if="aktivitas.mutuBaku">
                      {{ aktivitas.mutuBaku.persyaratanKelengkapan || '-' }}
                    </div>
                  </td>
                  <td class="mutu-cell text-center">
                    <div v-if="aktivitas.mutuBaku">
                      <Tag :value="aktivitas.mutuBaku.waktu || '-'" severity="info" />
                    </div>
                  </td>
                  <td class="mutu-cell">
                    <div v-if="aktivitas.mutuBaku">
                      {{ aktivitas.mutuBaku.output || '-' }}
                    </div>
                  </td>

                  <!-- Keterangan with Hyperlinks -->
                  <td class="keterangan-cell">
                    <div v-if="aktivitas.mutuBaku && aktivitas.mutuBaku.keterangan">
                      <span v-html="renderKeteranganWithLinks(aktivitas.mutuBaku.keterangan)"></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </Card>

    <!-- Edit Flowchart Dialog -->
    <Dialog 
      v-model:visible="showFlowchartEditor" 
      header="Edit Flowchart Prosedur" 
      :modal="true"
      :closable="true"
      :style="{ width: '95vw', height: '90vh' }"
      :contentStyle="{ height: 'calc(90vh - 120px)', padding: 0 }"
    >
      <BpmnEditor 
        :flowchartData="flowchartData"
        :xml="bpmnXML"
        @save="saveFlowchart"
        @cancel="showFlowchartEditor = false"
      />
    </Dialog>

    <!-- Edit Metadata Dialog -->
    <Dialog 
      v-model:visible="showMetadataEditor" 
      header="Edit Metadata SOP" 
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div class="metadata-form">
        <p>Form edit metadata akan segera tersedia...</p>
      </div>
      <template #footer>
        <Button label="Batal" @click="showMetadataEditor = false" class="p-button-text" />
        <Button label="Simpan" @click="saveMetadata" severity="success" />
      </template>
    </Dialog>

    <!-- Approve Dialog -->
    <Dialog 
      v-model:visible="approveDialog" 
      header="Approve SOP" 
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="approval-content">
        <i class="pi pi-check-circle" style="font-size: 3rem; color: var(--green-500); display: block; text-align: center; margin-bottom: 1rem;"></i>
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 1rem;">
          Apakah Anda yakin ingin <strong>menyetujui</strong> SOP ini?
        </p>
        <p style="text-align: center; color: var(--text-color-secondary);">
          SOP: <strong>{{ sopData.nomorSOP }}</strong><br/>
          {{ sopData.judul }}
        </p>
        
        <div class="field mt-4">
          <label for="approveNotes">Catatan (Opsional)</label>
          <Textarea 
            id="approveNotes"
            v-model="approvalNotes" 
            rows="3" 
            placeholder="Tambahkan catatan untuk approval ini..."
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" @click="approveDialog = false" class="p-button-text" />
        <Button label="Approve SOP" icon="pi pi-check" @click="confirmApprove" severity="success" :loading="approving" />
      </template>
    </Dialog>

    <!-- Reject Dialog -->
    <Dialog 
      v-model:visible="rejectDialog" 
      header="Reject SOP" 
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="approval-content">
        <i class="pi pi-times-circle" style="font-size: 3rem; color: var(--red-500); display: block; text-align: center; margin-bottom: 1rem;"></i>
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 1rem;">
          Apakah Anda yakin ingin <strong>menolak</strong> SOP ini?
        </p>
        <p style="text-align: center; color: var(--text-color-secondary);">
          SOP: <strong>{{ sopData.nomorSOP }}</strong><br/>
          {{ sopData.judul }}
        </p>
        
        <div class="field mt-4">
          <label for="rejectNotes">Alasan Penolakan <span style="color: red;">*</span></label>
          <Textarea 
            id="rejectNotes"
            v-model="rejectionNotes" 
            rows="4" 
            placeholder="Jelaskan alasan penolakan dan perbaikan yang diperlukan..."
            class="w-full"
            :class="{ 'p-invalid': showRejectError }"
          />
          <small v-if="showRejectError" class="p-error">Alasan penolakan wajib diisi</small>
        </div>
      </div>
      <template #footer>
        <Button label="Batal" @click="closeRejectDialog" class="p-button-text" />
        <Button label="Reject SOP" icon="pi pi-times" @click="confirmReject" severity="danger" :loading="rejecting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import BpmnViewer from '@/components/BpmnViewer.vue'
import BpmnEditor from '@/components/BpmnEditor.vue'
import SOPFlowchart from '@/components/SOPFlowchart.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

// Check if in review mode
const isReviewMode = computed(() => {
  return route.query.mode === 'review'
})

// Mock Data - Replace with API call
const sopData = ref({
  id: 'SOP-036-17000-2025',
  nomorSOP: 'SOP-036/17000/2025',
  judul: 'Penyusunan Analisis Statistik Sektoral',
  tanggalPenetapan: '2025-01-15',
  tanggalBerlaku: '2025-02-01',
  tanggalRevisi: null,
  tanggalPengesahan: '2025-01-20',
  status: 'ACTIVE',
  jenisSOP: 'TEKNIS',
  klasifikasiCakupan: 'MAKRO',
  klasifikasiKelengkapan: 'FINAL',
  klasifikasiSifat: 'GENERIK',
  unitKerja: 'Direktorat Analisis dan Pengembangan Statistik',
  pengesahanUser: 'Dr. Ahmad Subagyo, M.Si (Direktur)',
  dasarHukum: `
    <ol>
      <li>UU No. 16 Tahun 1997 tentang Statistik</li>
      <li>Peraturan Kepala BPS No. 19 Tahun 2013 tentang SOP AP</li>
      <li>Peraturan Internal BPS tentang Diseminasi Data</li>
    </ol>
  `,
  maksudTujuan: `
    <p><strong>Maksud:</strong> Memberikan panduan standar dalam penyusunan analisis statistik sektoral.</p>
    <p><strong>Tujuan:</strong></p>
    <ul>
      <li>Menjamin kualitas dan konsistensi analisis statistik</li>
      <li>Meningkatkan efisiensi proses analisis</li>
      <li>Memastikan koordinasi antar unit kerja</li>
    </ul>
  `,
  kualifikasiPelaksana: `
    <ul>
      <li>Minimal S1 Statistika/Ekonomi/Sosial</li>
      <li>Memiliki pemahaman metodologi penelitian</li>
      <li>Menguasai tools analisis statistik (SPSS, R, Python)</li>
      <li>Pengalaman minimal 2 tahun di bidang analisis data</li>
    </ul>
  `,
  peralatanPerlengkapan: `
    <ul>
      <li>Komputer dengan software statistik</li>
      <li>Akses database BPS</li>
      <li>Template laporan analisis</li>
      <li>Referensi metodologi statistik</li>
    </ul>
  `,
  peringatan: `
    <p><strong>⚠️ PERHATIAN:</strong></p>
    <ul>
      <li>Data yang digunakan harus sudah tervalidasi</li>
      <li>Analisis harus objektif dan tidak bias</li>
      <li>Jaga kerahasiaan data sensitif</li>
    </ul>
  `,
  catatanPendataan: 'SOP ini merupakan revisi dari SOP-036/17000/2023',
  keterkaitan: [
    { id: 1, sopTerkaitId: 'SOP-037-17000-2025', nomorSOP: 'SOP-037/17000/2025', tipeHubungan: 'SOP_LANJUTAN' }
  ]
})

// Mock Aktor Data
const aktors = ref([
  { id: 1, namaJabatan: 'Ketua Tim Metodologi dan Analisis Statistik' },
  { id: 2, namaJabatan: 'Ketua Project Analisis Sektor' },
  { id: 3, namaJabatan: 'Anggota' },
  { id: 4, namaJabatan: 'Tim Diseminasi' }
])

// Mock Flowchart Data
const flowchartData = ref([
  {
    id: 1,
    noKegiatan: 1,
    aktivitasKegiatan: 'Menerima permintaan analisis statistik sektoral',
    tipeSimbol: 'KAPSUL',
    aktorId: 1,
    mutuBaku: {
      persyaratanKelengkapan: 'Surat permintaan resmi',
      waktu: '1 hari',
      output: 'Permintaan tercatat',
      keterangan: 'Mulai proses'
    }
  },
  {
    id: 2,
    noKegiatan: 2,
    aktivitasKegiatan: 'Mengidentifikasi kebutuhan data dan metodologi',
    tipeSimbol: 'KOTAK',
    aktorId: 1,
    mutuBaku: {
      persyaratanKelengkapan: 'Dokumen permintaan, database BPS',
      waktu: '2 hari',
      output: 'Rencana analisis',
      keterangan: 'Koordinasi dengan pemohon'
    }
  },
  {
    id: 3,
    noKegiatan: 3,
    aktivitasKegiatan: 'Menyusun design analisis dan timeline',
    tipeSimbol: 'KOTAK',
    aktorId: 2,
    mutuBaku: {
      persyaratanKelengkapan: 'Rencana analisis, template design',
      waktu: '3 hari',
      output: 'Design analisis',
      keterangan: 'Review oleh Ketua Tim'
    }
  },
  {
    id: 4,
    noKegiatan: 4,
    aktivitasKegiatan: 'Apakah design analisis disetujui?',
    tipeSimbol: 'BELAH_KETUPAT',
    aktorId: 1,
    nextActivityYes: 'Lanjut ke No. 5',
    nextActivityNo: 'Kembali ke No. 3',
    mutuBaku: {
      persyaratanKelengkapan: 'Design analisis',
      waktu: '1 hari',
      output: 'Keputusan approval',
      keterangan: 'Jika tidak disetujui, revisi design'
    }
  },
  {
    id: 5,
    noKegiatan: 5,
    aktivitasKegiatan: 'Melakukan ekstraksi dan processing data',
    tipeSimbol: 'KOTAK',
    aktorId: 3,
    mutuBaku: {
      persyaratanKelengkapan: 'Akses database, tools statistik',
      waktu: '5 hari',
      output: 'Dataset analisis',
      keterangan: 'Menggunakan R/Python/SPSS'
    }
  },
  {
    id: 6,
    noKegiatan: 6,
    aktivitasKegiatan: 'Melakukan analisis statistik',
    tipeSimbol: 'KOTAK',
    aktorId: 3,
    mutuBaku: {
      persyaratanKelengkapan: 'Dataset, metodologi',
      waktu: '1 minggu',
      output: 'Hasil analisis',
      keterangan: 'Sesuai dengan metodologi yang disetujui'
    }
  },
  {
    id: 7,
    noKegiatan: 7,
    aktivitasKegiatan: 'Menyusun laporan analisis',
    tipeSimbol: 'KOTAK',
    aktorId: 2,
    mutuBaku: {
      persyaratanKelengkapan: 'Hasil analisis, template laporan',
      waktu: '3 hari',
      output: 'Draft laporan',
      keterangan: 'Format sesuai template BPS'
    }
  },
  {
    id: 8,
    noKegiatan: 8,
    aktivitasKegiatan: 'Review dan finalisasi laporan',
    tipeSimbol: 'KOTAK',
    aktorId: 1,
    mutuBaku: {
      persyaratanKelengkapan: 'Draft laporan',
      waktu: '2 hari',
      output: 'Laporan final',
      keterangan: 'Quality check dan approval'
    }
  },
  {
    id: 9,
    noKegiatan: 9,
    aktivitasKegiatan: 'Mendistribusikan laporan analisis',
    tipeSimbol: 'KOTAK',
    aktorId: 4,
    mutuBaku: {
      persyaratanKelengkapan: 'Laporan final, daftar distribusi',
      waktu: '1 hari',
      output: 'Laporan terdistribusi',
      keterangan: 'Lanjut ke SOP-037/17000/2025 untuk publikasi'
    }
  },
  {
    id: 10,
    noKegiatan: 10,
    aktivitasKegiatan: 'Selesai',
    tipeSimbol: 'KAPSUL',
    aktorId: 4,
    mutuBaku: {
      persyaratanKelengkapan: '-',
      waktu: '-',
      output: 'Proses selesai',
      keterangan: 'Dokumentasi dan arsip'
    }
  }
])

// UI State
const viewMode = ref('flowchart') // 'bpmn', 'flowchart', 'table'
const showFlowchartEditor = ref(false)
const showMetadataEditor = ref(false)
const bpmnXML = ref('')
const bpmnViewerRef = ref(null)

// Approval/Reject State
const approveDialog = ref(false)
const rejectDialog = ref(false)
const approvalNotes = ref('')
const rejectionNotes = ref('')
const approving = ref(false)
const rejecting = ref(false)
const showRejectError = ref(false)

// View Options
const viewOptions = ref([
  { label: 'Flowchart SOP', value: 'flowchart', icon: 'pi pi-share-alt' },
  { label: 'BPMN', value: 'bpmn', icon: 'pi pi-sitemap' },
  { label: 'Tabel', value: 'table', icon: 'pi pi-table' }
])

// Watch viewMode changes
watch(viewMode, async (newValue) => {
  console.log('View mode changed to:', newValue)
  
  // If switching to BPMN view, wait for DOM update then trigger resize
  if (newValue === 'bpmn') {
    await nextTick()
    console.log('BPMN view now visible, waiting for initialization')
  }
})

// Computed
const canEdit = computed(() => {
  const user = authStore.user
  return user && ['ADMIN', 'SUPERVISOR', 'PIMPINAN_TINGGI_PRATAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_UTAMA'].includes(user.role)
})

const canApprove = computed(() => {
  const user = authStore.user
  // Supervisor can approve if status is REVIEW
  return user && sopData.value.status === 'REVIEW' && ['ADMIN', 'SUPERVISOR', 'PIMPINAN_TINGGI_PRATAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_UTAMA'].includes(user.role)
})

// Methods
const goBack = () => {
  router.push('/sop')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'DRAFT': 'secondary',
    'REVIEW': 'warning',
    'APPROVED': 'info',
    'ACTIVE': 'success',
    'REVISION': 'warning',
    'ARCHIVED': 'danger'
  }
  return severityMap[status] || 'secondary'
}

const getSymbolLabel = (tipeSimbol) => {
  const labels = {
    'KAPSUL': 'Start/End',
    'KOTAK': 'Proses',
    'BELAH_KETUPAT': 'Keputusan',
    'ANAK_PANAH': 'Alur',
    'SEGILIMA': 'Konektor'
  }
  return labels[tipeSimbol] || tipeSimbol
}

// Approval Functions
const showApproveDialog = () => {
  approveDialog.value = true
  approvalNotes.value = ''
}

const showRejectDialog = () => {
  rejectDialog.value = true
  rejectionNotes.value = ''
  showRejectError.value = false
}

const closeRejectDialog = () => {
  rejectDialog.value = false
  rejectionNotes.value = ''
  showRejectError.value = false
}

const confirmApprove = async () => {
  approving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // TODO: Replace with actual API call
    // await api.approveSOP(sopData.value.id, {
    //   notes: approvalNotes.value
    // })
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'SOP berhasil disetujui',
      life: 3000
    })
    
    // Update status
    sopData.value.status = 'ACTIVE'
    approveDialog.value = false
    
    // Redirect back to list after short delay
    setTimeout(() => {
      router.push('/sop')
    }, 1500)
    
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menyetujui SOP',
      life: 3000
    })
  } finally {
    approving.value = false
  }
}

const confirmReject = async () => {
  // Validate rejection notes
  if (!rejectionNotes.value || rejectionNotes.value.trim() === '') {
    showRejectError.value = true
    return
  }
  
  rejecting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // TODO: Replace with actual API call
    // await api.rejectSOP(sopData.value.id, {
    //   reason: rejectionNotes.value
    // })
    
    toast.add({
      severity: 'warn',
      summary: 'SOP Ditolak',
      detail: 'SOP telah ditolak dan dikembalikan ke pembuat',
      life: 3000
    })
    
    // Update status
    sopData.value.status = 'DRAFT'
    rejectDialog.value = false
    
    // Redirect back to list after short delay
    setTimeout(() => {
      router.push('/sop')
    }, 1500)
    
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menolak SOP',
      life: 3000
    })
  } finally {
    rejecting.value = false
  }
}
const renderKeteranganWithLinks = (keterangan) => {
  if (!keterangan) return ''
  
  // Regex to find SOP numbers (SOP-XXX/XXXXX/XXXX format)
  const sopPattern = /SOP-(\d{3})\/(\d{5})\/(\d{4})/g
  
  return keterangan.replace(sopPattern, (match) => {
    const sopId = match.replace(/\//g, '-')
    return `<a href="/sop/${sopId}" class="sop-link">${match}</a>`
  })
}

const downloadPDF = () => {
  // TODO: Implement PDF download
  console.log('Download PDF:', sopData.value.nomorSOP)
  alert('Fitur download PDF akan segera tersedia')
}

const editSOP = () => {
  // Show dialog to choose edit type
  showMetadataEditor.value = true
}

const openFlowchartEditor = () => {
  showFlowchartEditor.value = true
}

const saveFlowchart = (data) => {
  console.log('Save flowchart:', data)
  bpmnXML.value = data.xml
  // TODO: Update flowchartData from parsed XML
  // flowchartData.value = data.flowchartData
  showFlowchartEditor.value = false
  alert('Flowchart berhasil disimpan!')
}

const saveMetadata = () => {
  console.log('Save metadata:', sopData.value)
  showMetadataEditor.value = false
  alert('Metadata berhasil disimpan!')
}

const approveSOP = () => {
  // TODO: Implement approval workflow
  console.log('Approve SOP:', sopData.value.nomorSOP)
  alert('Fitur approval akan segera tersedia')
}

onMounted(() => {
  // TODO: Fetch SOP data from API
  const sopId = route.params.id
  console.log('Loading SOP:', sopId)
})
</script>

<style scoped>
.sop-detail {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--surface-card);
  border-radius: 8px;
  border: 1px solid var(--surface-border);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* SOP Header */
.sop-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.sop-logo img {
  height: 80px;
  width: auto;
}

.sop-title-section {
  flex: 1;
}

.sop-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  color: var(--primary-color);
}

.sop-number {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color-secondary);
}

/* Metadata Grid */
.metadata-card {
  margin-bottom: 2rem;
}

.metadata-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.metadata-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-item label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metadata-value {
  font-size: 1rem;
  color: var(--text-color);
  padding: 0.5rem;
  background: var(--surface-ground);
  border-radius: 4px;
}

.related-sop {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.related-link {
  color: var(--primary-color);
  text-decoration: none;
  padding: 0.5rem;
  background: var(--surface-ground);
  border-radius: 4px;
  transition: background 0.2s;
}

.related-link:hover {
  background: var(--primary-color);
  color: white;
}

.content-section {
  line-height: 1.6;
}

.warning-box {
  background: var(--yellow-50);
  border-left: 4px solid var(--yellow-500);
  padding: 1rem;
  border-radius: 4px;
}

/* Flowchart Card */
.flowchart-card {
  margin-bottom: 2rem;
}

.flowchart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.flowchart-header h2 {
  margin: 0;
}

.flowchart-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.bpmn-view,
.sop-flowchart-view {
  margin-bottom: 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}

.flowchart-container {
  overflow-x: auto;
  overflow-y: hidden;
}

.table-responsive {
  min-width: 100%;
  overflow-x: auto;
}

.flowchart-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid var(--surface-border);
  background: var(--surface-card);
}

.flowchart-table th,
.flowchart-table td {
  border: 1px solid var(--surface-border);
  padding: 0.75rem;
  vertical-align: top;
}

.flowchart-table thead {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
}

.flowchart-table thead th {
  text-align: center;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.col-no {
  width: 50px;
  text-align: center;
}

.col-kegiatan {
  min-width: 300px;
  width: 25%;
}

.col-aktor {
  width: 120px;
  min-width: 100px;
}

.col-pelaksana-header {
  background: var(--primary-600) !important;
}

.col-mutu {
  width: 150px;
  min-width: 120px;
}

.col-keterangan {
  width: 200px;
  min-width: 150px;
}

.text-center {
  text-align: center;
}

/* Activity Cell */
.kegiatan-cell {
  position: relative;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  align-self: flex-start;
}

.symbol-kapsul {
  background: var(--green-100);
  color: var(--green-800);
  border-radius: 20px;
}

.symbol-kotak {
  background: var(--blue-100);
  color: var(--blue-800);
  border-radius: 4px;
}

.symbol-belah_ketupat {
  background: var(--orange-100);
  color: var(--orange-800);
  border-radius: 4px;
  position: relative;
}

.symbol-anak_panah {
  background: var(--purple-100);
  color: var(--purple-800);
  border-radius: 4px;
}

.symbol-segilima {
  background: var(--pink-100);
  color: var(--pink-800);
  border-radius: 4px;
}

.activity-text {
  line-height: 1.5;
  color: var(--text-color);
}

.decision-branch {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--surface-ground);
  border-radius: 4px;
  font-size: 0.875rem;
}

.branch-yes,
.branch-no {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.branch-yes {
  color: var(--green-700);
}

.branch-no {
  color: var(--red-700);
}

/* Aktor Cell (Swimlane) */
.aktor-cell {
  text-align: center;
  background: var(--surface-50);
  position: relative;
}

.aktor-cell.active-aktor {
  background: var(--primary-50);
}

.process-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 auto;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 1rem;
}

/* Mutu Baku Cells */
.mutu-cell {
  font-size: 0.875rem;
  line-height: 1.4;
}

.keterangan-cell {
  font-size: 0.875rem;
  line-height: 1.4;
}

:deep(.sop-link) {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px dashed var(--primary-color);
}

:deep(.sop-link:hover) {
  color: var(--primary-600);
  border-bottom-style: solid;
}

/* Responsive */
@media (max-width: 768px) {
  .sop-detail {
    padding: 0.5rem;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .sop-header {
    flex-direction: column;
    text-align: center;
  }

  .action-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }

  .flowchart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .flowchart-actions {
    width: 100%;
    flex-direction: column;
  }

  .flowchart-table {
    font-size: 0.75rem;
  }

  .flowchart-table th,
  .flowchart-table td {
    padding: 0.5rem;
  }
}

/* Dark Mode Support */
:deep(.p-accordion .p-accordion-header-link) {
  background: var(--surface-card);
}

:deep(.p-accordion .p-accordion-content) {
  background: var(--surface-card);
}

/* Dialog Styles */
.metadata-form {
  padding: 1.5rem;
  min-height: 200px;
}

.approval-content {
  padding: 1rem 0;
}

.approval-content .field {
  margin-top: 1rem;
}

.approval-content .field label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  color: var(--text-color);
}

.approval-content .mt-4 {
  margin-top: 1.5rem;
}

.approval-content .w-full {
  width: 100%;
}

:deep(.p-dialog .p-dialog-content) {
  overflow: visible;
}

:deep(.p-dialog-header) {
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}
</style>
