<template>
  <div class="layout-topbar">
    <router-link to="/" class="layout-topbar-logo">
      <img src="@/assets/images/logo-opensop.png" alt="OpenSOP Logo" class="layout-topbar-logo-image" />
      <span>OpenSOP</span>
    </router-link>

    <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onMenuButtonClick">
      <i class="pi pi-bars"></i>
    </button>

    <ul class="layout-topbar-menu" :class="{ 'layout-topbar-menu-mobile-active': mobileTopbarMenuActive }">
      <li class="layout-topbar-item">
        <button class="p-link layout-topbar-button" @click="toggleTheme" v-tooltip.bottom="isDark ? 'Light Mode' : 'Dark Mode'">
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>
      </li>
      <li class="layout-topbar-item">
        <button class="p-link layout-topbar-button" v-tooltip.bottom="'Notifications'">
          <i class="pi pi-bell"></i>
          <span class="layout-topbar-badge">3</span>
        </button>
      </li>
      <li class="layout-topbar-item">
        <button class="p-link layout-topbar-button" @click="toggleUserMenu" v-tooltip.bottom="'Profile'">
          <i class="pi pi-user"></i>
        </button>
        <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Menu from 'primevue/menu'

const emit = defineEmits(['menu-toggle', 'topbar-menu-toggle'])
const router = useRouter()
const authStore = useAuthStore()
const userMenu = ref()
const mobileTopbarMenuActive = ref(false)
const isDark = ref(false)

const userMenuItems = ref([
  {
    label: 'Profil',
    icon: 'pi pi-user',
    command: () => router.push('/profile')
  },
  {
    separator: true
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => {
      authStore.logout()
      router.push('/login')
    }
  }
])

const onMenuButtonClick = () => {
  emit('menu-toggle')
}

const toggleUserMenu = (event) => {
  userMenu.value.toggle(event)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  const element = document.documentElement
  
  if (isDark.value) {
    element.classList.add('p-dark')
    localStorage.setItem('theme', 'dark')
  } else {
    element.classList.remove('p-dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  // Restore theme from localStorage
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('p-dark')
  }
})
</script>

<style scoped>
.layout-topbar-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--red-500);
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 1rem;
  text-align: center;
}
</style>

<style scoped>
.layout-topbar {
  position: fixed;
  height: 5rem;
  z-index: 997;
  left: 0;
  top: 0;
  width: 100%;
  padding: 0 2rem;
  background-color: var(--surface-card);
  transition: left 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.1);
}

.layout-topbar-logo {
  display: flex;
  align-items: center;
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 700;
  gap: 0.5rem;
  text-decoration: none;
}

.layout-topbar-logo i {
  font-size: 2rem;
}

.layout-menu-button {
  display: none;
  color: var(--text-color-secondary);
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
  border: none;
  background: transparent;
}

.layout-menu-button:hover {
  background-color: var(--surface-hover);
}

.layout-menu-button i {
  font-size: 1.5rem;
}

.layout-topbar-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.layout-topbar-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  color: var(--text-color-secondary);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: transparent;
  border: none;
}

.layout-topbar-button:hover {
  background-color: var(--surface-hover);
}

.layout-topbar-button i {
  font-size: 1.25rem;
}

.layout-topbar-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: var(--red-500);
  color: var(--red-50);
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

@media (max-width: 991px) {
  .layout-menu-button {
    display: inline-flex;
  }
}
</style>
