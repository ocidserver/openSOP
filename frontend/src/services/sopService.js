import api from './api'

export default {
  // Authentication
  login(credentials) {
    return api.post('/auth/login', credentials)
  },
  
  register(userData) {
    return api.post('/auth/register', userData)
  },
  
  getCurrentUser() {
    return api.get('/auth/me')
  },
  
  changePassword(passwords) {
    return api.post('/auth/change-password', passwords)
  },

  // SOPs
  getSOPs(params) {
    return api.get('/sop', { params })
  },
  
  getSOPById(id) {
    return api.get(`/sop/${id}`)
  },
  
  createSOP(data) {
    return api.post('/sop', data)
  },
  
  updateSOP(id, data) {
    return api.put(`/sop/${id}`, data)
  },
  
  deleteSOP(id) {
    return api.delete(`/sop/${id}`)
  },
  
  addComment(sopId, comment) {
    return api.post(`/sop/${sopId}/comment`, comment)
  },

  // Categories
  getCategories(params) {
    return api.get('/categories', { params })
  },
  
  getCategoryById(id) {
    return api.get(`/categories/${id}`)
  },
  
  createCategory(data) {
    return api.post('/categories', data)
  },
  
  updateCategory(id, data) {
    return api.put(`/categories/${id}`, data)
  },
  
  deleteCategory(id) {
    return api.delete(`/categories/${id}`)
  },

  // Departments
  getDepartments() {
    return api.get('/departments')
  },
  
  getDepartmentById(id) {
    return api.get(`/departments/${id}`)
  },
  
  createDepartment(data) {
    return api.post('/departments', data)
  },
  
  updateDepartment(id, data) {
    return api.put(`/departments/${id}`, data)
  },

  // Users
  getUsers(params) {
    return api.get('/users', { params })
  },
  
  getUserById(id) {
    return api.get(`/users/${id}`)
  },
  
  createUser(data) {
    return api.post('/auth/register', data)
  },
  
  updateUser(id, data) {
    return api.put(`/users/${id}`, data)
  },
  
  deleteUser(id) {
    return api.delete(`/users/${id}`)
  },

  // Actors
  getActors(params) {
    return api.get('/actors', { params })
  },
  
  getActorById(id) {
    return api.get(`/actors/${id}`)
  },
  
  createActor(data) {
    return api.post('/actors', data)
  },
  
  updateActor(id, data) {
    return api.put(`/actors/${id}`, data)
  },
  
  deleteActor(id) {
    return api.delete(`/actors/${id}`)
  },

  // Approvals
  getSOPWorkflows(sopId) {
    return api.get(`/approvals/sop/${sopId}`)
  },
  
  createWorkflow(data) {
    return api.post('/approvals', data)
  },
  
  takeApprovalAction(workflowId, action) {
    return api.post(`/approvals/${workflowId}/action`, action)
  },

  // Audit Logs
  getAuditLogs(params) {
    return api.get('/audit', { params })
  },
  
  getEntityAuditLogs(entityType, entityId) {
    return api.get(`/audit/entity/${entityType}/${entityId}`)
  },

  // Reports
  getDashboardStats() {
    return api.get('/reports/dashboard')
  },

  getInventoryReport() {
    return api.get('/reports/inventory')
  },

  getComplianceReport(params) {
    return api.get('/reports/compliance', { params })
  },

  // PDF Download
  downloadSOPPDF(id) {
    return api.get(`/sop/${id}/download`, {
      responseType: 'blob' // Important for file download
    })
  }
}
