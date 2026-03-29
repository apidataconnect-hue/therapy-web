

<template>
  <div class="landing">
    <!-- Navbar -->
    <header class="landing-nav">
      <div class="landing-nav__brand">
        <v-icon icon="mdi-heart-pulse" color="primary" size="24" />
        <span class="landing-nav__name">TherapyWeb</span>
      </div>
      <NuxtLink to="/login">
        <v-btn variant="outlined" color="primary" rounded="md">Iniciar sesión</v-btn>
      </NuxtLink>
    </header>

    <!-- Hero -->
    <section class="landing-hero">
      <v-container class="landing-hero__container">
        <v-row align="center" justify="center">
          <v-col cols="12" md="7" lg="6">
            <div class="landing-hero__badge">
              <v-icon icon="mdi-shield-check-outline" size="14" />
              Plataforma profesional de salud mental
            </div>
            <h1 class="landing-hero__title">
              Gestiona tus terapias<br />
              <span class="landing-hero__accent">con claridad y orden</span>
            </h1>
            <p class="landing-hero__text">
              Un espacio digital calmado y profesional para terapeutas y pacientes.
              Sesiones, calendarios y seguimiento en un solo lugar.
            </p>
            <div class="landing-hero__actions">
              <NuxtLink to="/login">
                <v-btn color="primary" size="large" rounded="md" min-width="160">
                  <v-icon start icon="mdi-login-variant" />
                  Iniciar sesión
                </v-btn>
              </NuxtLink>
            </div>
          </v-col>
          <v-col cols="12" md="5" lg="5" class="d-none d-md-flex justify-end">
            <div class="landing-hero__illustration">
              <v-icon icon="mdi-heart-pulse" size="120" class="landing-hero__icon" />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Roles -->
    <section class="landing-roles">
      <v-container>
        <v-row justify="center" class="ga-4">
          <!-- Terapeuta -->
          <v-col cols="12" sm="6" md="5">
            <v-card class="role-card role-card--therapist" @click="$router.push('/login')">
              <div class="role-card__icon-wrap">
                <v-icon icon="mdi-stethoscope" size="32" />
              </div>
              <div class="role-card__content">
                <h3 class="role-card__title">Soy Terapeuta</h3>
                <p class="role-card__text">
                  Gestiona pacientes, agenda sesiones, crea terapias y revisa el historial desde un panel completo.
                </p>
                <div class="role-card__features">
                  <span v-for="f in therapistFeatures" :key="f" class="role-card__feature">
                    <v-icon icon="mdi-check" size="13" />{{ f }}
                  </span>
                </div>
              </div>
              <v-icon icon="mdi-arrow-right" class="role-card__arrow" />
            </v-card>
          </v-col>

          <!-- Paciente -->
          <v-col cols="12" sm="6" md="5">
            <v-card class="role-card role-card--patient" @click="$router.push('/login')">
              <div class="role-card__icon-wrap">
                <v-icon icon="mdi-account-heart-outline" size="32" />
              </div>
              <div class="role-card__content">
                <h3 class="role-card__title">Soy Paciente</h3>
                <p class="role-card__text">
                  Consulta tus sesiones, terapias asignadas y calendario de citas en un espacio privado y seguro.
                </p>
                <div class="role-card__features">
                  <span v-for="f in patientFeatures" :key="f" class="role-card__feature">
                    <v-icon icon="mdi-check" size="13" />{{ f }}
                  </span>
                </div>
              </div>
              <v-icon icon="mdi-arrow-right" class="role-card__arrow" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <v-icon icon="mdi-heart-pulse" size="16" color="primary" />
      <span>TherapyWeb &copy; {{ new Date().getFullYear() }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const therapistFeatures = ['Gestión de pacientes', 'Agenda interactiva', 'Historial de sesiones', 'Seguimiento de terapias']
const patientFeatures   = ['Ver mis sesiones', 'Calendario de citas', 'Acceso a terapias', 'Perfil personal']
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $color-background;
  font-family: $font-family;
}

// ─ Navbar
.landing-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4 $space-6;
  background: $color-surface;
  border-bottom: 1px solid $color-divider;
  position: sticky;
  top: 0;
  z-index: 100;
}

.landing-nav__brand {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.landing-nav__name {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  letter-spacing: -0.01em;
}

// ─ Hero
.landing-hero {
  flex: 1;
  padding: $space-8 0;
}

.landing-hero__container {
  max-width: 960px;
}

.landing-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  background: $color-primary-subtle;
  color: $color-primary;
  border-radius: $radius-full;
  padding: 4px $space-3;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: $space-5;
}

.landing-hero__title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: $font-weight-bold;
  color: $color-text-main;
  line-height: $line-height-tight;
  letter-spacing: -0.02em;
  margin-bottom: $space-4;
}

.landing-hero__accent {
  color: $color-primary;
}

.landing-hero__text {
  font-size: $font-size-lg;
  color: $color-text-secondary;
  line-height: $line-height-normal;
  max-width: 520px;
  margin-bottom: $space-6;
}

.landing-hero__actions {
  display: flex;
  gap: $space-3;
  align-items: center;
}

.landing-hero__illustration {
  width: 280px;
  height: 280px;
  background: $color-primary-subtle;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.landing-hero__icon {
  color: $color-primary;
  opacity: 0.35;
}

// ─ Roles
.landing-roles {
  padding: $space-7 0 $space-8;
  background: $color-surface;
  border-top: 1px solid $color-divider;
}

.role-card {
  display: flex;
  flex-direction: column;
  padding: $space-5;
  height: 100%;
  cursor: pointer;
  transition: box-shadow $transition-normal, transform $transition-normal;
  position: relative;

  &:hover {
    box-shadow: $shadow-md !important;
    transform: translateY(-2px);
  }

  &--therapist .role-card__icon-wrap {
    background: $color-therapist-subtle;
    color: $color-therapist;
  }

  &--patient .role-card__icon-wrap {
    background: $color-patient-subtle;
    color: $color-patient;
  }
}

.role-card__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-4;
}

.role-card__content { flex: 1; }

.role-card__title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  margin-bottom: $space-2;
}

.role-card__text {
  font-size: $font-size-base;
  color: $color-text-secondary;
  line-height: $line-height-normal;
  margin-bottom: $space-4;
}

.role-card__features {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.role-card__feature {
  display: flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-sm;
  color: $color-text-secondary;

  .v-icon { color: $color-success; }
}

.role-card__arrow {
  position: absolute;
  top: $space-5;
  right: $space-5;
  color: $color-text-muted;
}

// ─ Footer
.landing-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  padding: $space-4;
  font-size: $font-size-sm;
  color: $color-text-muted;
  border-top: 1px solid $color-divider;
  background: $color-surface;
}
</style>
