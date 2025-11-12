import { defineStore } from 'pinia'
import sopService from '@/services/sopService'

export const useSopStore = defineStore('sop', {
  state: () => ({
    sops: [],
    currentSOP: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    filters: {
      search: '',
      status: null,
      departmentId: null,
      complexity: null,
      categoryId: null
    }
  }),

  getters: {
    getSopById: (state) => (id) => {
      return state.sops.find(sop => sop.id === id)
    },
    
    draftSOPs: (state) => {
      return state.sops.filter(sop => sop.status === 'DRAFT')
    },
    
    approvedSOPs: (state) => {
      return state.sops.filter(sop => sop.status === 'APPROVED')
    }
  },

  actions: {
    async fetchSOPs(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await sopService.getSOPs({
          ...this.filters,
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...params
        })

        if (response.success) {
          this.sops = response.data
          this.pagination = response.pagination
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch SOPs'
      } finally {
        this.loading = false
      }
    },

    async fetchSOPById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await sopService.getSOPById(id)
        
        if (response.success) {
          this.currentSOP = response.data
          return response.data
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch SOP'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createSOP(data) {
      this.loading = true
      this.error = null

      try {
        const response = await sopService.createSOP(data)
        
        if (response.success) {
          this.sops.unshift(response.data)
          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.message || 'Failed to create SOP'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateSOP(id, data) {
      this.loading = true
      this.error = null

      try {
        const response = await sopService.updateSOP(id, data)
        
        if (response.success) {
          const index = this.sops.findIndex(sop => sop.id === id)
          if (index !== -1) {
            this.sops[index] = response.data
          }
          if (this.currentSOP?.id === id) {
            this.currentSOP = response.data
          }
          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.message || 'Failed to update SOP'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteSOP(id) {
      this.loading = true
      this.error = null

      try {
        const response = await sopService.deleteSOP(id)
        
        if (response.success) {
          this.sops = this.sops.filter(sop => sop.id !== id)
          return { success: true }
        }
      } catch (error) {
        this.error = error.message || 'Failed to delete SOP'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.page = 1
    },

    setPage(page) {
      this.pagination.page = page
    },

    clearFilters() {
      this.filters = {
        search: '',
        status: null,
        departmentId: null,
        complexity: null,
        categoryId: null
      }
      this.pagination.page = 1
    }
  }
})
