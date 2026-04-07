<template>
  <div class="ptb-page">
    <div class="ptb-header">
      <h1 class="ptb-header__title">Mi perfil</h1>
      <p class="ptb-header__subtitle">Datos de tu perfil de paciente</p>
    </div>

    <div v-if="loading" class="ptb-center">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else-if="currentProfile" class="ptb-profile">
      <div class="ptb-profile__row">
        <span class="ptb-profile__label">Nombre</span>
        <span class="ptb-profile__value">{{ profileFullName }}</span>
      </div>
      <div v-if="currentProfile.person?.email" class="ptb-profile__row">
        <span class="ptb-profile__label">Correo electrónico</span>
        <span class="ptb-profile__value">{{ currentProfile.person.email }}</span>
      </div>
      <div v-if="currentProfile.person?.phone" class="ptb-profile__row">
        <span class="ptb-profile__label">Teléfono</span>
        <span class="ptb-profile__value">{{ currentProfile.person.phone }}</span>
      </div>
      <div class="ptb-profile__row">
        <span class="ptb-profile__label">Estado</span>
        <v-chip size="small" variant="tonal" :color="statusBadgeColor(currentProfile.patientStatus)">
          {{ statusBadgeLabel(currentProfile.patientStatus) }}
        </v-chip>
      </div>
      <div class="ptb-profile__row">
        <span class="ptb-profile__label">Terapeuta</span>
        <span class="ptb-profile__value">{{ currentProfile.therapist.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { getProfiles, type PatientProfile } from '~/services/patientPortalService'

definePageMeta({ layout: 'patient', middleware: ['auth', 'role'], role: 'PATIENT' })

const auth = useAuthStore()
const loading = ref(true)
const profiles = ref<PatientProfile[]>([])

const currentProfile = computed(() =>
  profiles.value.find(p => p.id === auth.selectedProfileId) ?? profiles.value[0] ?? null,
)

const profileFullName = computed(() => {
  const p = currentProfile.value?.person
  if (!p) return ''
  return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
})

function statusBadgeLabel(s: string) {
  const map: Record<string, string> = { active: 'Activo', inactive: 'Inactivo', discharged: 'Alta', archived: 'Archivado' }
  return map[s] ?? s
}
function statusBadgeColor(s: string) {
  const map: Record<string, string> = { active: 'success', inactive: 'grey', discharged: 'teal', archived: 'error' }
  return map[s] ?? 'grey'
}

onMounted(async () => {
  try {
    profiles.value = await getProfiles()

    if (!auth.selectedProfileId && profiles.value.length === 1) {
      auth.setProfileId(profiles.value[0].id)
    }
  } catch (e) {
    console.error('[patient-profile] load error', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.ptb-page {
  padding: $space-5;
  max-width: 800px;
  margin: 0 auto;
}

.ptb-header {
  margin-bottom: $space-5;
}

.ptb-header__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-text-main;
  margin: 0 0 $space-1;
}

.ptb-header__subtitle {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin: 0;
}

.ptb-center {
  display: flex;
  justify-content: center;
  padding: $space-8 0;
}

.ptb-profile {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  box-shadow: $shadow-xs;
}

.ptb-profile__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-3 0;

  &:not(:last-child) {
    border-bottom: 1px solid $color-divider;
  }
}

.ptb-profile__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
}

.ptb-profile__value {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-main;
}
</style>
