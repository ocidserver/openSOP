<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item.label || i">
      <li v-if="visible(item)" class="layout-menuitem-category">
        <div class="layout-menuitem-root-text">{{ item.label }}</div>
        <ul>
          <app-menu-item
            v-for="child in item.items"
            :key="child.label"
            :item="child"
            :root="true"
          ></app-menu-item>
        </ul>
      </li>
    </template>
  </ul>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppMenuItem from './AppMenuItem.vue'

const authStore = useAuthStore()

const model = ref([
  {
    label: 'Home',
    items: [
      { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }
    ]
  },
  {
    label: 'Pengelolaan SOP',
    items: [
      { label: 'Daftar SOP', icon: 'pi pi-fw pi-file', to: '/sop' },
      { 
        label: 'Buat SOP Baru', 
        icon: 'pi pi-fw pi-plus-circle', 
        to: '/sop/create',
        visible: ['ADMIN', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA', 'SUPERVISOR']
      }
    ]
  },
  {
    label: 'Master Data',
    items: [
      { 
        label: 'Unit Kerja', 
        icon: 'pi pi-fw pi-building', 
        to: '/departments',
        visible: ['ADMIN']
      },
      { 
        label: 'Aktor/Pelaksana', 
        icon: 'pi pi-fw pi-id-card', 
        to: '/actors',
        visible: ['ADMIN', 'SUPERVISOR']
      },
      { 
        label: 'Kategori SOP', 
        icon: 'pi pi-fw pi-tags', 
        to: '/categories',
        visible: ['ADMIN', 'SUPERVISOR']
      },
      { 
        label: 'Pengguna', 
        icon: 'pi pi-fw pi-users', 
        to: '/users',
        visible: ['ADMIN']
      }
    ]
  },
  {
    label: 'Monitoring & Evaluasi',
    items: [
      { 
        label: 'Dashboard Monitoring', 
        icon: 'pi pi-fw pi-chart-line', 
        to: '/monitoring',
        visible: ['ADMIN', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA', 'SUPERVISOR']
      },
      { 
        label: 'Penilaian SOP', 
        icon: 'pi pi-fw pi-star', 
        to: '/monitoring/penilaian',
        visible: ['ADMIN', 'SUPERVISOR']
      },
      { 
        label: 'Laporan', 
        icon: 'pi pi-fw pi-chart-bar', 
        to: '/reports',
        visible: ['ADMIN', 'PIMPINAN_TINGGI_UTAMA', 'PIMPINAN_TINGGI_MADYA', 'PIMPINAN_TINGGI_PRATAMA', 'SUPERVISOR']
      }
    ]
  },
  {
    label: 'User',
    items: [
      { label: 'Profil Saya', icon: 'pi pi-fw pi-user', to: '/profile' }
    ]
  }
])

const visible = (item) => {
  if (item.visible && Array.isArray(item.visible)) {
    return item.visible.includes(authStore.user?.role)
  }
  return true
}
</script>

<style scoped>
.layout-menu {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.layout-menuitem-category {
  margin-top: 1rem;
}

.layout-menuitem-category:first-child {
  margin-top: 0;
}

.layout-menuitem-category > ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.layout-menuitem-root-text {
  font-size: 0.857rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
}
</style>
