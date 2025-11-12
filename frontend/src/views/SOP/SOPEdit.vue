<template>
  <div class="sop-edit">
    <Card>
      <template #title>
        <h1>Edit SOP</h1>
      </template>
      <template #content>
        <Message severity="info">Halaman edit SOP - Under Development</Message>
        <Divider />
        <p>Fitur yang akan tersedia:</p>
        <ul>
          <li>Edit informasi SOP</li>
          <li>Versioning otomatis</li>
          <li>Tracking perubahan</li>
          <li>Approval untuk perubahan major</li>
        </ul>
        <Divider />
        <div class="button-group">
          <Button label="Batal" icon="pi pi-times" @click="goBack" class="p-button-text" />
          <Button label="Simpan Perubahan" icon="pi pi-save" disabled />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Divider from 'primevue/divider';

const router = useRouter();
const goBack = () => router.push('/sop');
</script>

<style scoped>
.sop-edit {
  padding: 1rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>
