<template>
  <li v-if="visible(item)">
    <router-link
      v-if="item.to && !item.items"
      v-ripple
      :to="item.to"
      :class="['p-ripple', { 'active-route': isActive }]"
      class="layout-menuitem-link"
    >
      <i :class="item.icon" class="layout-menuitem-icon"></i>
      <span class="layout-menuitem-text">{{ item.label }}</span>
    </router-link>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  },
  root: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const authStore = useAuthStore()

const isActive = computed(() => {
  return props.item.to === route.path
})

const visible = (item) => {
  if (item.visible && Array.isArray(item.visible)) {
    return item.visible.includes(authStore.user?.role)
  }
  return true
}
</script>

<style scoped>
.layout-menuitem-link {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.75rem 0.5rem;
  color: var(--text-color);
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
  user-select: none;
  margin-bottom: 0.25rem;
}

.layout-menuitem-link:hover {
  background-color: var(--surface-hover);
}

.layout-menuitem-link.active-route {
  font-weight: 700;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}

.layout-menuitem-icon {
  margin-right: 0.5rem;
  font-size: 1rem;
}

.layout-menuitem-text {
  font-size: 1rem;
}
</style>
