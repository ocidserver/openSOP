import { defineStore } from 'pinia'
import sopService from '@/services/sopService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isManager: (state) => state.user?.role === 'MANAGER' || state.user?.role === 'ADMIN',
    isReviewer: (state) => ['REVIEWER', 'MANAGER', 'ADMIN'].includes(state.user?.role),
    userRole: (state) => state.user?.role,
    userName: (state) => state.user?.fullName,
    userEmail: (state) => state.user?.email
  },

  actions: {
    async login(email, password) {
      try {
        const response = await sopService.login({ email, password })
        
        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isAuthenticated = true

          // Store in localStorage
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))

          return { success: true }
        }
      } catch (error) {
        throw error
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    restoreAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
      }
    },

    async updateProfile(data) {
      try {
        const response = await sopService.updateUser(this.user.id, data)
        
        if (response.success) {
          this.user = response.data
          localStorage.setItem('user', JSON.stringify(response.data))
          return { success: true }
        }
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Update failed'
        }
      }
    },

    async changePassword(passwords) {
      try {
        const response = await sopService.changePassword(passwords)
        return response
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Password change failed'
        }
      }
    }
  }
})
