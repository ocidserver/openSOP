<template>
  <div class="sop-flowchart-container">
    <div class="flowchart-canvas" ref="canvasContainer">
      <svg :width="canvasWidth" :height="canvasHeight" class="flowchart-svg">
        <!-- Background -->
        <rect width="100%" height="100%" fill="#ffffff" />

        <!-- Flowchart Elements with Vertical Columns -->
        <g class="flowchart-elements">
          <!-- Arrow Marker Definitions -->
          <defs>
            <marker id="arrow-default" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#475569" />
            </marker>
            <marker id="arrow-yes" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#059669" />
            </marker>
            <marker id="arrow-no" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#dc2626" />
            </marker>
          </defs>

          <!-- Column Headers and Grid -->
          <g class="column-structure">
            <!-- Header Background -->
            <rect :x="0" :y="0" :width="canvasWidth" :height="headerHeight" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2" />
            
            <!-- Column Headers -->
            <text :x="columns.no.x + columns.no.width/2" :y="headerHeight/2 + 5" class="column-header">No</text>
            <text :x="columns.aktivitas.x + columns.aktivitas.width/2" :y="headerHeight/2 + 5" class="column-header">Aktivitas</text>
            
            <!-- Flowchart/Pelaksana Section -->
            <text :x="columns.flowchart.x + columns.flowchart.width/2" :y="20" class="column-header">Pelaksana</text>
            <g class="pelaksana-subheaders">
              <line :x1="columns.flowchart.x" :y1="25" :x2="columns.flowchart.x + columns.flowchart.width" :y2="25" stroke="#cbd5e1" stroke-width="1" />
              <text :x="columns.ketuaTim.x + columns.ketuaTim.width/2" :y="headerHeight/2 + 5" class="column-subheader">Ketua Tim</text>
              <text :x="columns.ketuaProject.x + columns.ketuaProject.width/2" :y="headerHeight/2 + 5" class="column-subheader">Ketua Project</text>
              <text :x="columns.anggota.x + columns.anggota.width/2" :y="headerHeight/2 + 5" class="column-subheader">Anggota</text>
              <text :x="columns.timDiseminasi.x + columns.timDiseminasi.width/2" :y="headerHeight/2 + 5" class="column-subheader">Tim Diseminasi</text>
            </g>
            
            <!-- Vertical Grid Lines -->
            <line :x1="columns.no.x" :y1="0" :x2="columns.no.x" :y2="canvasHeight" stroke="#cbd5e1" stroke-width="2" />
            <line :x1="columns.aktivitas.x" :y1="0" :x2="columns.aktivitas.x" :y2="canvasHeight" stroke="#cbd5e1" stroke-width="2" />
            <line :x1="columns.flowchart.x" :y1="0" :x2="columns.flowchart.x" :y2="canvasHeight" stroke="#cbd5e1" stroke-width="2" />
            <line :x1="columns.ketuaTim.x" :y1="headerHeight" :x2="columns.ketuaTim.x" :y2="canvasHeight" stroke="#e2e8f0" stroke-width="1" />
            <line :x1="columns.ketuaProject.x" :y1="headerHeight" :x2="columns.ketuaProject.x" :y2="canvasHeight" stroke="#e2e8f0" stroke-width="1" />
            <line :x1="columns.anggota.x" :y1="headerHeight" :x2="columns.anggota.x" :y2="canvasHeight" stroke="#e2e8f0" stroke-width="1" />
            <line :x1="columns.timDiseminasi.x" :y1="headerHeight" :x2="columns.timDiseminasi.x" :y2="canvasHeight" stroke="#e2e8f0" stroke-width="1" />
            <line :x1="canvasWidth" :y1="0" :x2="canvasWidth" :y2="canvasHeight" stroke="#cbd5e1" stroke-width="2" />
            
            <!-- Horizontal Grid Lines for each row -->
            <g v-for="(node, index) in nodes" :key="`row-${node.id}`">
              <line 
                :x1="0" 
                :y1="headerHeight + ((index + 1) * rowHeight)" 
                :x2="canvasWidth" 
                :y2="headerHeight + ((index + 1) * rowHeight)" 
                stroke="#e2e8f0" 
                stroke-width="1" 
              />
            </g>
          </g>

          <!-- Activity Nodes -->
          <g v-for="node in nodes" :key="node.id" class="node" @click="selectNode(node)">
            <!-- Row Data (No and Aktivitas only) -->
            <g class="row-data">
              <!-- No Column -->
              <text 
                :x="columns.no.x + columns.no.width/2" 
                :y="node.y + 5" 
                class="cell-text cell-no"
              >
                {{ node.rowIndex + 1 }}
              </text>
              
              <!-- Aktivitas Column -->
              <foreignObject 
                :x="columns.aktivitas.x + 5" 
                :y="node.y - rowHeight/2 + 5" 
                :width="columns.aktivitas.width - 10" 
                :height="rowHeight - 10"
              >
                <div class="cell-text cell-aktivitas" xmlns="http://www.w3.org/1999/xhtml">
                  {{ node.activity.aktivitasKegiatan }}
                </div>
              </foreignObject>
            </g>

            <!-- Flowchart Symbol in Pelaksana Column -->
            <!-- Start/End Event (Circle) -->
            <g v-if="node.type === 'start' || node.type === 'end'">
              <circle 
                :cx="node.x" 
                :cy="node.y" 
                :r="nodeRadius"
                :class="['node-circle', node.type === 'start' ? 'node-start' : 'node-end']"
              />
            </g>

            <!-- Task/Process (Rectangle) -->
            <g v-else-if="node.type === 'task'">
              <rect 
                :x="node.x - nodeWidth/2" 
                :y="node.y - nodeHeight/2" 
                :width="nodeWidth" 
                :height="nodeHeight"
                rx="5"
                class="node-rect node-task"
              />
            </g>

            <!-- Gateway/Decision (Diamond - Belah Ketupat) -->
            <g v-else-if="node.type === 'gateway'">
              <path 
                :d="getDiamondPath(node.x, node.y, 35)"
                class="node-diamond node-gateway"
              />
            </g>

            <!-- Connector (Pentagon - Segilima) -->
            <g v-else-if="node.type === 'connector'">
              <path 
                :d="getPentagonPath(node.x, node.y, 30)"
                class="node-pentagon node-connector"
              />
            </g>
          </g>

          <!-- Connections -->
          <g class="connections">
            <g v-for="conn in connections" :key="conn.id">
              <path 
                :d="conn.path"
                :class="['connection', conn.type ? `connection-${conn.type}` : '']"
                :marker-end="conn.type === 'yes' ? 'url(#arrow-yes)' : conn.type === 'no' ? 'url(#arrow-no)' : 'url(#arrow-default)'"
              />
              <text 
                v-if="conn.label" 
                :x="conn.labelX" 
                :y="conn.labelY" 
                class="connection-label"
              >
                {{ conn.label }}
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>

    <!-- Legend -->
    <div class="flowchart-legend">
      <div class="legend-title">Simbol SOP (5 Simbol Standar BPS):</div>
      <div class="legend-items">
        <div class="legend-item">
          <svg width="40" height="30">
            <circle cx="20" cy="15" r="12" class="node-circle node-start" />
          </svg>
          <span>Kapsul - Start/End</span>
        </div>
        <div class="legend-item">
          <svg width="60" height="40">
            <rect x="5" y="5" width="50" height="30" rx="5" class="node-rect node-task" />
          </svg>
          <span>Kotak - Proses/Kegiatan</span>
        </div>
        <div class="legend-item">
          <svg width="50" height="50">
            <path d="M 25 5 L 45 25 L 25 45 L 5 25 Z" class="node-diamond node-gateway" />
          </svg>
          <span>Belah Ketupat - Keputusan</span>
        </div>
        <div class="legend-item">
          <svg width="50" height="50" viewBox="0 0 50 50">
            <path d="M 25 5 L 45 15 L 38 40 L 12 40 L 5 15 Z" class="node-pentagon node-connector" />
          </svg>
          <span>Segilima - Penghubung</span>
        </div>
        <div class="legend-item">
          <svg width="60" height="20">
            <defs>
              <marker id="legend-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
            </defs>
            <path d="M 5 10 L 55 10" stroke="#475569" stroke-width="2" marker-end="url(#legend-arrow)" fill="none" />
          </svg>
          <span>Anak Panah - Alur</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  flowchartData: {
    type: Array,
    default: () => []
  },
  aktors: {
    type: Array,
    default: () => []
  }
})

const canvasContainer = ref(null)
const canvasWidth = ref(900) // Simplified: No + Aktivitas + Flowchart columns
const canvasHeight = ref(600)
const headerHeight = 50
const rowHeight = 120

const nodeWidth = 80
const nodeHeight = 50
const nodeRadius = 20

const nodes = ref([])
const connections = ref([])

// Column definitions - 3 columns: No, Aktivitas, Flowchart (with pelaksana lanes)
const columns = {
  no: { x: 0, width: 50 },
  aktivitas: { x: 50, width: 200 },
  flowchart: { x: 250, width: 650 }, // Parent column for flowchart
  ketuaTim: { x: 250, width: 162.5 },
  ketuaProject: { x: 412.5, width: 162.5 },
  anggota: { x: 575, width: 162.5 },
  timDiseminasi: { x: 737.5, width: 162.5 }
}

// Calculate canvas height based on number of activities
const calculatedHeight = computed(() => {
  return headerHeight + (props.flowchartData.length * rowHeight) + 50
})

watch(calculatedHeight, (newHeight) => {
  canvasHeight.value = newHeight
})

// Convert flowchart data to nodes with column-based positioning
const buildNodes = () => {
  if (!props.flowchartData || props.flowchartData.length === 0) return

  nodes.value = props.flowchartData.map((activity, index) => {
    let nodeType = 'task'
    
    // Map SOP symbols to node types (5 symbols only)
    switch (activity.tipeSimbol) {
      case 'KAPSUL':
        nodeType = index === 0 ? 'start' : 'end'
        break
      case 'KOTAK':
        nodeType = 'task'
        break
      case 'BELAH_KETUPAT':
        nodeType = 'gateway'
        break
      case 'SEGILIMA':
        nodeType = 'connector'
        break
      case 'ANAK_PANAH':
        // Arrow is handled in connections, skip
        return null
    }

    // Determine which pelaksana column to use based on aktorId
    let nodeX = columns.ketuaTim.x + columns.ketuaTim.width / 2 // default
    
    if (activity.aktorId) {
      const aktor = props.aktors.find(a => a.id === activity.aktorId)
      if (aktor) {
        // Map actor to appropriate column (you can customize this logic)
        const aktorName = aktor.namaJabatan?.toLowerCase() || ''
        if (aktorName.includes('ketua tim') || aktorName.includes('koordinator')) {
          nodeX = columns.ketuaTim.x + columns.ketuaTim.width / 2
        } else if (aktorName.includes('ketua project') || aktorName.includes('project')) {
          nodeX = columns.ketuaProject.x + columns.ketuaProject.width / 2
        } else if (aktorName.includes('diseminasi')) {
          nodeX = columns.timDiseminasi.x + columns.timDiseminasi.width / 2
        } else {
          nodeX = columns.anggota.x + columns.anggota.width / 2
        }
      }
    }

    const rowY = headerHeight + (index * rowHeight) + (rowHeight / 2)

    return {
      id: activity.id,
      x: nodeX,
      y: rowY,
      rowIndex: index,
      type: nodeType,
      label: activity.aktivitasKegiatan,
      activity: activity
    }
  }).filter(node => node !== null)

  buildConnections()
}

// Build connection paths between nodes (within pelaksana columns, down to next row)
const buildConnections = () => {
  connections.value = []
  
  nodes.value.forEach((node, index) => {
    if (index < nodes.value.length - 1) {
      const nextNode = nodes.value[index + 1]
      
      // Check if this is a gateway (decision point)
      if (node.type === 'gateway' && node.activity.nextActivityYes && node.activity.nextActivityNo) {
        // Gateway has two branches - skip simple connection, handle below
      } else {
        // Connection from current node to next node (may cross columns)
        const startY = node.y + (node.type === 'start' || node.type === 'end' ? nodeRadius : nodeHeight/2)
        const endY = nextNode.y - (nextNode.type === 'start' || nextNode.type === 'end' ? nodeRadius : nodeHeight/2)
        
        if (node.x === nextNode.x) {
          // Same column - straight down
          const connection = {
            id: `conn-${node.id}-${nextNode.id}`,
            path: `M ${node.x} ${startY} L ${node.x} ${endY}`,
            labelX: node.x + 15,
            labelY: (startY + endY) / 2
          }
          connections.value.push(connection)
        } else {
          // Different columns - move horizontally then down
          const midY = startY + (endY - startY) / 2
          const connection = {
            id: `conn-${node.id}-${nextNode.id}`,
            path: `M ${node.x} ${startY} L ${node.x} ${midY} L ${nextNode.x} ${midY} L ${nextNode.x} ${endY}`,
            labelX: (node.x + nextNode.x) / 2,
            labelY: midY - 5
          }
          connections.value.push(connection)
        }
      }
    }

    // Add decision branches if gateway
    if (node.type === 'gateway' && node.activity.nextActivityYes && node.activity.nextActivityNo) {
      // Yes branch (go right then down)
      const yesNode = nodes.value.find(n => n.id === node.activity.nextActivityYes)
      if (yesNode) {
        const branchOffset = 100
        connections.value.push({
          id: `conn-${node.id}-yes`,
          path: `M ${node.x} ${node.y + nodeHeight/2} L ${node.x} ${node.y + 30} L ${node.x + branchOffset} ${node.y + 30} L ${node.x + branchOffset} ${yesNode.y} L ${yesNode.x} ${yesNode.y}`,
          type: 'yes',
          label: 'Ya',
          labelX: node.x + 40,
          labelY: node.y + 25
        })
      }

      // No branch (go left then down)
      const noNode = nodes.value.find(n => n.id === node.activity.nextActivityNo)
      if (noNode) {
        const branchOffset = 100
        connections.value.push({
          id: `conn-${node.id}-no`,
          path: `M ${node.x} ${node.y + nodeHeight/2} L ${node.x} ${node.y + 30} L ${node.x - branchOffset} ${node.y + 30} L ${node.x - branchOffset} ${noNode.y} L ${noNode.x} ${noNode.y}`,
          type: 'no',
          label: 'Tidak',
          labelX: node.x - 60,
          labelY: node.y + 25
        })
      }
    }
  })
}

// Helper functions for shapes
const getDiamondPath = (cx, cy, size) => {
  return `M ${cx} ${cy - size} L ${cx + size} ${cy} L ${cx} ${cy + size} L ${cx - size} ${cy} Z`
}

const getPentagonPath = (cx, cy, size) => {
  // Pentagon pointing right (for off-page connector)
  const points = []
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2 // Start from top
    points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`)
  }
  return `M ${points.join(' L ')} Z`
}

const selectNode = (node) => {
  console.log('Selected node:', node)
  // TODO: Show node details or enable editing
}

watch(() => props.flowchartData, () => {
  buildNodes()
}, { deep: true })

watch(() => props.aktors, () => {
  buildNodes()
}, { deep: true })

onMounted(() => {
  if (canvasContainer.value) {
    canvasWidth.value = canvasContainer.value.offsetWidth || 1400
  }
  buildNodes()
})
</script>

<style scoped>
.sop-flowchart-container {
  width: 100%;
  background: #ffffff;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.flowchart-canvas {
  width: 100%;
  max-height: 800px;
  overflow-x: auto;
  overflow-y: auto;
  background: #ffffff;
}

.flowchart-svg {
  display: block;
  background: #ffffff;
}

/* Swimlanes */
.lane-bg {
  fill: #ffffff;
  stroke: none;
}

/* Column Headers */
.column-header {
  fill: #1e293b;
  font-size: 14px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
}

.column-subheader {
  fill: #475569;
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}

/* Cell Text */
.cell-text {
  font-size: 11px;
  color: #334155;
  line-height: 1.4;
  padding: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.cell-no {
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: #1e293b;
  font-size: 13px;
}

.cell-aktivitas {
  font-weight: 600;
  color: #1e293b;
}

.cell-mutu {
  font-size: 10px;
  color: #475569;
}

.cell-keterangan {
  font-size: 10px;
  color: #64748b;
  font-style: italic;
}

/* Swimlanes (kept for reference but not used) */
.lane-even {
  fill: #f8f9fa;
}

.lane-odd {
  fill: #ffffff;
}

.lane-label {
  fill: #2c3e50;
  font-size: 14px;
  font-weight: 600;
  text-anchor: start;
}

.lane-separator {
  stroke: #dee2e6;
  stroke-width: 2;
}

/* Nodes */
.node {
  cursor: pointer;
  transition: all 0.2s;
}

.node:hover .node-rect,
.node:hover .node-circle,
.node:hover .node-diamond,
.node:hover .node-document {
  filter: brightness(1.1);
}

.node-circle {
  fill: var(--surface-card);
  stroke: var(--primary-color);
  stroke-width: 2;
}

.node-circle {
  fill: #ffffff;
  stroke: #3b82f6;
  stroke-width: 2;
}

.node-start {
  fill: #d1fae5;
  stroke: #059669;
  stroke-width: 3;
}

.node-end {
  fill: #fee2e2;
  stroke: #dc2626;
  stroke-width: 4;
}

.node-rect {
  fill: #dbeafe;
  stroke: #3b82f6;
  stroke-width: 2;
}

.node-task {
  fill: #dbeafe;
  stroke: #2563eb;
  stroke-width: 2;
}

.node-diamond {
  fill: #fed7aa;
  stroke: #ea580c;
  stroke-width: 2;
}

.node-gateway {
  fill: #fed7aa;
  stroke: #ea580c;
}

.node-pentagon {
  fill: #fce7f3;
  stroke: #db2777;
  stroke-width: 2;
}

.node-connector {
  fill: #fce7f3;
  stroke: #db2777;
}

.node-label {
  fill: #1e293b;
  font-size: 12px;
  text-anchor: middle;
  font-weight: 500;
}

.node-text {
  font-size: 11px;
  color: #1e293b;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2px;
  word-wrap: break-word;
  overflow: hidden;
  line-height: 1.2;
}

.node-text-center {
  font-size: 11px;
  color: #1e293b;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-weight: 600;
}

/* Connections */
.connector-line {
  fill: none;
  stroke: #475569;
  stroke-width: 2;
}

.connector-yes {
  stroke: #059669;
  stroke-width: 2.5;
}

.connector-no {
  stroke: #dc2626;
  stroke-width: 2.5;
}

.connector-label {
  fill: #1e293b;
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
  background: #ffffff;
}

/* Legend */
.flowchart-legend {
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.legend-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
}

/* Responsive */
@media (max-width: 768px) {
  .flowchart-canvas {
    font-size: 10px;
  }

  .node-text {
    font-size: 9px;
  }

  .legend-items {
    gap: 1rem;
  }
}
</style>
