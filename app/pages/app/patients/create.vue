<template>
  <div class="cp-page">

    <!-- Header -->
    <div class="cp-page__header">
      <v-btn
        variant="text"
        density="compact"
        prepend-icon="mdi-arrow-left"
        color="primary"
        class="cp-page__back"
        to="/app/patients"
      >
        Pacientes
      </v-btn>
      <div class="cp-page__title-wrap">
        <v-icon icon="mdi-account-plus-outline" size="24" color="primary" class="mr-2" />
        <span class="cp-page__title">Nuevo paciente</span>
      </div>
      <p class="cp-page__subtitle">Crea el registro del paciente directamente en la plataforma.</p>
    </div>

    <v-form ref="formRef" @submit.prevent="onSubmit">

      <!-- Datos personales -->
      <div class="cp-card">
        <div class="cp-card__section-label">Datos personales</div>

        <div class="cp-card__row">
          <v-text-field
            v-model="form.firstName"
            label="Nombre *"
            variant="outlined"
            density="compact"
            :error-messages="fieldErrors.firstName"
            hide-details="auto"
            @input="fieldErrors.firstName = []"
          />
          <v-text-field
            v-model="form.lastName"
            label="Apellidos *"
            variant="outlined"
            density="compact"
            :error-messages="fieldErrors.lastName"
            hide-details="auto"
            @input="fieldErrors.lastName = []"
          />
        </div>

        <v-switch
          v-model="form.isMinor"
          label="Paciente menor de edad"
          color="primary"
          density="compact"
          hide-details
          class="mb-4"
          @update:model-value="onIsMinorChange"
        />

        <template v-if="form.isMinor">
          <div class="cp-card__row cp-card__row--single">
            <v-text-field
              v-model="form.birthDate"
              label="Fecha de nacimiento"
              type="date"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </div>
        </template>

        <template v-if="!form.isMinor">
          <div class="cp-card__row">
            <v-text-field
              v-model="form.email"
              label="Email *"
              type="email"
              variant="outlined"
              density="compact"
              :error-messages="fieldErrors.email"
              hide-details="auto"
              @input="fieldErrors.email = []"
            />
            <v-text-field
              v-model="form.phone"
              label="Teléfono"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </div>
        </template>

        <v-divider class="my-4" />

        <div class="cp-card__section-label">Notas administrativas</div>
        <v-textarea
          v-model="form.notesAdministrative"
          label="Notas (opcional)"
          variant="outlined"
          density="compact"
          rows="3"
          hide-details
          placeholder="Visible solo para ti…"
        />
      </div>

      <!-- Tutores — solo si es menor -->
      <template v-if="form.isMinor">
        <div class="cp-section-header">
          <span class="cp-section-header__title">Tutores</span>
          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-plus"
            @click="addGuardian"
          >
            Añadir tutor
          </v-btn>
        </div>

        <div v-if="guardians.length === 0" class="cp-empty-guardians">
          <v-icon icon="mdi-account-child-outline" size="40" color="disabled" />
          <p>Añade al menos un tutor para poder crear el paciente</p>
        </div>

        <div v-for="(g, i) in guardians" :key="i" class="cp-card cp-card--guardian">
          <div class="cp-card__guardian-header">
            <span class="cp-card__section-label">Tutor {{ i + 1 }}</span>
            <v-btn
              icon="mdi-trash-can-outline"
              size="x-small"
              variant="text"
              color="error"
              @click="removeGuardian(i)"
            />
          </div>

          <div class="cp-card__row">
            <v-text-field
              v-model="g.fullName"
              label="Nombre completo *"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
            <v-select
              v-model="g.relationshipType"
              label="Relación *"
              :items="RELATIONSHIP_ITEMS"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </div>

          <div class="cp-card__row">
            <v-text-field
              v-model="g.email"
              label="Email"
              type="email"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
            <v-text-field
              v-model="g.phone"
              label="Teléfono"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </div>

          <div class="cp-card__checkboxes">
            <v-checkbox v-model="g.isLegalGuardian" label="Tutor legal" density="compact" hide-details color="primary" />
            <v-checkbox v-model="g.isPrimaryContact" label="Contacto principal" density="compact" hide-details color="primary" />
            <v-checkbox v-model="g.canManageAppointments" label="Gestionar citas" density="compact" hide-details color="primary" />
            <v-checkbox v-model="g.canReceiveNotifications" label="Recibir notificaciones" density="compact" hide-details color="primary" />
            <v-checkbox v-model="g.canSignDocuments" label="Firmar documentos" density="compact" hide-details color="primary" />
          </div>
        </div>
      </template>

      <!-- Error global -->
      <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mt-4">
        {{ formError }}
      </v-alert>

      <!-- Acciones -->
      <div class="cp-page__actions">
        <v-btn variant="text" to="/app/patients">Cancelar</v-btn>
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          prepend-icon="mdi-account-check-outline"
          :loading="saving"
          :disabled="!canSubmit"
        >
          Crear paciente
        </v-btn>
      </div>

    </v-form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { createPatient } from '~/services/patientService'
import type { CreateGuardianPayload, GuardianRelationshipType } from '~/services/patientService'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const RELATIONSHIP_ITEMS: { label: string; value: GuardianRelationshipType }[] = [
  { label: 'Madre',                value: 'mother' },
  { label: 'Padre',                value: 'father' },
  { label: 'Tutor legal',          value: 'legal_guardian' },
  { label: 'Abuelo/a',             value: 'grandparent' },
  { label: 'Hermano/a',            value: 'sibling' },
  { label: 'Padrastro/Madrastra',  value: 'step_parent' },
  { label: 'Otro',                 value: 'other' },
]

const formRef = ref<any>(null)
const saving = ref(false)
const formError = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  isMinor: false,
  birthDate: '',
  email: '',
  phone: '',
  notesAdministrative: '',
})

const fieldErrors = reactive<Record<string, string[]>>({
  firstName: [],
  lastName: [],
  email: [],
})

type GuardianDraft = Partial<CreateGuardianPayload> & { fullName: string; relationshipType: GuardianRelationshipType | '' }

const guardians = ref<GuardianDraft[]>([])

function addGuardian() {
  guardians.value.push({
    fullName: '',
    relationshipType: '',
    phone: '',
    email: '',
    isLegalGuardian: false,
    isPrimaryContact: false,
    canManageAppointments: false,
    canReceiveNotifications: false,
    canSignDocuments: false,
  })
}

function removeGuardian(index: number) {
  guardians.value.splice(index, 1)
}

function onIsMinorChange() {
  if (form.isMinor) {
    form.email = ''
    form.phone = ''
    fieldErrors.email = []
  } else {
    guardians.value = []
    form.birthDate = ''
  }
}

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email)
}

const canSubmit = computed(() => {
  if (!form.firstName.trim() || !form.lastName.trim()) return false
  if (!form.isMinor) {
    if (!form.email.trim() || !isValidEmail(form.email)) return false
  } else {
    if (guardians.value.length === 0) return false
    if (guardians.value.some(g => !g.fullName?.trim() || !g.relationshipType)) return false
  }
  return true
})

async function onSubmit() {
  formError.value = ''
  if (!canSubmit.value) return

  saving.value = true
  try {
    const payload: any = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      isMinor: form.isMinor,
    }
    if (form.notesAdministrative?.trim()) {
      payload.notesAdministrative = form.notesAdministrative.trim()
    }
    if (!form.isMinor) {
      payload.email = form.email.trim()
      if (form.phone?.trim()) payload.phone = form.phone.trim()
    } else {
      if (form.birthDate) payload.birthDate = form.birthDate
      payload.guardians = guardians.value.map(g => ({
        fullName: g.fullName,
        relationshipType: g.relationshipType,
        ...(g.phone?.trim() ? { phone: g.phone.trim() } : {}),
        ...(g.email?.trim() ? { email: g.email.trim() } : {}),
        isLegalGuardian: g.isLegalGuardian ?? false,
        isPrimaryContact: g.isPrimaryContact ?? false,
        canManageAppointments: g.canManageAppointments ?? false,
        canReceiveNotifications: g.canReceiveNotifications ?? false,
        canSignDocuments: g.canSignDocuments ?? false,
      }))
    }

    const patient = await createPatient(payload)
    await navigateTo(`/app/patients/${patient.id}`)
  } catch (error: any) {
    const status = error?.response?.status
    const data = error?.response?.data

    if (status === 400 && data && typeof data === 'object') {
      // Field-level errors: { "field": ["message", ...] }
      for (const [key, msgs] of Object.entries(data)) {
        if (key in fieldErrors && Array.isArray(msgs)) {
          fieldErrors[key] = msgs as string[]
        }
      }
      formError.value = 'Revisa los campos marcados en rojo.'
    } else if (status === 418 && data?.message) {
      formError.value = data.message
    } else {
      formError.value = 'No se pudo crear el paciente. Inténtalo de nuevo.'
    }
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.cp-page {
  padding: $space-5;
  max-width: 660px;
  margin: 0 auto;

  &__header {
    margin-bottom: $space-5;
  }

  &__back {
    margin-bottom: $space-3;
    padding-left: 0;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    margin-bottom: $space-1;
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    letter-spacing: -0.01em;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $color-text-muted;
    margin: 0;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: $space-3;
    margin-top: $space-5;
  }
}

.cp-card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  margin-bottom: $space-4;

  &__section-label {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $color-text-muted;
    margin-bottom: $space-3;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-3;
    margin-bottom: $space-3;

    &--single {
      grid-template-columns: 1fr;
      max-width: 320px;
    }
  }

  &--guardian {
    margin-bottom: $space-3;
  }

  &__guardian-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-3;
  }

  &__checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: $space-1 $space-4;
    margin-top: $space-2;
  }
}

.cp-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-3;

  &__title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
  }
}

.cp-empty-guardians {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  padding: $space-6 0;
  color: $color-text-muted;
  font-size: $font-size-sm;
  margin-bottom: $space-4;

  p {
    margin: 0;
  }
}
</style>
