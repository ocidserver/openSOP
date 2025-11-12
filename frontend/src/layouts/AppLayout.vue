<template>
  <div class="layout-wrapper" :class="layoutClass">
    <app-topbar @menu-toggle="onMenuToggle" @topbar-menu-toggle="onTopbarMenuToggle" />
    
    <div class="layout-sidebar">
      <app-sidebar />
    </div>

    <div class="layout-main-container">
      <div class="layout-main">
        <router-view />
      </div>
      <app-footer />
    </div>

    <div class="layout-mask" @click="onMaskClick"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppTopbar from './AppTopbar.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'

console.log('🎨 AppLayout mounted')

const route = useRoute()
const layoutMode = ref('static')
const staticMenuInactive = ref(false)
const overlayMenuActive = ref(false)
const mobileMenuActive = ref(false)
const mobileTopbarMenuActive = ref(false)

const layoutClass = computed(() => {
  return {
    'layout-overlay': layoutMode.value === 'overlay',
    'layout-static': layoutMode.value === 'static',
    'layout-static-inactive': staticMenuInactive.value && layoutMode.value === 'static',
    'layout-overlay-active': overlayMenuActive.value && layoutMode.value === 'overlay',
    'layout-mobile-active': mobileMenuActive.value,
    'p-input-filled': true,
    'p-ripple-disabled': false
  }
})

const isSidebarVisible = computed(() => {
  if (layoutMode.value === 'static') return !staticMenuInactive.value
  else if (layoutMode.value === 'overlay') return overlayMenuActive.value
  return true
})

const onMenuToggle = () => {
  if (window.innerWidth > 991) {
    if (layoutMode.value === 'overlay') {
      overlayMenuActive.value = !overlayMenuActive.value
    } else if (layoutMode.value === 'static') {
      staticMenuInactive.value = !staticMenuInactive.value
    }
  } else {
    mobileMenuActive.value = !mobileMenuActive.value
  }
}

const onTopbarMenuToggle = () => {
  mobileTopbarMenuActive.value = !mobileTopbarMenuActive.value
}

const onMaskClick = () => {
  mobileMenuActive.value = false
  mobileTopbarMenuActive.value = false
}

watch(route, () => {
  if (mobileMenuActive.value) {
    mobileMenuActive.value = false
  }
})

onMounted(() => {
  if (window.innerWidth < 992) {
    layoutMode.value = 'overlay'
  }
})
</script>
