<template>
  <div class="login-page">
    <div class="login-card-wrap">
      <!-- Branding -->
      <div class="login-brand">
        <div class="login-brand__logo">
          <v-icon icon="mdi-heart-pulse" color="white" size="22" />
        </div>
        <span class="login-brand__name">TherapyWeb</span>
      </div>

      <!-- Loading -->
      <v-card v-if="loading" class="login-card" elevation="0">
        <div class="login-card__header">
          <v-progress-circular indeterminate color="primary" />
          <p class="login-card__subtitle mt-4">Cargando invitación...</p>
        </div>
      </v-card>

      <!-- Error -->
      <v-card v-else-if="error" class="login-card" elevation="0">
        <div class="login-card__header">
          <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-3" />
          <h1 class="login-card__title">Invitación no válida</h1>
          <p class="login-card__subtitle">{{ error }}</p>
        </div>
        <v-btn color="primary" size="large" block rounded="md" to="/login">
          Ir a iniciar sesión
        </v-btn>
      </v-card>

      <!-- Linked (existing account) -->
      <v-card v-else-if="linked" class="login-card" elevation="0">
        <div class="login-card__header">
          <v-icon icon="mdi-check-circle-outline" size="48" color="success" class="mb-3" />
          <h1 class="login-card__title">Terapeuta vinculado</h1>
          <p class="login-card__subtitle">Se ha vinculado este terapeuta a tu cuenta. Ya puedes acceder a tu portal.</p>
        </div>
        <v-btn color="primary" size="large" block rounded="md" to="/login">
          Ir al portal
        </v-btn>
      </v-card>

      <!-- Registration form -->
      <v-card v-else class="login-card" elevation="0">
        <div class="login-card__header">
          <h1 class="login-card__title">Completa tu registro</h1>
          <p class="login-card__subtitle">Hola {{ invitation?.email }}, crea una contraseña para acceder.</p>
        </div>

        <v-form class="login-card__form" @submit.prevent="onAccept">
          <v-text-field
            v-model="password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            autocomplete="new-password"
            required
            :error-messages="passwordError"
            @click:append-inner="showPassword = !showPassword"
            @input="passwordError = ''"
          />

          <v-text-field
            v-model="passwordConfirm"
            label="Confirmar contraseña"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-check-outline"
            autocomplete="new-password"
            required
            :error-messages="confirmError"
            @input="confirmError = ''"
          />

          <v-alert
            v-if="submitError"
            type="error"
            variant="tonal"
            rounded="md"
            density="compact"
            class="mb-4"
          >
            {{ submitError }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            rounded="md"
            :loading="accepting"
          >
            Aceptar invitación
          </v-btn>
        </v-form>
      </v-card>

      <!-- Back -->
      <div class="login-back">
        <NuxtLink to="/login" class="login-back__link">
          <v-icon icon="mdi-arrow-left" size="14" />
          Ya tengo cuenta
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { getInvitationByToken, acceptInvitation } from '~/services/invitationService'
import { getProfiles } from '~/services/patientPortalService'

definePageMeta({ layout: false })

const route = useRoute()
const auth = useAuthStore()
const token = route.params.token as string

const invitation = ref<any>(null)
const loading = ref(true)
const error = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const passwordError = ref('')
const confirmError = ref('')
const submitError = ref('')
const accepting = ref(false)
const linked = ref(false)

onMounted(async () => {
  try {
    invitation.value = await getInvitationByToken(token)
    if (invitation.value.status !== 'PENDING') {
      error.value = 'Esta invitación ya fue utilizada, cancelada o expirada.'
    }
  } catch {
    error.value = 'Invitación no válida o expirada.'
  } finally {
    loading.value = false
  }
})

async function onAccept() {
  passwordError.value = ''
  confirmError.value = ''
  submitError.value = ''

  if (!password.value || password.value.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }
  if (password.value !== passwordConfirm.value) {
    confirmError.value = 'Las contraseñas no coinciden.'
    return
  }

  accepting.value = true
  try {
    const result = await acceptInvitation(token, { password: password.value })

    // Auto-login if backend returns auth tokens
    if (result?.token && result?.user) {
      auth.setAuth(result.user, result.token, result.refreshToken)
      try {
        const profiles = await getProfiles()
        if (profiles.length === 1) {
          auth.setProfileId(profiles[0].id)
          await navigateTo('/app/dashboard')
        } else {
          await navigateTo('/app/select-profile')
        }
      } catch {
        await navigateTo('/app/dashboard')
      }
    } else {
      // Existing account — just linked the therapist
      linked.value = true
    }
  } catch (e: any) {
    submitError.value = e?.response?.data?.message || 'No se pudo aceptar la invitación.'
  } finally {
    accepting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-background;
  padding: $space-5;
}

.login-card-wrap {
  width: 100%;
  max-width: 440px;
}

.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  margin-bottom: $space-6;
}

.login-brand__logo {
  width: 40px;
  height: 40px;
  background: $color-primary;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-brand__name {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  letter-spacing: -0.01em;
}

.login-card {
  padding: $space-6;
  border: 1px solid $color-border !important;
  border-radius: $radius-xl !important;
  box-shadow: $shadow-md !important;
  background: $color-surface;
}

.login-card__header {
  text-align: center;
  margin-bottom: $space-6;
}

.login-card__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  letter-spacing: -0.01em;
  margin-bottom: $space-1;
}

.login-card__subtitle {
  font-size: $font-size-base;
  color: $color-text-secondary;
  margin: 0;
}

.login-card__form {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.login-back {
  text-align: center;
  margin-top: $space-4;
}

.login-back__link {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  text-decoration: none;
  transition: color $transition-fast;

  &:hover { color: $color-primary; }
}
</style>
