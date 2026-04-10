
<template>
  <div class="prof-page">

    <!-- Header -->
    <div class="prof-header">
      <div class="prof-avatar">{{ initials }}</div>

      <div class="prof-header__info">
        <div class="prof-header__name">{{ displayName }}</div>
        <div class="prof-header__meta">
          <span v-if="profile?.specialty" class="prof-badge prof-badge--specialty">
            <v-icon icon="mdi-stethoscope" size="12" />
            {{ profile.specialty }}
          </span>
          <span v-if="profile?.licenseNumber" class="prof-badge prof-badge--license">
            <v-icon icon="mdi-card-account-details-outline" size="12" />
            N.º {{ profile.licenseNumber }}
          </span>
        </div>
      </div>

      <v-btn
        variant="outlined"
        color="primary"
        size="small"
        prepend-icon="mdi-pencil-outline"
        class="ml-auto"
        @click="openEdit"
      >
        Editar perfil
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="!profile && !error" class="prof-loading">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
      {{ error }}
    </v-alert>

    <template v-if="profile">
      <!-- Personal -->
      <div class="prof-section">
        <div class="prof-section__label">
          <v-icon icon="mdi-account-outline" size="15" class="mr-1" />
          Información personal
        </div>
        <div class="prof-info-grid">
          <div class="prof-info-item">
            <span class="prof-info-item__key">Email</span>
            <span class="prof-info-item__val">{{ auth.user?.email || '—' }}</span>
          </div>
          <div class="prof-info-item">
            <span class="prof-info-item__key">Teléfono</span>
            <span class="prof-info-item__val">{{ profile.phone || '—' }}</span>
          </div>
          <div class="prof-info-item">
            <span class="prof-info-item__key">Fecha de nacimiento</span>
            <span class="prof-info-item__val">{{ formatDate(profile.birthDate) }}</span>
          </div>
        </div>
      </div>

      <!-- Professional -->
      <div class="prof-section">
        <div class="prof-section__label">
          <v-icon icon="mdi-briefcase-outline" size="15" class="mr-1" />
          Datos profesionales
        </div>
        <div class="prof-info-grid">
          <div class="prof-info-item">
            <span class="prof-info-item__key">N.º de licencia</span>
            <span class="prof-info-item__val">{{ profile.licenseNumber || '—' }}</span>
          </div>
          <div class="prof-info-item">
            <span class="prof-info-item__key">Especialidad</span>
            <span class="prof-info-item__val">{{ profile.specialty || '—' }}</span>
          </div>
          <div v-if="profile.bio" class="prof-info-item prof-info-item--full">
            <span class="prof-info-item__key">Biografía profesional</span>
            <span class="prof-info-item__val prof-info-item__val--bio">{{ profile.bio }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit dialog -->
    <v-dialog v-model="showEdit" max-width="520" persistent>
      <v-card class="prof-dialog">
        <div class="prof-dialog__header">
          <span class="prof-dialog__title">Editar perfil</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showEdit = false" />
        </div>

        <div class="prof-dialog__body">
          <div class="pd-edit-section-label">Personal</div>
          <div class="pd-edit-grid mb-4">
            <v-text-field v-model="editForm.firstName" label="Nombre" variant="outlined" density="compact" hide-details="auto" />
            <v-text-field v-model="editForm.lastName" label="Apellidos" variant="outlined" density="compact" hide-details="auto" />
          </div>
          <div class="pd-edit-grid mb-4">
            <v-text-field v-model="editForm.phone" label="Teléfono" variant="outlined" density="compact" hide-details="auto" />
            <v-text-field v-model="editForm.birthDate" label="Fecha de nacimiento" type="date" variant="outlined" density="compact" hide-details="auto" />
          </div>

          <div class="pd-edit-section-label">Profesional</div>
          <div class="pd-edit-grid mb-4">
            <v-text-field v-model="editForm.licenseNumber" label="N.º de licencia" variant="outlined" density="compact" hide-details="auto" />
            <v-text-field v-model="editForm.specialty" label="Especialidad" variant="outlined" density="compact" hide-details="auto" />
          </div>
          <v-textarea v-model="editForm.bio" label="Biografía profesional" variant="outlined" density="compact" rows="4" hide-details="auto" class="mb-2" />

          <v-alert v-if="editError" type="error" variant="tonal" density="compact" class="mt-3">{{ editError }}</v-alert>
        </div>

        <div class="prof-dialog__footer">
          <v-btn variant="text" color="default" @click="showEdit = false">Cancelar</v-btn>
          <v-btn variant="flat" color="primary" :loading="saving" @click="saveProfile">Guardar</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { getProfile as getTherapistProfile, updateProfile } from '~/services/therapistService'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const auth = useAuthStore()
const profile = ref<any>(null)
const error = ref('')
const showEdit = ref(false)
const saving = ref(false)
const editError = ref('')
const editForm = ref({ firstName: '', lastName: '', phone: '', birthDate: '', licenseNumber: '', specialty: '', bio: '' })

function normalize(raw: any) {
  return raw?.person ? { ...raw, ...raw.person } : raw
}

onMounted(async () => {
  try {
    profile.value = normalize(await getTherapistProfile())
  } catch {
    error.value = 'No se pudo cargar el perfil.'
  }
})

const displayName = computed(() => {
  if (!profile.value) return auth.user?.name ?? ''
  const { firstName, lastName } = profile.value
  return firstName ? `${firstName} ${lastName ?? ''}`.trim() : (auth.user?.name ?? '')
})

const initials = computed(() => {
  const n = displayName.value.trim()
  const parts = n.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return n.slice(0, 2).toUpperCase()
})

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

function openEdit() {
  editError.value = ''
  editForm.value = {
    firstName:     profile.value?.firstName     ?? '',
    lastName:      profile.value?.lastName      ?? '',
    phone:         profile.value?.phone         ?? '',
    birthDate:     profile.value?.birthDate     ?? '',
    licenseNumber: profile.value?.licenseNumber ?? '',
    specialty:     profile.value?.specialty     ?? '',
    bio:           profile.value?.bio           ?? '',
  }
  showEdit.value = true
}

async function saveProfile() {
  editError.value = ''
  saving.value = true
  try {
    profile.value = normalize(await updateProfile({
      firstName:     editForm.value.firstName     || undefined,
      lastName:      editForm.value.lastName      || undefined,
      phone:         editForm.value.phone         || null,
      birthDate:     editForm.value.birthDate     || null,
      licenseNumber: editForm.value.licenseNumber || undefined,
      specialty:     editForm.value.specialty     || undefined,
      bio:           editForm.value.bio           || null,
    }))
    showEdit.value = false
  } catch {
    editError.value = 'No se pudo guardar el perfil.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.prof-page {
  max-width: 760px;
  margin: 0 auto;
  padding: $space-5;
}

/* ── Header ─────────────────────────────────────────────────── */
.prof-header {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $space-5 $space-6;
  margin-bottom: $space-5;
  box-shadow: $shadow-sm;
}

.prof-avatar {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: $color-primary-subtle;
  color: $color-primary;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.5px;
}

.prof-header__info {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  min-width: 0;
}

.prof-header__name {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-text-main;
  line-height: 1.2;
}

.prof-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.prof-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  border-radius: $radius-full;
  padding: 3px 10px;

  &--specialty {
    background: $color-primary-subtle;
    color: $color-primary;
  }
  &--license {
    background: $color-secondary-subtle;
    color: #1A7A8A;
  }
}

/* ── Loading ─────────────────────────────────────────────────── */
.prof-loading {
  display: flex;
  justify-content: center;
  padding: $space-7 0;
}

/* ── Sections ────────────────────────────────────────────────── */
.prof-section {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  margin-bottom: $space-4;
  box-shadow: $shadow-xs;
}

.prof-section__label {
  display: flex;
  align-items: center;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: $color-text-muted;
  margin-bottom: $space-4;
}

.prof-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $space-4 $space-5;
}

.prof-info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;

  &--full {
    grid-column: 1 / -1;
  }
}

.prof-info-item__key {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $color-text-muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.prof-info-item__val {
  font-size: $font-size-sm;
  color: $color-text-main;
  line-height: 1.5;

  &--bio {
    font-size: $font-size-base;
    color: $color-text-secondary;
    line-height: 1.7;
    white-space: pre-wrap;
  }
}

/* ── Dialog ──────────────────────────────────────────────────── */
.prof-dialog {
  border-radius: $radius-xl !important;
}

.prof-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4 $space-5 0;
}

.prof-dialog__title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
}

.prof-dialog__body {
  padding: $space-4 $space-5;
}

.prof-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: $space-2;
  padding: $space-3 $space-5 $space-4;
  border-top: 1px solid $color-border;
}

.pd-edit-section-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: $color-text-muted;
  margin-bottom: $space-2;
}

.pd-edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-3;
}
</style>
