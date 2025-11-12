<template>
  <div class="sop-create">
    <Card>
      <template #title>
        <h1>Buat SOP Baru</h1>
      </template>
      <template #content>
        <Message severity="info">Halaman pembuatan SOP - Under Development</Message>
        <Divider />
        <p>Form yang akan tersedia:</p>
        <ul>
          <li>Informasi dasar (kode, judul, deskripsi)</li>
          <li>Kategori & department</li>
          <li>Konten SOP (rich text editor)</li>
          <li>Upload attachment</li>
          <li>Setting approval workflow</li>
        </ul>
        <Divider />
        <div class="button-group">
          <Button label="Batal" icon="pi pi-times" @click="goBack" class="p-button-text" />
          <Button label="Simpan Draft" icon="pi pi-save" class="p-button-secondary" disabled />
          <Button label="Submit untuk Review" icon="pi pi-check" disabled />
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
.sop-create {
  padding: 1rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>
