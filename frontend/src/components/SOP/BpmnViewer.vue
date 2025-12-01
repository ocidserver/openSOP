<template>
  <div class="sop-viewer-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressBar mode="indeterminate" />
      <p class="loading-text">Memuat SOP Viewer...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <Message severity="error" :text="errorMessage" />
    </div>

    <!-- PDF Viewer -->
    <div v-else class="pdf-viewer-wrapper">
      <!-- PDF Controls -->
      <div class="pdf-controls">
        <!-- Download Button -->
        <Button
          label="Download PDF"
          icon="pi pi-download"
          @click="downloadPDF"
          class="p-button-outlined p-button-info"
        />

        <!-- Zoom Controls -->
        <div class="zoom-controls">
          <Button
            label="Zoom In"
            icon="pi pi-search-plus"
            @click="zoomIn"
            class="p-button-sm p-button-secondary"
          />
          <Button
            label="Zoom Out"
            icon="pi pi-search-minus"
            @click="zoomOut"
            class="p-button-sm p-button-secondary"
          />
          <Button
            label="Reset Zoom"
            icon="pi pi-refresh"
            @click="resetZoom"
            class="p-button-sm p-button-secondary"
          />
        </div>

        <!-- Navigation Controls -->
        <div class="nav-controls">
          <Button
            label="Previous Page"
            icon="pi pi-chevron-left"
            @click="previousPage"
            :disabled="currentPage <= 1"
            class="p-button-sm p-button-secondary"
          />
          <span class="page-info">
            Halaman {{ currentPage }} / {{ totalPages }}
          </span>
          <Button
            label="Next Page"
            icon="pi pi-chevron-right"
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            class="p-button-sm p-button-secondary"
          />
        </div>

        <!-- Fullscreen Mode -->
        <Button
          label="Fullscreen"
          icon="pi pi-window-maximize"
          @click="toggleFullscreen"
          class="p-button-sm p-button-secondary"
        />
      </div>

      <!-- PDF Display -->
      <div class="pdf-container">
        <iframe
          :src="pdfUrl"
          class="pdf-iframe"
          frameborder="0"
          allowfullscreen
          allowtransparency
          ref="pdfFrame"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useToast } from 'primevue/toast'
import { useDocumentStore } from '@/stores/document'

export default {
  name: 'SOPViewer',
  props: {
    sopId: {
      type: String,
      required: true
    }
  },
  emits: ['close'],

  setup() {
    const toast = useToast()
    const documentStore = useDocumentStore()

    const pdfUrl = ref('')
    const loading = ref(true)
    const error = ref('')
    const currentPage = ref(1)
    const totalPages = ref(0)

    const pdfFrame = ref(null)

    // PDF viewer scale
    const scale = ref(1)

    // Fullscreen state
    const isFullscreen = ref(false)

    // Watch for props changes
    watch(() => props.sopId, (newSopId) => {
      if (newSopId) {
        loadSOPDocument(newSopId)
      }
    })
  },

  methods: {
    async loadSOPDocument(sopId) {
      try {
        loading.value = true
        error.value = ''

        // Call backend API to get SOP document
        const response = await fetch(`/api/sop/documents/${sopId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load SOP document')
        }

        const sopData = await response.json()

        // Get PDF URL from document data
        const categoryCode = sopData.categories?.[0]?.category?.code || 'general'
        const fileName = sopData.attachments?.find(att => att.type === 'DOCUMENT')?.fileName

        if (fileName) {
          // Construct PDF URL using our organized structure
          pdfUrl.value = `/api/sop/documents/${categoryCode}/${encodeURIComponent(fileName)}`

          // Load PDF to get page count
          await loadPDFPageCount(pdfUrl.value)
        } else {
          throw new Error('PDF document not found')
        }

      } catch (err) {
        console.error('Error loading SOP document:', err)
        error.value = 'Gagal memuat dokumen SOP'
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

    async loadPDFPageCount(pdfUrl) {
      try {
        // Create temporary iframe to count pages
        const tempFrame = document.createElement('iframe')
        tempFrame.style.display = 'none'
        document.body.appendChild(tempFrame)

        const iframeDoc = tempFrame.contentDocument || tempFrame.contentWindow.document

        if (iframeDoc && iframeDoc.body) {
          const pdfEmbed = document.createElement('embed')
          pdfEmbed.src = pdfUrl
          pdfEmbed.type = 'application/pdf'
          pdfEmbed.style.display = 'none'
          iframeDoc.body.appendChild(pdfEmbed)

          // Wait for PDF to load, then get page count
          pdfEmbed.onload = () => {
            try {
              // This is a simplified approach - in a real implementation,
              // you'd want to use PDF.js for accurate page counting
              setTimeout(() => {
                totalPages.value = 1 // Default fallback
                document.body.removeChild(tempFrame)
              }, 1000)
            } catch (err) {
              console.warn('Could not count PDF pages:', err)
              totalPages.value = 1 // Default fallback
              document.body.removeChild(tempFrame)
            }
          }
        }

      } catch (err) {
        console.warn('Could not load PDF for page counting:', err)
        totalPages.value = 1 // Default fallback
      }
    },

    downloadPDF() {
      try {
        const link = document.createElement('a')
        link.href = pdfUrl.value
        link.download = `SOP-${props.sopId || 'document'}.pdf`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        this.$toast.add({
          severity: 'success',
          summary: 'Download Berhasil',
          detail: 'Dokumen SOP sedang di-download',
          life: 3000
        })
      } catch (err) {
        console.error('Error downloading PDF:', err)
        this.$toast.add({
          severity: 'error',
          summary: 'Download Gagal',
          detail: 'Gagal mengunduh dokumen SOP',
          life: 3000
        })
      }
    },

    zoomIn() {
      scale.value = Math.min(scale.value + 0.25, 3)
      updatePDFScale()
    },

    zoomOut() {
      scale.value = Math.max(scale.value - 0.25, 0.5)
      updatePDFScale()
    },

    resetZoom() {
      scale.value = 1
      updatePDFScale()
    },

    toggleFullscreen() {
      const pdfContainer = document.querySelector('.pdf-viewer-wrapper')
      const iframe = pdfFrame.value

      if (iframe) {
        if (!isFullscreen.value) {
          if (iframe.requestFullscreen) {
            iframe.requestFullscreen().catch(err => {
              console.warn('Could not enter fullscreen:', err)
            })
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          }
        }
      }
    },

    updatePDFScale() {
      const iframe = pdfFrame.value
      if (iframe && iframe.contentWindow) {
        // Send scale message to iframe
        iframe.contentWindow.postMessage({
          type: 'scale',
          scale: scale.value
        }, '*')
      }
    },

    previousPage() {
      if (currentPage.value > 1) {
        currentPage.value--
        updatePDFOffset()
      }
    },

    nextPage() {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
        updatePDFOffset()
      }
    },

    updatePDFOffset() {
      const iframe = pdfFrame.value
      if (iframe && iframe.contentWindow) {
        // Send page change message to iframe
        iframe.contentWindow.postMessage({
          type: 'page',
          page: currentPage.value
        }, '*')
      }
    }
  },

  computed: {
    totalPages() {
      return totalPages.value
    },

    currentPage() {
      return currentPage.value
    }
  }
}
</script>

<style scoped>
.sop-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
}

.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.pdf-viewer-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.pdf-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  gap: 0.5rem;
}

.zoom-controls {
  display: flex;
  gap: 0.25rem;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-info {
  color: #6c757d;
  font-weight: 500;
}

.pdf-container {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.pdf-iframe {
  width: 100%;
  height: calc(100vh - 200px);
  border: none;
  border-radius: 4px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pdf-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .nav-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .zoom-controls {
    flex-direction: row;
    justify-content: center;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .sop-viewer-container {
    background-color: #1f2937;
  }

  .pdf-controls {
    background-color: #374151;
    border-bottom-color: #4a5568;
  }

  .page-info {
    color: #a0aec0;
  }
}

/* Fullscreen Styles */
.pdf-viewer-wrapper:fullscreen {
  background-color: #000;
}

.pdf-viewer-wrapper:fullscreen .pdf-controls {
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.pdf-viewer-wrapper:fullscreen .pdf-iframe {
  height: 100vh;
}
</style>