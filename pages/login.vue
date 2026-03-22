<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title>Iniciar sesión</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onLogin">
              <v-text-field v-model="email" label="Email" type="email" required />
              <v-text-field v-model="password" label="Contraseña" type="password" required />
              <v-btn type="submit" color="primary" block>Entrar</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { login } from '~/services/authService'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()

async function onLogin() {
  try {
    const { user, token } = await login(email.value, password.value)
    auth.setAuth(user, token)
    router.push('/app/dashboard')
  } catch (e) {
    // TODO: mostrar error
    alert('Credenciales incorrectas')
  }
}
</script>
