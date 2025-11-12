<template>
  <div class="category-list">
    <Card>
      <template #title>
        <div class="title-section">
          <h1>Daftar Kategori</h1>
          <Button label="Tambah Kategori" icon="pi pi-plus" class="p-button-success" disabled />
        </div>
      </template>
      <template #content>
        <Message severity="info">Halaman manajemen kategori - Under Development</Message>
        <Divider />
        <p>Fitur yang akan tersedia:</p>
        <ul>
          <li>Daftar kategori SOP</li>
          <li>CRUD kategori</li>
          <li>Hierarki kategori</li>
          <li>Filter & search</li>
        </ul>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Divider from 'primevue/divider';
</script>

<style scoped>
.category-list {
  padding: 1rem;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h1 {
  margin: 0;
}
</style>
