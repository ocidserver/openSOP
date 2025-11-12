<template>
  <div class="bpmn-viewer-container">
    <div ref="bpmnContainer" class="bpmn-canvas"></div>
    <div v-if="loading" class="loading-overlay">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import BpmnViewer from 'bpmn-js/lib/Viewer'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps({
  xml: {
    type: String,
    default: ''
  },
  flowchartData: {
    type: Array,
    default: () => []
  },
  aktors: {
    type: Array,
    default: () => []
  }
})

const bpmnContainer = ref(null)
const viewer = ref(null)
const loading = ref(false)

const createBpmnXML = (flowchartData, aktors) => {
  // Create BPMN XML with horizontal swimlanes (Collaboration with Participants and Lanes)
  let participants = ''
  let lanes = ''
  let processes = ''
  let sequenceFlows = ''
  let diagramElements = ''
  
  const laneHeight = 200
  const startX = 180
  const nodeSpacing = 180

  // Group activities by aktor
  const activitiesByAktor = {}
  aktors.forEach(aktor => {
    activitiesByAktor[aktor.id] = []
  })
  
  flowchartData.forEach(activity => {
    if (activity.aktorId && activitiesByAktor[activity.aktorId]) {
      activitiesByAktor[activity.aktorId].push(activity)
    }
  })

  // Create lanes for each aktor
  aktors.forEach((aktor, aktorIndex) => {
    const laneId = `Lane_${aktor.id}`
    const laneY = 80 + (aktorIndex * laneHeight)
    
    // Get activities for this lane
    const laneActivities = flowchartData.filter(a => a.aktorId === aktor.id)
    const flowNodeRefs = laneActivities.map(a => `Activity_${a.id}`).join(' ')
    
    lanes += `
      <bpmn:lane id="${laneId}" name="${aktor.namaJabatan}">
        <bpmn:flowNodeRef>${flowNodeRefs}</bpmn:flowNodeRef>
      </bpmn:lane>
    `

    // Add lane shape to diagram
    const laneWidth = Math.max(1200, (flowchartData.length * nodeSpacing) + 400)
    diagramElements += `
      <bpmndi:BPMNShape id="${laneId}_di" bpmnElement="${laneId}" isHorizontal="true">
        <dc:Bounds x="160" y="${laneY}" width="${laneWidth}" height="${laneHeight}" />
      </bpmndi:BPMNShape>
    `
  })

  // Create process elements and diagram shapes
  let activityPositions = {}
  
  flowchartData.forEach((activity, index) => {
    const id = `Activity_${activity.id}`
    const aktorIndex = aktors.findIndex(a => a.id === activity.aktorId)
    const laneY = 80 + (aktorIndex * laneHeight)
    const yPosition = laneY + (laneHeight / 2) - 40
    const xPosition = startX + (index * nodeSpacing)
    
    activityPositions[id] = { x: xPosition, y: yPosition }
    
    // Determine BPMN element type
    let elementType = 'task'
    let elementTag = 'bpmn:task'
    let width = 100
    let height = 80
    
    switch (activity.tipeSimbol) {
      case 'KAPSUL':
        elementType = index === 0 ? 'startEvent' : 'endEvent'
        elementTag = index === 0 ? 'bpmn:startEvent' : 'bpmn:endEvent'
        width = 36
        height = 36
        activityPositions[id].y = laneY + (laneHeight / 2) - 18
        break
      case 'KOTAK':
        elementType = 'task'
        elementTag = 'bpmn:task'
        break
      case 'BELAH_KETUPAT':
        elementType = 'exclusiveGateway'
        elementTag = 'bpmn:exclusiveGateway'
        width = 50
        height = 50
        activityPositions[id].y = laneY + (laneHeight / 2) - 25
        break
      case 'SEGILIMA':
        elementType = 'intermediateThrowEvent'
        elementTag = 'bpmn:intermediateThrowEvent'
        width = 36
        height = 36
        activityPositions[id].y = laneY + (laneHeight / 2) - 18
        break
    }

    // Add process element
    if (activity.tipeSimbol !== 'ANAK_PANAH') {
      processes += `
        <${elementTag} id="${id}" name="${activity.aktivitasKegiatan}">
          ${activity.tipeSimbol === 'BELAH_KETUPAT' && activity.nextActivityYes ? 
            `<bpmn:outgoing>Flow_${activity.id}_yes</bpmn:outgoing>
             <bpmn:outgoing>Flow_${activity.id}_no</bpmn:outgoing>` : 
            index < flowchartData.length - 1 ? `<bpmn:outgoing>Flow_${activity.id}</bpmn:outgoing>` : ''}
          ${index > 0 ? `<bpmn:incoming>Flow_${flowchartData[index-1].id}</bpmn:incoming>` : ''}
        </${elementTag}>
      `

      // Add diagram shape
      diagramElements += `
        <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}">
          <dc:Bounds x="${activityPositions[id].x}" y="${activityPositions[id].y}" width="${width}" height="${height}" />
          ${elementType === 'task' ? '<bpmndi:BPMNLabel />' : ''}
        </bpmndi:BPMNShape>
      `

      // Add sequence flow to next element (if not decision)
      if (index < flowchartData.length - 1 && activity.tipeSimbol !== 'BELAH_KETUPAT') {
        const nextActivity = flowchartData[index + 1]
        const nextId = `Activity_${nextActivity.id}`
        const flowId = `Flow_${activity.id}`
        
        sequenceFlows += `
          <bpmn:sequenceFlow id="${flowId}" sourceRef="${id}" targetRef="${nextId}" />
        `

        diagramElements += `
          <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}">
            <di:waypoint x="${activityPositions[id].x + width}" y="${activityPositions[id].y + height/2}" />
            <di:waypoint x="${activityPositions[nextId].x}" y="${activityPositions[nextId].y + (nextActivity.tipeSimbol === 'KOTAK' ? 40 : nextActivity.tipeSimbol === 'KAPSUL' ? 18 : 25)}" />
          </bpmndi:BPMNEdge>
        `
      }

      // Handle decision branches
      if (activity.tipeSimbol === 'BELAH_KETUPAT' && activity.nextActivityYes) {
        const yesActivity = flowchartData.find(a => a.id.toString() === activity.nextActivityYes || a.noKegiatan.toString() === activity.nextActivityYes)
        const noActivity = flowchartData.find(a => a.id.toString() === activity.nextActivityNo || a.noKegiatan.toString() === activity.nextActivityNo)
        
        if (yesActivity) {
          const yesId = `Activity_${yesActivity.id}`
          const yesFlowId = `Flow_${activity.id}_yes`
          
          sequenceFlows += `
            <bpmn:sequenceFlow id="${yesFlowId}" name="Ya" sourceRef="${id}" targetRef="${yesId}" />
          `
          
          diagramElements += `
            <bpmndi:BPMNEdge id="${yesFlowId}_di" bpmnElement="${yesFlowId}">
              <di:waypoint x="${activityPositions[id].x + 25}" y="${activityPositions[id].y + 50}" />
              <di:waypoint x="${activityPositions[id].x + 25}" y="${activityPositions[id].y + 100}" />
              <di:waypoint x="${activityPositions[yesId].x + 50}" y="${activityPositions[id].y + 100}" />
              <di:waypoint x="${activityPositions[yesId].x + 50}" y="${activityPositions[yesId].y}" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="${activityPositions[id].x + 30}" y="${activityPositions[id].y + 60}" width="15" height="14" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNEdge>
          `
        }
        
        if (noActivity) {
          const noId = `Activity_${noActivity.id}`
          const noFlowId = `Flow_${activity.id}_no`
          
          sequenceFlows += `
            <bpmn:sequenceFlow id="${noFlowId}" name="Tidak" sourceRef="${id}" targetRef="${noId}" />
          `
          
          diagramElements += `
            <bpmndi:BPMNEdge id="${noFlowId}_di" bpmnElement="${noFlowId}">
              <di:waypoint x="${activityPositions[id].x + 25}" y="${activityPositions[id].y}" />
              <di:waypoint x="${activityPositions[id].x + 25}" y="${activityPositions[id].y - 50}" />
              <di:waypoint x="${activityPositions[noId].x + 50}" y="${activityPositions[id].y - 50}" />
              <di:waypoint x="${activityPositions[noId].x + 50}" y="${activityPositions[noId].y + 80}" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="${activityPositions[id].x + 30}" y="${activityPositions[id].y - 45}" width="30" height="14" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNEdge>
          `
        }
      }
    }
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   id="Definitions_1" 
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="SOP Process" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      ${lanes}
    </bpmn:laneSet>
    ${processes}
    ${sequenceFlows}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
      <bpmndi:BPMNShape id="Participant_1_di" bpmnElement="Participant_1" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="${Math.max(1200, (flowchartData.length * nodeSpacing) + 400)}" height="${aktors.length * laneHeight}" />
      </bpmndi:BPMNShape>
      ${diagramElements}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
}

const loadDiagram = async (xml) => {
  if (!viewer.value) {
    console.error('Viewer not initialized')
    return
  }
  
  if (!xml) {
    console.error('No XML to load')
    return
  }
  
  loading.value = true
  try {
    console.log('Importing XML...')
    await viewer.value.importXML(xml)
    console.log('XML imported successfully')
    
    const canvas = viewer.value.get('canvas')
    canvas.zoom('fit-viewport')
    console.log('Zoomed to fit viewport')
  } catch (err) {
    console.error('Error loading BPMN diagram:', err)
    console.error('Error details:', err.message)
    console.error('XML causing error:', xml.substring(0, 500))
  } finally {
    loading.value = false
  }
}

const initializeViewer = () => {
  if (!bpmnContainer.value) {
    console.error('BPMN container ref not available')
    return
  }

  try {
    viewer.value = new BpmnViewer({
      container: bpmnContainer.value,
      keyboard: {
        bindTo: document
      }
    })

    console.log('BPMN Viewer initialized successfully')

    // Load diagram
    if (props.xml) {
      console.log('Loading from XML prop')
      loadDiagram(props.xml)
    } else if (props.flowchartData && props.flowchartData.length > 0 && props.aktors && props.aktors.length > 0) {
      console.log('Generating XML from flowchartData and aktors')
      console.log('FlowchartData:', props.flowchartData.length, 'items')
      console.log('Aktors:', props.aktors.length, 'items')
      const generatedXML = createBpmnXML(props.flowchartData, props.aktors)
      console.log('Generated XML:', generatedXML.substring(0, 200) + '...')
      loadDiagram(generatedXML)
    } else {
      console.warn('No data available to display BPMN')
    }
  } catch (error) {
    console.error('Error initializing BPMN viewer:', error)
  }
}

watch(() => props.xml, (newXml) => {
  if (newXml) {
    loadDiagram(newXml)
  }
})

watch(() => [props.flowchartData, props.aktors], ([newFlowchartData, newAktors]) => {
  if (!props.xml && newFlowchartData && newFlowchartData.length > 0 && newAktors && newAktors.length > 0) {
    const generatedXML = createBpmnXML(newFlowchartData, newAktors)
    loadDiagram(generatedXML)
  }
}, { deep: true })

onMounted(() => {
  console.log('BpmnViewer mounted')
  initializeViewer()
})

onBeforeUnmount(() => {
  console.log('BpmnViewer unmounting, cleaning up viewer')
  if (viewer.value) {
    try {
      viewer.value.destroy()
      viewer.value = null
      console.log('Viewer destroyed successfully')
    } catch (error) {
      console.error('Error destroying viewer:', error)
    }
  }
})
</script>

<style scoped>
.bpmn-viewer-container {
  position: relative;
  width: 100%;
  min-height: 500px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  overflow: hidden;
}

.bpmn-canvas {
  width: 100%;
  height: 500px;
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
  z-index: 10;
}

/* BPMN.js styling overrides */
:deep(.djs-container) {
  background: var(--surface-card) !important;
}

:deep(.djs-shape .djs-visual > :nth-child(1)) {
  fill: var(--primary-100) !important;
  stroke: var(--primary-color) !important;
}

:deep(.djs-connection .djs-visual > :nth-child(1)) {
  stroke: var(--text-color) !important;
}
</style>
