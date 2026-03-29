<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title>Aceptar invitación</v-card-title>
          <v-card-text>
            <div v-if="loading">Cargando invitación...</div>
            <div v-else-if="error">
              <v-alert type="error" border="left" prominent>{{ error }}</v-alert>
            </div>
            <div v-else-if="success">
              <v-alert type="success" border="left" prominent>
                ¡Invitación aceptada! Ya puedes iniciar sesión con tu nueva contraseña.
              </v-alert>
              <v-btn color="primary" block @click="goToLogin">Ir a login</v-btn>
            </div>
            <div v-else>
              <div>Hola {{ invitation?.email }}, completa tu registro:</div>
              <v-form @submit.prevent="onAccept">
                <v-text-field v-model="password" label="Contraseña" type="password" :error-messages="passwordError" required />
                <v-btn type="submit" color="primary" block :loading="accepting">Aceptar invitación</v-btn>
              </v-form>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInvitationByToken, acceptInvitation } from '~/services/invitationService'

const route = useRoute()
const router = useRouter()
const token = route.params.token as string

const invitation = ref<any>(null)
const loading = ref(true)
const error = ref('')
const password = ref('')
const passwordError = ref('')
const success = ref(false)
const accepting = ref(false)


onMounted(async () => {
  try {
    invitation.value = await getInvitationByToken(token)
    if (invitation.value.status !== 'PENDING') {
      error.value = 'Esta invitación ya fue utilizada, cancelada o expirada.'
    }
  } catch (e) {
    error.value = 'Invitación no válida o expirada.'
  } finally {
    loading.value = false
  }
})


function validatePassword(pw: string): string {
  if (!pw || pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  // Puedes añadir más validaciones aquí
  return ''
}

async function onAccept() {
  passwordError.value = validatePassword(password.value)
  if (passwordError.value) return
  accepting.value = true
  try {
    await acceptInvitation(token, { password: password.value })
    success.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'No se pudo aceptar la invitación.'
  } finally {
    accepting.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>
