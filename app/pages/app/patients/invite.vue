<template>
  <div class="inv-page">

    <!-- Header -->
    <div class="inv-page__header">
      <v-btn
        variant="text"
        density="compact"
        prepend-icon="mdi-arrow-left"
        color="primary"
        class="inv-page__back"
        to="/app/patients"
      >
        Pacientes
      </v-btn>
      <div class="inv-page__title-wrap">
        <v-icon icon="mdi-account-plus-outline" size="24" color="primary" class="mr-2" />
        <span class="inv-page__title">Invitar paciente</span>
      </div>
      <p class="inv-page__subtitle">Se enviará un email con un enlace para que el paciente complete su registro.</p>
    </div>

    <!-- Success state -->
    <div v-if="success" class="inv-success">
      <v-icon icon="mdi-check-circle-outline" size="52" color="success" />
      <p class="inv-success__msg">Invitación enviada correctamente</p>
      <p class="inv-success__sub">El paciente recibirá un correo con instrucciones para registrarse.</p>
      <div class="inv-success__actions">
        <v-btn color="primary" variant="flat" prepend-icon="mdi-account-plus-outline" @click="resetForm">
          Invitar otro paciente
        </v-btn>
        <v-btn variant="text" to="/app/patients">Volver a pacientes</v-btn>
      </div>
    </div>

    <!-- Form -->
    <v-form v-else ref="formRef" @submit.prevent="onInvite">
      <div class="inv-card">
        <div class="inv-card__section-label">Datos personales</div>
        <div class="inv-card__row">
          <v-text-field
            v-model="firstName"
            label="Nombre *"
            variant="outlined"
            density="compact"
            :rules="[v => !!v || 'Requerido']"
            hide-details="auto"
          />
          <v-text-field
            v-model="lastName"
            label="Apellidos *"
            variant="outlined"
            density="compact"
            :rules="[v => !!v || 'Requerido']"
            hide-details="auto"
          />
        </div>
        <div class="inv-card__row">
          <v-text-field
            v-model="email"
            label="Email *"
            type="email"
            variant="outlined"
            density="compact"
            :rules="[v => !!v || 'Requerido', v => /.+@.+\..+/.test(v) || 'Email inválido']"
            hide-details="auto"
          />
          <v-text-field
            v-model="phone"
            label="Teléfono"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </div>

        <v-divider class="my-4" />

        <div class="inv-card__section-label">Nota interna</div>
        <v-textarea
          v-model="internalNotes"
          label="Notas administrativas (opcional)"
          variant="outlined"
          density="compact"
          rows="3"
          hide-details="auto"
          placeholder="Visible solo para ti…"
        />
      </div>

      <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mt-4">
        {{ formError }}
      </v-alert>

      <div class="inv-page__actions">
        <v-btn variant="text" to="/app/patients">Cancelar</v-btn>
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          prepend-icon="mdi-send-outline"
          :loading="saving"
        >
          Enviar invitación
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { invitePatient } from '~/services/invitationService'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const formRef = ref<any>(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const internalNotes = ref('')
const success = ref(false)
const formError = ref('')
const saving = ref(false)

async function onInvite() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return
  saving.value = true
  formError.value = ''
  try {
    await invitePatient({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      internalNotes: internalNotes.value,
    })
    success.value = true
  } catch {
    formError.value = 'No se pudo enviar la invitación. Comprueba los datos e inténtalo de nuevo.'
  } finally {
    saving.value = false
  }
}

function resetForm() {
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  phone.value = ''
  internalNotes.value = ''
  success.value = false
  formError.value = ''
  formRef.value?.reset()
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

.inv-page {
  padding: $space-5;
  max-width: 620px;

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
    margin-top: $space-4;
  }
}

.inv-card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;

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
  }
}

.inv-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: $space-8 0;

  &__msg {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    margin: $space-3 0 $space-1;
  }

  &__sub {
    font-size: $font-size-sm;
    color: $color-text-muted;
    margin: 0 0 $space-5;
  }

  &__actions {
    display: flex;
    gap: $space-3;
    align-items: center;
  }
}
</style>
