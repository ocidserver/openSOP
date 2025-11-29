/**
 * TypeScript Type Definitions for SOP Management
 * Mode Manual/Basic - Tabular Steps & Flowchart
 */

// ============================================
// SOP STEP (Tabular Data)
// ============================================

export interface ISOPStep {
  step_id: number;                    // Unique step identifier (1, 2, 3, ...)
  activity: string;                   // Aktivitas/Kegiatan yang dilakukan
  actor: string;                      // Nama peran/departemen pelaksana (e.g., "Kepala Seksi", "IPDS")
  mutu_waktu: string;                 // Mutu baku waktu (e.g., "5 menit", "1 hari")
  mutu_output: string;                // Mutu baku output (hasil yang diharapkan)
  notes: string;                      // Catatan tambahan
  order: number;                      // Urutan tampilan
  parent_id?: number | null;          // ID parent untuk nested steps (optional)
  is_decision?: boolean;              // Apakah step ini decision point
  is_subprocess?: boolean;            // Apakah step ini subprocess
  created_at?: string;                // Timestamp
  updated_at?: string;                // Timestamp
}

// ============================================
// FLOWCHART NODE
// ============================================

export enum FlowchartNodeType {
  START = 'start',                    // Start event (circle)
  END = 'end',                        // End event (circle dengan border tebal)
  TASK = 'task',                      // Activity/Task (rectangle)
  DECISION = 'decision',              // Gateway/Decision (diamond)
  SUBPROCESS = 'subprocess',          // Subprocess (rounded rectangle)
  POOL = 'pool',                      // Pool/Lane separator
  LANE = 'lane',                      // Lane within pool
  EVENT = 'event',                    // Intermediate event
  ANNOTATION = 'annotation'           // Text annotation
}

export interface IFlowchartNode {
  id: string;                         // Unique node identifier (e.g., "node_1", "start_1")
  type: FlowchartNodeType;            // Node type
  label: string;                      // Display label/text
  poolId?: string;                    // Pool identifier (for BPMN lanes)
  laneId?: string;                    // Lane identifier
  position: {
    x: number;                        // X coordinate (pixels)
    y: number;                        // Y coordinate (pixels)
  };
  size?: {
    width: number;                    // Node width
    height: number;                   // Node height
  };
  style?: {
    backgroundColor?: string;         // Background color
    borderColor?: string;             // Border color
    textColor?: string;               // Text color
    fontSize?: number;                // Font size
  };
  data?: {
    step_id?: number;                 // Link to ISOPStep.step_id
    actor?: string;                   // Actor name
    description?: string;             // Additional description
    [key: string]: any;               // Extensible data
  };
  created_at?: string;
  updated_at?: string;
}

// ============================================
// FLOWCHART CONNECTION (EDGE)
// ============================================

export enum ConnectionType {
  SEQUENCE = 'sequence',              // Normal sequence flow
  CONDITIONAL = 'conditional',        // Conditional flow (from decision)
  DEFAULT = 'default',                // Default flow (from decision)
  MESSAGE = 'message',                // Message flow (between pools)
  ASSOCIATION = 'association'         // Association (to annotation)
}

export interface IFlowchartConnection {
  id: string;                         // Unique connection identifier
  type: ConnectionType;               // Connection type
  sourceId: string;                   // Source node ID
  targetId: string;                   // Target node ID
  label?: string;                     // Label on connection (e.g., "Ya", "Tidak")
  style?: {
    strokeColor?: string;             // Line color
    strokeWidth?: number;             // Line width
    strokeDasharray?: string;         // Dash pattern for dashed lines
  };
  waypoints?: Array<{ x: number; y: number }>; // Path waypoints for curved connections
  created_at?: string;
  updated_at?: string;
}

// ============================================
// FLOWCHART DATA (Complete Structure)
// ============================================

export interface IFlowchartData {
  version: string;                    // Schema version (e.g., "1.0.0")
  nodes: IFlowchartNode[];            // Array of nodes
  connections: IFlowchartConnection[]; // Array of connections/edges
  pools?: Array<{                     // BPMN Pools (optional)
    id: string;
    name: string;
    lanes: Array<{
      id: string;
      name: string;
      height: number;
    }>;
  }>;
  metadata?: {
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    canvas_size?: {
      width: number;
      height: number;
    };
    zoom_level?: number;
    [key: string]: any;
  };
}

// ============================================
// SOP DOCUMENT (Frontend)
// ============================================

export enum SOPStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  REVISION = 'REVISION',
  ARCHIVED = 'ARCHIVED',
  OBSOLETE = 'OBSOLETE'
}

export interface ISOPDocument {
  id?: string;
  sopNumber?: string;
  title: string;
  description?: string;
  purpose?: string;
  scope?: string;
  status: SOPStatus;
  departmentId: string;
  categoryIds?: string[];
  involvedActors?: string[];
  
  // Mode Manual/Basic Data
  tabularSteps?: ISOPStep[];          // Tabel langkah
  flowchartData?: IFlowchartData;     // Flowchart canvas
  
  // Additional Fields
  legalBasis?: string;                // Dasar Hukum
  executorQualification?: string;     // Kualifikasi Pelaksana
  equipment?: string;                 // Peralatan/Perlengkapan
  warnings?: string;                  // Peringatan
  recordKeeping?: string;             // Pencatatan dan Pendataan
  
  // Metadata
  tags?: string[];
  keywords?: string[];
  references?: string[];
  
  // Dates
  effectiveDate?: string;
  reviewDate?: string;
  
  // Audit
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// SOP VERSION (Frontend)
// ============================================

export interface ISOPVersion {
  id?: string;
  sopId: string;
  versionNumber: number;
  majorVersion: number;
  minorVersion: number;
  
  // Mode Manual/Basic Data (version-specific)
  tabularSteps?: ISOPStep[];
  flowchartData?: IFlowchartData;
  
  content?: string;
  bpmnXml?: string;
  changeLog?: string;
  changeReason?: string;
  
  publishedAt?: string;
  isPublished: boolean;
  createdById: string;
  createdAt?: string;
}

// ============================================
// VALIDATION HELPERS
// ============================================

export interface ISOPValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ISOPValidationResult {
  isValid: boolean;
  errors: ISOPValidationError[];
  warnings: ISOPValidationError[];
}

// ============================================
// FORM DATA (for API submission)
// ============================================

export interface ISOPCreateRequest {
  title: string;
  description?: string;
  purpose?: string;
  scope?: string;
  departmentId: string;
  categoryIds?: string[];
  involvedActors?: string[];
  tabularSteps?: ISOPStep[];
  flowchartData?: IFlowchartData;
  tags?: string[];
  keywords?: string[];
  references?: string[];
  effectiveDate?: string;
  status?: string;
  legalBasis?: string;
  executorQualification?: string;
  equipment?: string;
  warnings?: string;
  recordKeeping?: string;
}

export interface ISOPUpdateRequest extends Partial<ISOPCreateRequest> {
  id: string;
  changeLog?: string;
  changeReason?: string;
}
