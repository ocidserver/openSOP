<template>
  <div class="user-profile">
    <div class="page-header">
      <h1 class="page-title">Profil Pengguna</h1>
    </div>

    <div class="grid">
      <!-- Profile Card -->
      <div class="col-12 lg:col-4">
        <Card class="profile-card">
          <template #content>
            <div class="profile-header">
              <Avatar 
                :label="userInitials" 
                size="xlarge"
                shape="circle"
                class="profile-avatar"
              />
              <h2 class="profile-name">{{ userData.name }}</h2>
              <div class="profile-role">
                <Tag :value="getRoleLabel(userData.role)" :severity="getRoleSeverity(userData.role)" />
              </div>
              <div class="profile-email">
                <i class="pi pi-envelope"></i>
                {{ userData.email }}
              </div>
              <div class="profile-department">
                <i class="pi pi-building"></i>
                {{ userData.department }}
              </div>
            </div>
            
            <Divider />
            
            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-value">{{ stats.sopCreated }}</div>
                <div class="stat-label">SOP Dibuat</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.sopApproved }}</div>
                <div class="stat-label">SOP Disetujui</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.lastLogin }}</div>
                <div class="stat-label">Login Terakhir</div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Content Area with View Selector -->
      <div class="col-12 lg:col-8">
        <Card>
          <template #title>
            <div class="card-title-with-selector">
              <span>Pengaturan Profil</span>
              <SelectButton 
                v-model="viewMode" 
                :options="viewOptions" 
                optionLabel="label"
                optionValue="value"
                aria-labelledby="profile-view-selector"
                :unselectable="false"
              />
            </div>
          </template>
          <template #content>
            <!-- Informasi Profil View -->
            <div v-show="viewMode === 'profile'" class="profile-view">
              <div class="view-header">
                <h3>Informasi Profil</h3>
                <Button 
                  v-if="!editMode"
                  label="Edit" 
                  icon="pi pi-pencil" 
                  text
                  @click="enableEdit"
                />
              </div>
              
              <div class="form-grid">
                <div class="field">
                  <label for="name">Nama Lengkap</label>
                  <InputText 
                    id="name"
                    v-model="formData.name" 
                    :disabled="!editMode"
                    class="w-full"
                  />
                </div>

                <div class="field">
                  <label for="email">Email</label>
                  <InputText 
                    id="email"
                    v-model="formData.email" 
                    :disabled="!editMode"
                    class="w-full"
                  />
                </div>

                <div class="field">
                  <label for="phone">No. Telepon</label>
                  <InputText 
                    id="phone"
                    v-model="formData.phone" 
                    :disabled="!editMode"
                    class="w-full"
                  />
                </div>

                <div class="field">
                  <label for="position">Jabatan</label>
                  <InputText 
                    id="position"
                    v-model="formData.position" 
                    :disabled="!editMode"
                    class="w-full"
                  />
                </div>

                <div class="field" v-if="editMode">
                  <div class="button-group">
                    <Button 
                      label="Batal" 
                      icon="pi pi-times" 
                      severity="secondary"
                      outlined
                      @click="cancelEdit"
                    />
                    <Button 
                      label="Simpan Perubahan" 
                      icon="pi pi-check" 
                      @click="saveProfile"
                      :loading="saving"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Ubah Password View -->
            <div v-show="viewMode === 'password'" class="password-view">
              <div class="view-header">
                <h3>Ubah Password</h3>
              </div>
              
              <div class="form-grid">
                <div class="field">
                  <label for="currentPassword">Password Saat Ini</label>
                  <Password 
                    id="currentPassword"
                    v-model="passwordData.currentPassword" 
                    toggleMask
                    :feedback="false"
                    class="w-full"
                    inputClass="w-full"
                    :class="{ 'p-invalid': passwordSubmitted && !passwordData.currentPassword }"
                  />
                  <small class="p-error" v-if="passwordSubmitted && !passwordData.currentPassword">
                    Password saat ini wajib diisi.
                  </small>
                </div>

                <div class="field">
                  <label for="newPassword">Password Baru</label>
                  <Password 
                    id="newPassword"
                    v-model="passwordData.newPassword" 
                    toggleMask
                    class="w-full"
                    inputClass="w-full"
                    :class="{ 'p-invalid': passwordSubmitted && !passwordData.newPassword }"
                  >
                    <template #header>
                      <h6>Pilih password</h6>
                    </template>
                    <template #footer>
                      <Divider />
                      <p class="mt-2">Saran:</p>
                      <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                        <li>Minimal 8 karakter</li>
                        <li>Kombinasi huruf besar dan kecil</li>
                        <li>Minimal 1 angka</li>
                      </ul>
                    </template>
                  </Password>
                  <small class="p-error" v-if="passwordSubmitted && !passwordData.newPassword">
                    Password baru wajib diisi.
                  </small>
                </div>

                <div class="field">
                  <label for="confirmPassword">Konfirmasi Password Baru</label>
                  <Password 
                    id="confirmPassword"
                    v-model="passwordData.confirmPassword" 
                    toggleMask
                    :feedback="false"
                    class="w-full"
                    inputClass="w-full"
                    :class="{ 'p-invalid': passwordSubmitted && (!passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword) }"
                  />
                  <small class="p-error" v-if="passwordSubmitted && !passwordData.confirmPassword">
                    Konfirmasi password wajib diisi.
                  </small>
                  <small class="p-error" v-else-if="passwordSubmitted && passwordData.newPassword !== passwordData.confirmPassword">
                    Password tidak cocok.
                  </small>
                </div>

                <div class="field">
                  <Button 
                    label="Ubah Password" 
                    icon="pi pi-lock" 
                    @click="changePassword"
                    :loading="changingPassword"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'

const authStore = useAuthStore()
const toast = useToast()

const viewMode = ref('profile')
const editMode = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const passwordSubmitted = ref(false)

const viewOptions = ref([
  { label: 'Informasi Profil', value: 'profile' },
  { label: 'Ubah Password', value: 'password' }
])

const userData = ref({
  name: 'Admin BPS',
  email: 'admin@bps.go.id',
  role: 'ADMIN',
  department: 'IT',
  phone: '081234567890',
  position: 'Administrator'
})

const stats = ref({
  sopCreated: 15,
  sopApproved: 23,
  lastLogin: '11 Nov 2025'
})

const formData = ref({
  name: userData.value.name,
  email: userData.value.email,
  phone: userData.value.phone,
  position: userData.value.position
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const userInitials = computed(() => {
  return userData.value.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const getRoleLabel = (role) => {
  const roleMap = { 'ADMIN': 'Admin', 'SUPERVISOR': 'Supervisor', 'USER': 'User', 'GUEST': 'Guest' }
  return roleMap[role] || role
}

const getRoleSeverity = (role) => {
  const severityMap = { 'ADMIN': 'danger', 'SUPERVISOR': 'warning', 'USER': 'info', 'GUEST': 'secondary' }
  return severityMap[role] || 'info'
}

const enableEdit = () => { editMode.value = true }

const cancelEdit = () => {
  editMode.value = false
  formData.value = { name: userData.value.name, email: userData.value.email, phone: userData.value.phone, position: userData.value.position }
}

const saveProfile = () => {
  saving.value = true
  setTimeout(() => {
    userData.value = { ...userData.value, ...formData.value }
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Profil berhasil diupdate', life: 3000 })
    saving.value = false
    editMode.value = false
  }, 1000)
}

const changePassword = () => {
  passwordSubmitted.value = true
  if (!passwordData.value.currentPassword || !passwordData.value.newPassword || !passwordData.value.confirmPassword) return
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) return
  changingPassword.value = true
  setTimeout(() => {
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Password berhasil diubah', life: 3000 })
    passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    passwordSubmitted.value = false
    changingPassword.value = false
  }, 1000)
}
</script>

<style scoped>
.user-profile { max-width: 100%; padding: 1.5rem; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 2rem; font-weight: 600; color: var(--text-color); margin: 0; }
.profile-card { border-radius: 12px; }
.profile-header { text-align: center; padding: 1rem 0; }
.profile-avatar { width: 120px; height: 120px; font-size: 2.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 1rem; }
.profile-name { font-size: 1.5rem; font-weight: 600; color: var(--text-color); margin: 0.5rem 0; }
.profile-role { margin: 0.75rem 0; }
.profile-email, .profile-department { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-color-secondary); font-size: 0.875rem; margin: 0.5rem 0; }
.profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 1rem 0; }
.stat-item { text-align: center; }
.stat-value { font-size: 1.75rem; font-weight: 700; color: var(--primary-color); }
.stat-label { font-size: 0.813rem; color: var(--text-color-secondary); margin-top: 0.25rem; }
.card-title-with-selector { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; width: 100%; }
.card-title-with-selector > span { font-size: 1.25rem; font-weight: 600; }
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--surface-border); }
.view-header h3 { margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--text-color); }
.profile-view, .password-view { padding: 0.5rem 0; }
.form-grid { display: flex; flex-direction: column; gap: 1.25rem; }
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.field label { font-weight: 600; color: var(--text-color); font-size: 0.875rem; }
.button-group { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
@media (max-width: 992px) {
  .card-title-with-selector { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 576px) {
  .user-profile { padding: 1rem; }
  .button-group { flex-direction: column; }
  .button-group button { width: 100%; }
  .card-title-with-selector :deep(.p-selectbutton) { width: 100%; }
  .card-title-with-selector :deep(.p-selectbutton .p-button) { flex: 1; }
}
</style>
