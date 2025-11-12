<template>
  <div class="login-container">
    <div class="login-card-wrapper">
      <Card class="login-card">
        <template #header>
          <div class="login-header">
            <i class="pi pi-shield" style="font-size: 3rem; color: #667eea"></i>
            <h1>SOP Management System</h1>
            <p>Badan Pusat Statistik</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin">
            <div class="field">
              <label for="email">Email</label>
              <InputText
                id="email"
                v-model="form.email"
                type="email"
                placeholder="admin@bps.go.id"
                class="w-full"
                :class="{ 'p-invalid': errors.email }"
              />
              <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>

            <div class="field">
              <label for="password">Password</label>
              <Password
                id="password"
                v-model="form.password"
                placeholder="Masukkan password"
                :feedback="false"
                toggleMask
                class="w-full"
                :class="{ 'p-invalid': errors.password }"
                :inputStyle="{ width: '100%' }"
              />
              <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
            </div>

            <Button
              type="submit"
              label="Login"
              icon="pi pi-sign-in"
              class="w-full mt-3"
              :loading="loading"
              :disabled="loading"
            />
          </form>
        </template>

        <template #footer>
          <div class="login-footer">
            <small>&copy; 2025 Badan Pusat Statistik. All rights reserved.</small>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({})
const loading = ref(false)

const handleLogin = async () => {
  // Reset errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  // Validation
  if (!form.email) {
    errors.email = 'Email wajib diisi'
    return
  }
  if (!form.password) {
    errors.password = 'Password wajib diisi'
    return
  }

  try {
    loading.value = true
    await authStore.login(form.email, form.password)
    
    toast.add({
      severity: 'success',
      summary: 'Login Berhasil',
      detail: 'Selamat datang di SOP Management System',
      life: 3000
    })
    
    router.push('/')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Login Gagal',
      detail: error.response?.data?.message || 'Email atau password salah',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card-wrapper {
  width: 100%;
  max-width: 450px;
}

.login-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  padding: 2rem 1rem 1rem;
}

.login-header h1 {
  margin: 1rem 0 0.5rem;
  font-size: 1.75rem;
  color: #495057;
}

.login-header p {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.login-footer {
  text-align: center;
  color: #6c757d;
  padding: 0.5rem 0;
}

.mt-3 {
  margin-top: 1rem;
}

.w-full {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}
</style>
