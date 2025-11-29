import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 'sop',
        name: 'SOPList',
        component: () => import('@/views/SOP/SOPList.vue'),
        meta: { title: 'Daftar SOP' }
      },
      {
        path: 'sop/create',
        name: 'SOPCreate',
        component: () => import('@/views/SOP/SOPCreate.vue'),
        meta: { title: 'Buat SOP Baru', roles: ['ADMIN', 'SUPERVISOR', 'MANAGER'] }
      },
      {
        path: 'sop/:id',
        name: 'SOPDetail',
        component: () => import('@/views/SOP/SOPDetail.vue'),
        meta: { title: 'Detail SOP' }
      },
      {
        path: 'sop/:id/edit',
        name: 'SOPEdit',
        component: () => import('@/views/SOP/SOPEdit.vue'),
        meta: { title: 'Edit SOP', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories/CategoryList.vue'),
        meta: { title: 'Kategori SOP', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('@/views/Departments/DepartmentList.vue'),
        meta: { title: 'Unit Kerja', roles: ['ADMIN'] }
      },
      {
        path: 'actors',
        name: 'Actors',
        component: () => import('@/views/Actors/ActorList.vue'),
        meta: { title: 'Aktor/Pelaksana', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users/UserList.vue'),
        meta: { title: 'Pengguna', roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'monitoring',
        name: 'Monitoring',
        component: () => import('@/views/Monitoring/MonitoringDashboard.vue'),
        meta: { title: 'Dashboard Monitoring', roles: ['ADMIN', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA', 'SUPERVISOR'] }
      },
      {
        path: 'monitoring/penilaian',
        name: 'SOPEvaluation',
        component: () => import('@/views/Monitoring/SOPEvaluation.vue'),
        meta: { title: 'Penilaian SOP', roles: ['ADMIN', 'SUPERVISOR'] }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports/ReportList.vue'),
        meta: { title: 'Laporan', roles: ['ADMIN', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA', 'SUPERVISOR'] }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile/UserProfile.vue'),
        meta: { title: 'Profil Saya' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/Login.vue'),
    meta: { title: 'Login', requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404 - Halaman Tidak Ditemukan' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const requiredRoles = to.meta.roles

  console.log('🔍 Router Guard:', {
    to: to.path,
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    requiresAuth
  })

  // Set page title
  document.title = `${to.meta.title || 'SOP-MS'} - BPS`

  // Check authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login')
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Check authorization (roles)
  if (requiredRoles && authStore.isAuthenticated) {
    if (!requiredRoles.includes(authStore.user?.role)) {
      console.log('❌ No permission, redirecting to dashboard')
      next({ name: 'Dashboard' })
      return
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (to.name === 'Login' && authStore.isAuthenticated) {
    console.log('✅ Already logged in, redirecting to dashboard')
    next({ name: 'Dashboard' })
    return
  }

  console.log('✅ Proceeding to route')
  next()
})

export default router
