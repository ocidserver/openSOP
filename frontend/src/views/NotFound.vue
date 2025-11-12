<template>
  <div class="not-found-container">
    <Card class="not-found-card">
      <template #content>
        <div class="not-found-content">
          <i class="pi pi-exclamation-triangle not-found-icon"></i>
          <h1 class="not-found-title">404</h1>
          <p class="not-found-message">Halaman tidak ditemukan</p>
          <Button 
            label="Kembali ke Dashboard" 
            icon="pi pi-home" 
            @click="goHome"
            class="p-button-raised"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.not-found-card {
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.not-found-content {
  padding: 2rem;
}

.not-found-icon {
  font-size: 4rem;
  color: var(--orange-500);
  margin-bottom: 1rem;
}

.not-found-title {
  font-size: 4rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0.5rem 0;
}

.not-found-message {
  font-size: 1.2rem;
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
}
</style>
