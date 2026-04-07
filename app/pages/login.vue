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

      <!-- Card -->
      <v-card class="login-card" elevation="0">
        <div class="login-card__header">
          <h1 class="login-card__title">Bienvenido de nuevo</h1>
          <p class="login-card__subtitle">Introduce tus credenciales para acceder</p>
        </div>

        <v-form class="login-card__form" @submit.prevent="onLogin">
          <v-text-field
            v-model="email"
            label="Correo electrónico"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            autocomplete="email"
            required
            :error-messages="emailError"
            @input="emailError = ''"
          />

          <v-text-field
            v-model="password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            autocomplete="current-password"
            required
            :error-messages="passwordError"
            @click:append-inner="showPassword = !showPassword"
            @input="passwordError = ''"
          />

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            rounded="md"
            density="compact"
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            rounded="md"
            :loading="loading"
          >
            Iniciar sesión
          </v-btn>
        </v-form>
      </v-card>

      <!-- Volver -->
      <div class="login-back">
        <NuxtLink to="/" class="login-back__link">
          <v-icon icon="mdi-arrow-left" size="14" />
          Volver al inicio
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { login } from '~/services/authService'

definePageMeta({ layout: false })

const email         = ref('')
const password      = ref('')
const showPassword  = ref(false)
const loading       = ref(false)
const errorMessage  = ref('')
const emailError    = ref('')
const passwordError = ref('')
const auth   = useAuthStore()

async function onLogin() {
  errorMessage.value = ''
  if (!email.value)    { emailError.value = 'Introduce tu correo'; return }
  if (!password.value) { passwordError.value = 'Introduce tu contraseña'; return }

  loading.value = true
  try {
    const { user, token, refreshToken, profiles } = await login(email.value, password.value)
    auth.setAuth(user, token, refreshToken)

    if (auth.isPatient && profiles) {
      if (profiles.length === 1) {
        auth.setProfileId(profiles[0].id)
        await navigateTo('/app/dashboard')
      } else {
        await navigateTo('/app/select-profile')
      }
    } else {
      await navigateTo('/app/dashboard')
    }
  } catch {
    errorMessage.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
  } finally {
    loading.value = false
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
