/**
 * SOP Store Extension for Mode Manual/Basic
 * Manages tabular steps and flowchart data
 */

import { defineStore } from 'pinia';
import sopService from '@/services/sopService';
import type { 
  ISOPStep, 
  IFlowchartData, 
  ISOPDocument,
  ISOPCreateRequest,
  ISOPValidationResult 
} from '@/types/sop.types';

export const useSOPManualStore = defineStore('sopManual', {
  state: () => ({
    // Current editing SOP
    currentSOP: null as ISOPDocument | null,
    
    // Tabular Steps
    tabularSteps: [] as ISOPStep[],
    
    // Flowchart Data
    flowchartData: null as IFlowchartData | null,
    
    // UI State
    isDirty: false,
    isSaving: false,
    errors: [] as any[],
    
    // Metadata
    lastSaved: null as string | null,
    autoSaveEnabled: true,
  }),

  getters: {
    /**
     * Check if there are unsaved changes
     */
    hasUnsavedChanges: (state) => state.isDirty,
    
    /**
     * Get total number of steps
     */
    totalSteps: (state) => state.tabularSteps.length,
    
    /**
     * Get steps by actor
     */
    stepsByActor: (state) => {
      const grouped: Record<string, ISOPStep[]> = {};
      
      state.tabularSteps.forEach(step => {
        if (!grouped[step.actor]) {
          grouped[step.actor] = [];
        }
        grouped[step.actor].push(step);
      });
      
      return grouped;
    },
    
    /**
     * Get validation status
     */
    isValid: (state): boolean => {
      return state.tabularSteps.length > 0 && 
             state.tabularSteps.every(step => 
               step.activity && 
               step.actor
             );
    },
    
    /**
     * Get flowchart node count
     */
    flowchartNodeCount: (state): number => {
      return state.flowchartData?.nodes?.length || 0;
    },
  },

  actions: {
    // ============================================
    // Tabular Steps Management
    // ============================================
    
    /**
     * Set tabular steps from external source
     */
    setTabularSteps(steps: ISOPStep[]) {
      this.tabularSteps = steps;
      this.isDirty = true;
    },
    
    /**
     * Add a new step
     */
    addStep(step?: Partial<ISOPStep>) {
      const newStepId = this.tabularSteps.length > 0 
        ? Math.max(...this.tabularSteps.map(s => s.step_id)) + 1 
        : 1;
      
      const newStep: ISOPStep = {
        step_id: newStepId,
        activity: step?.activity || '',
        actor: step?.actor || '',
        mutu_waktu: step?.mutu_waktu || '',
        mutu_output: step?.mutu_output || '',
        notes: step?.notes || '',
        order: this.tabularSteps.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      this.tabularSteps.push(newStep);
      this.isDirty = true;
      
      return newStep;
    },
    
    /**
     * Update an existing step
     */
    updateStep(stepId: number, updates: Partial<ISOPStep>) {
      const index = this.tabularSteps.findIndex(s => s.step_id === stepId);
      if (index !== -1) {
        this.tabularSteps[index] = {
          ...this.tabularSteps[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        this.isDirty = true;
      }
    },
    
    /**
     * Delete a step
     */
    deleteStep(stepId: number) {
      const index = this.tabularSteps.findIndex(s => s.step_id === stepId);
      if (index !== -1) {
        this.tabularSteps.splice(index, 1);
        
        // Reorder remaining steps
        this.tabularSteps.forEach((step, idx) => {
          step.order = idx;
        });
        
        this.isDirty = true;
      }
    },
    
    /**
     * Reorder steps
     */
    reorderSteps(newOrder: ISOPStep[]) {
      this.tabularSteps = newOrder.map((step, index) => ({
        ...step,
        order: index,
        updated_at: new Date().toISOString(),
      }));
      this.isDirty = true;
    },
    
    /**
     * Clear all steps
     */
    clearSteps() {
      this.tabularSteps = [];
      this.isDirty = true;
    },
    
    // ============================================
    // Flowchart Management
    // ============================================
    
    /**
     * Set flowchart data
     */
    setFlowchartData(data: IFlowchartData) {
      this.flowchartData = data;
      this.isDirty = true;
    },
    
    /**
     * Update flowchart metadata
     */
    updateFlowchartMetadata(metadata: any) {
      if (this.flowchartData) {
        this.flowchartData.metadata = {
          ...this.flowchartData.metadata,
          ...metadata,
          updated_at: new Date().toISOString(),
        };
        this.isDirty = true;
      }
    },
    
    /**
     * Generate flowchart from tabular steps
     */
    generateFlowchartFromSteps() {
      if (this.tabularSteps.length === 0) {
        return;
      }
      
      // Auto-generate flowchart nodes from steps
      const nodes: any[] = [
        {
          id: 'start_1',
          type: 'start',
          label: 'Mulai',
          position: { x: 100, y: 50 },
        }
      ];
      
      const connections: any[] = [];
      let yOffset = 150;
      
      this.tabularSteps.forEach((step, index) => {
        const nodeId = `task_${step.step_id}`;
        
        nodes.push({
          id: nodeId,
          type: 'task',
          label: step.activity.substring(0, 50) + (step.activity.length > 50 ? '...' : ''),
          poolId: step.actor,
          position: { x: 100, y: yOffset },
          data: {
            step_id: step.step_id,
            actor: step.actor,
            description: step.activity,
          }
        });
        
        // Connect to previous node
        const sourceId = index === 0 ? 'start_1' : `task_${this.tabularSteps[index - 1].step_id}`;
        connections.push({
          id: `conn_${index}`,
          type: 'sequence',
          sourceId,
          targetId: nodeId,
        });
        
        yOffset += 100;
      });
      
      // Add end node
      nodes.push({
        id: 'end_1',
        type: 'end',
        label: 'Selesai',
        position: { x: 100, y: yOffset },
      });
      
      connections.push({
        id: `conn_end`,
        type: 'sequence',
        sourceId: `task_${this.tabularSteps[this.tabularSteps.length - 1].step_id}`,
        targetId: 'end_1',
      });
      
      this.flowchartData = {
        version: '1.0.0',
        nodes,
        connections,
        metadata: {
          generated_from: 'tabular_steps',
          generated_at: new Date().toISOString(),
        }
      };
      
      this.isDirty = true;
    },
    
    // ============================================
    // Validation
    // ============================================
    
    /**
     * Validate current SOP data
     */
    validate(): ISOPValidationResult {
      const errors: any[] = [];
      const warnings: any[] = [];
      
      // Check if steps exist
      if (this.tabularSteps.length === 0) {
        errors.push({
          field: 'tabularSteps',
          message: 'SOP harus memiliki minimal 1 langkah',
          type: 'error'
        });
      }
      
      // Validate each step
      this.tabularSteps.forEach((step, index) => {
        if (!step.activity || step.activity.trim() === '') {
          errors.push({
            field: `tabularSteps[${index}].activity`,
            message: `Langkah ${index + 1}: Aktivitas wajib diisi`,
            type: 'error'
          });
        }
        
        if (!step.actor || step.actor.trim() === '') {
          errors.push({
            field: `tabularSteps[${index}].actor`,
            message: `Langkah ${index + 1}: Pelaksana wajib diisi`,
            type: 'error'
          });
        }
        
        if (!step.mutu_waktu || step.mutu_waktu.trim() === '') {
          warnings.push({
            field: `tabularSteps[${index}].mutu_waktu`,
            message: `Langkah ${index + 1}: Mutu waktu sebaiknya diisi`,
            type: 'warning'
          });
        }
        
        if (!step.mutu_output || step.mutu_output.trim() === '') {
          warnings.push({
            field: `tabularSteps[${index}].mutu_output`,
            message: `Langkah ${index + 1}: Mutu output sebaiknya diisi`,
            type: 'warning'
          });
        }
      });
      
      this.errors = errors;
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    
    // ============================================
    // Persistence (Save/Load)
    // ============================================
    
    /**
     * Save SOP to backend
     */
    async saveSOP(sopData: Partial<ISOPDocument>) {
      this.isSaving = true;
      
      try {
        // Only validate if submitting for review, not for draft
        if (sopData.status === 'REVIEW' || sopData.status === 'APPROVED') {
          const validation = this.validate();
          if (!validation.isValid) {
            throw new Error('Validasi gagal. Periksa kembali data SOP.');
          }
        }
        
        const payload: ISOPCreateRequest = {
          title: sopData.title!,
          description: sopData.description,
          purpose: sopData.purpose,
          scope: sopData.scope,
          departmentId: sopData.departmentId!,
          categoryIds: sopData.categoryIds || [],
          involvedActors: sopData.involvedActors || [],
          tabularSteps: this.tabularSteps,
          flowchartData: this.flowchartData || undefined,
          tags: sopData.tags,
          keywords: sopData.keywords,
          references: sopData.references,
          effectiveDate: sopData.effectiveDate,
          status: sopData.status || 'DRAFT',
          legalBasis: sopData.legalBasis,
          executorQualification: sopData.executorQualification,
          equipment: sopData.equipment,
          warnings: sopData.warnings,
          recordKeeping: sopData.recordKeeping,
        };
        
        let response;
        if (sopData.id) {
          // Update existing SOP
          response = await sopService.updateSOP(sopData.id, payload);
        } else {
          // Create new SOP
          response = await sopService.createSOP(payload);
        }
        
        if (response.success) {
          this.currentSOP = response.data;
          this.isDirty = false;
          this.lastSaved = new Date().toISOString();
          return response.data;
        } else {
          throw new Error(response.message || 'Gagal menyimpan SOP');
        }
      } catch (error: any) {
        console.error('Error saving SOP:', error);
        throw error;
      } finally {
        this.isSaving = false;
      }
    },
    
    /**
     * Load SOP from backend
     */
    async loadSOP(sopId: string) {
      try {
        const response = await sopService.getSOPById(sopId);
        
        if (response.success) {
          const sop = response.data;
          
          this.currentSOP = sop;
          this.tabularSteps = sop.tabularSteps || [];
          this.flowchartData = sop.flowchartData || null;
          this.isDirty = false;
          
          return sop;
        } else {
          throw new Error('SOP tidak ditemukan');
        }
      } catch (error: any) {
        console.error('Error loading SOP:', error);
        throw error;
      }
    },
    
    /**
     * Auto-save to localStorage
     */
    autoSave() {
      if (!this.autoSaveEnabled) return;
      
      const data = {
        tabularSteps: this.tabularSteps,
        flowchartData: this.flowchartData,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem('sop_draft', JSON.stringify(data));
    },
    
    /**
     * Restore from localStorage
     */
    restoreFromAutoSave() {
      const saved = localStorage.getItem('sop_draft');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.tabularSteps = data.tabularSteps || [];
          this.flowchartData = data.flowchartData || null;
          this.isDirty = true;
          return true;
        } catch (error) {
          console.error('Error restoring auto-save:', error);
          return false;
        }
      }
      return false;
    },
    
    /**
     * Clear auto-save
     */
    clearAutoSave() {
      localStorage.removeItem('sop_draft');
    },
    
    /**
     * Reset store to initial state
     */
    reset() {
      this.currentSOP = null;
      this.tabularSteps = [];
      this.flowchartData = null;
      this.isDirty = false;
      this.isSaving = false;
      this.errors = [];
      this.lastSaved = null;
    },
  },
});
