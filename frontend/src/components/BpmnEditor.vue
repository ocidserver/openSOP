<template>
  <div class="bpmn-editor-container">
    <div class="editor-toolbar">
      <Button 
        icon="pi pi-save" 
        label="Simpan" 
        @click="saveDiagram" 
        severity="success"
      />
      <Button 
        icon="pi pi-times" 
        label="Batal" 
        @click="cancel" 
        class="p-button-outlined"
      />
      <Button 
        icon="pi pi-download" 
        label="Export XML" 
        @click="exportXML" 
        class="p-button-outlined"
      />
      <Button 
        icon="pi pi-image" 
        label="Export SVG" 
        @click="exportSVG" 
        class="p-button-outlined"
      />
    </div>
    
    <div class="editor-workspace">
      <div ref="bpmnContainer" class="bpmn-canvas"></div>
      <div ref="propertiesPanel" class="properties-panel"></div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps({
  xml: {
    type: String,
    default: ''
  },
  flowchartData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

const bpmnContainer = ref(null)
const propertiesPanel = ref(null)
const modeler = ref(null)
const loading = ref(false)

const defaultXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                   id="Definitions_1" 
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Mulai">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Aktivitas 1">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Selesai">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="156" y="145" width="28" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="392" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="392" y="145" width="36" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="392" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

const createBpmnXML = (flowchartData) => {
  // Convert flowchart data to BPMN XML (same as viewer)
  let processes = ''
  let sequenceFlows = ''
  let diagramElements = ''
  let yPosition = 100

  flowchartData.forEach((activity, index) => {
    const id = `Activity_${activity.id}`
    const nextId = index < flowchartData.length - 1 ? `Activity_${flowchartData[index + 1].id}` : null
    
    let elementType = 'task'
    let elementTag = 'bpmn:task'
    
    switch (activity.tipeSimbol) {
      case 'KAPSUL':
        elementType = index === 0 ? 'startEvent' : 'endEvent'
        elementTag = index === 0 ? 'bpmn:startEvent' : 'bpmn:endEvent'
        break
      case 'KOTAK':
        elementType = 'task'
        elementTag = 'bpmn:task'
        break
      case 'BELAH_KETUPAT':
        elementType = 'exclusiveGateway'
        elementTag = 'bpmn:exclusiveGateway'
        break
      case 'SEGILIMA':
        elementType = 'intermediateThrowEvent'
        elementTag = 'bpmn:intermediateThrowEvent'
        break
    }

    if (activity.tipeSimbol !== 'ANAK_PANAH') {
      processes += `
        <${elementTag} id="${id}" name="${activity.aktivitasKegiatan}">
          ${activity.tipeSimbol === 'BELAH_KETUPAT' && activity.kondisiKeputusan ? 
            `<bpmn:documentation>${activity.kondisiKeputusan}</bpmn:documentation>` : ''}
        </${elementTag}>
      `

      const width = elementType === 'task' ? 100 : elementType.includes('Event') ? 36 : 50
      const height = elementType === 'task' ? 80 : elementType.includes('Event') ? 36 : 50
      const xPosition = 200 + (index * 180)

      diagramElements += `
        <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}">
          <dc:Bounds x="${xPosition}" y="${yPosition}" width="${width}" height="${height}" />
          <bpmndi:BPMNLabel />
        </bpmndi:BPMNShape>
      `

      if (nextId) {
        const flowId = `Flow_${activity.id}_${flowchartData[index + 1]?.id}`
        sequenceFlows += `
          <bpmn:sequenceFlow id="${flowId}" sourceRef="${id}" targetRef="${nextId}" />
        `

        diagramElements += `
          <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}">
            <di:waypoint x="${xPosition + width}" y="${yPosition + height/2}" />
            <di:waypoint x="${xPosition + 180}" y="${yPosition + height/2}" />
          </bpmndi:BPMNEdge>
        `
      }
    }
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                   id="Definitions_1" 
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    ${processes}
    ${sequenceFlows}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      ${diagramElements}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
}

const loadDiagram = async (xml) => {
  if (!modeler.value || !xml) return
  
  loading.value = true
  try {
    await modeler.value.importXML(xml)
    const canvas = modeler.value.get('canvas')
    canvas.zoom('fit-viewport')
  } catch (err) {
    console.error('Error loading BPMN diagram:', err)
  } finally {
    loading.value = false
  }
}

const saveDiagram = async () => {
  try {
    const result = await modeler.value.saveXML({ format: true })
    const { xml } = result
    
    // Parse XML to extract flowchart data
    const flowchartData = await parseXMLToFlowchartData(xml)
    
    emit('save', {
      xml,
      flowchartData
    })
  } catch (err) {
    console.error('Error saving diagram:', err)
  }
}

const parseXMLToFlowchartData = async (xml) => {
  // TODO: Parse BPMN XML back to flowchart data structure
  // For now, return empty array - implement proper parsing logic
  return []
}

const cancel = () => {
  emit('cancel')
}

const exportXML = async () => {
  try {
    const result = await modeler.value.saveXML({ format: true })
    const { xml } = result
    
    const blob = new Blob([xml], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'flowchart.bpmn'
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exporting XML:', err)
  }
}

const exportSVG = async () => {
  try {
    const result = await modeler.value.saveSVG()
    const { svg } = result
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'flowchart.svg'
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exporting SVG:', err)
  }
}

const initializeModeler = () => {
  if (!bpmnContainer.value) return

  modeler.value = new BpmnModeler({
    container: bpmnContainer.value,
    keyboard: {
      bindTo: document
    }
  })

  // Load diagram
  let xmlToLoad = defaultXML
  
  if (props.xml) {
    xmlToLoad = props.xml
  } else if (props.flowchartData && props.flowchartData.length > 0) {
    xmlToLoad = createBpmnXML(props.flowchartData)
  }
  
  loadDiagram(xmlToLoad)
}

watch(() => props.xml, (newXml) => {
  if (newXml) {
    loadDiagram(newXml)
  }
})

onMounted(() => {
  initializeModeler()
})
</script>

<style scoped>
.bpmn-editor-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-section);
  border-bottom: 1px solid var(--surface-border);
}

.editor-workspace {
  flex: 1;
  display: flex;
  min-height: 600px;
  position: relative;
}

.bpmn-canvas {
  flex: 1;
  height: 100%;
  min-height: 600px;
}

.properties-panel {
  width: 300px;
  border-left: 1px solid var(--surface-border);
  background: var(--surface-ground);
  overflow-y: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

/* BPMN.js styling overrides */
:deep(.djs-container) {
  background: var(--surface-card) !important;
}

:deep(.djs-palette) {
  background: var(--surface-section) !important;
  border: 1px solid var(--surface-border) !important;
}

:deep(.djs-shape .djs-visual > :nth-child(1)) {
  fill: var(--primary-100) !important;
  stroke: var(--primary-color) !important;
}

:deep(.djs-connection .djs-visual > :nth-child(1)) {
  stroke: var(--text-color) !important;
}

:deep(.djs-context-pad) {
  background: var(--surface-overlay) !important;
  border: 1px solid var(--surface-border) !important;
}

@media (max-width: 768px) {
  .editor-workspace {
    flex-direction: column;
  }

  .properties-panel {
    width: 100%;
    max-height: 300px;
    border-left: none;
    border-top: 1px solid var(--surface-border);
  }
}
</style>
