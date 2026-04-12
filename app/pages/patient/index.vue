<template>
  <div class="home">
    <!-- Background illustration -->
    <svg class="home__bg-svg" aria-hidden="true" viewBox="0 0 860 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g opacity="0.07" fill="none" stroke="#5B2A86" stroke-width="2">
        <path d="M160 240 C140 200 100 190 90 220 C75 260 100 290 130 280 C120 310 100 325 110 350 C125 380 160 375 170 355 C175 370 170 395 190 400 C215 405 230 380 220 360 C240 370 260 360 260 335 C260 315 245 300 230 305 C245 275 240 245 220 235 C200 225 178 235 160 240Z"/>
        <line x1="130" y1="280" x2="170" y2="355"/>
        <line x1="170" y1="355" x2="220" y2="360"/>
        <line x1="160" y1="240" x2="220" y2="235"/>
        <circle cx="130" cy="280" r="4" fill="#5B2A86"/>
        <circle cx="170" cy="355" r="4" fill="#5B2A86"/>
        <circle cx="220" cy="360" r="4" fill="#5B2A86"/>
        <circle cx="160" cy="240" r="4" fill="#5B2A86"/>
        <circle cx="220" cy="235" r="4" fill="#5B2A86"/>
      </g>
      <polyline opacity="0.09" fill="none" stroke="#9AC6C5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        points="520,80 560,80 575,50 592,115 610,40 628,110 645,80 700,80 730,80"/>
      <g opacity="0.08" fill="#9AC6C5" transform="translate(710,520)">
        <ellipse cx="0" cy="-28" rx="12" ry="28" transform="rotate(0)"/>
        <ellipse cx="0" cy="-28" rx="12" ry="28" transform="rotate(45)"/>
        <ellipse cx="0" cy="-28" rx="12" ry="28" transform="rotate(90)"/>
        <ellipse cx="0" cy="-28" rx="12" ry="28" transform="rotate(135)"/>
        <ellipse cx="0" cy="-28" rx="12" ry="28" transform="rotate(180)"/>
        <ellipse cx="0" cy="-28" rx="12" ry="28" transform="rotate(225)"/>
        <ellipse cx="0" cy="-28" rx="12" ry="28" transform="rotate(270)"/>
        <ellipse cx="0" cy="-28" rx="12" ry="28" transform="rotate(315)"/>
        <circle cx="0" cy="0" r="10"/>
      </g>
      <path opacity="0.07" fill="none" stroke="#5B2A86" stroke-width="2.5"
        d="M180 640 C180 610 210 595 235 610 C260 625 260 655 235 670 C210 685 180 670 180 640 C180 610 150 595 125 610 C100 625 100 655 125 670 C150 685 180 670 180 640Z"/>
      <g opacity="0.07" fill="none" stroke="#5B2A86" stroke-width="2" transform="translate(610,600)">
        <rect x="0" y="0" width="90" height="60" rx="12"/>
        <polyline points="20,60 10,80 40,60"/>
        <line x1="15" y1="22" x2="75" y2="22"/>
        <line x1="15" y1="38" x2="60" y2="38"/>
      </g>
      <g opacity="0.1" fill="#9AC6C5">
        <circle cx="400" cy="30" r="4"/>
        <circle cx="430" cy="52" r="2.5"/>
        <circle cx="415" cy="72" r="3.5"/>
        <circle cx="80" cy="460" r="3"/>
        <circle cx="100" cy="480" r="2"/>
        <circle cx="760" cy="360" r="3.5"/>
        <circle cx="790" cy="380" r="2"/>
        <circle cx="775" cy="345" r="2.5"/>
      </g>
      <path opacity="0.08" fill="#9AC6C5"
        d="M750 760 C750 710 790 690 810 710 C830 730 810 780 750 790 C750 790 755 775 750 760Z"/>
      <line opacity="0.09" stroke="#9AC6C5" stroke-width="1.5" x1="750" y1="790" x2="750" y2="750"/>
    </svg>

    <!-- Hero -->
    <section class="home__hero">
      <div class="home__hero-content">
        <span class="home__hero-badge">
          <v-icon icon="mdi-heart-pulse" size="13" />
          Tu espacio terapéutico digital
        </span>
        <h1 class="home__hero-title">Bienvenido/a a<br /><span class="home__hero-accent">TherapyWeb</span></h1>
        <p class="home__hero-sub">Un lugar seguro para acompañar tu proceso de bienestar, a tu ritmo.</p>
      </div>
      <div class="home__hero-visual" aria-hidden="true">
        <div class="home__blob home__blob--1" />
        <div class="home__blob home__blob--2" />
        <v-icon icon="mdi-leaf" size="80" class="home__hero-icon" />
      </div>
    </section>

    <!-- Content zones — future therapist-managed content -->
    <section class="home__zones">
      <!-- Zone 1: Mensaje de bienvenida -->
      <article class="zone zone--accent-left">
        <div class="zone__label">Mensaje de tu terapeuta</div>
        <h2 class="zone__title">Un espacio para ti</h2>
        <p class="zone__body">
          Aquí encontrarás información, recursos y mensajes personalizados que tu terapeuta irá
          compartiendo contigo a lo largo de tu proceso. Este es tu espacio, y está pensado para
          acompañarte más allá de las sesiones.
        </p>
      </article>

      <!-- Zone 2: Recurso destacado -->
      <article class="zone zone--card-row">
        <div class="zone__label">Recurso destacado</div>
        <h2 class="zone__title">Práctica entre sesiones</h2>
        <p class="zone__body">
          Pequeños ejercicios y reflexiones para continuar el trabajo terapéutico en tu día a día.
          Tu terapeuta podrá añadir aquí tareas, lecturas recomendadas o ejercicios de mindfulness
          adaptados a tu proceso.
        </p>
        <div class="zone__tags">
          <span class="zone__tag">Mindfulness</span>
          <span class="zone__tag">Autorregistro</span>
          <span class="zone__tag">Respiración</span>
        </div>
      </article>

      <!-- Zone 3: Próximo objetivo -->
      <article class="zone zone--highlight">
        <div class="zone__icon-wrap">
          <v-icon icon="mdi-flag-outline" size="24" color="#5B2A86" />
        </div>
        <div>
          <div class="zone__label">Objetivo del proceso</div>
          <h2 class="zone__title">Tu foco actual</h2>
          <p class="zone__body">
            Tu terapeuta podrá definir aquí los objetivos terapéuticos de la etapa en curso, para
            que puedas tenerlos presentes y hacer un seguimiento conjunto de tu evolución.
          </p>
        </div>
      </article>

      <!-- Zone 4: Notas y reflexiones -->
      <article class="zone zone--soft">
        <div class="zone__label">Reflexiones</div>
        <h2 class="zone__title">¿Cómo te has sentido esta semana?</h2>
        <p class="zone__body">
          El espacio de reflexiones te permitirá llevar un registro de tu estado emocional y
          compartirlo con tu terapeuta antes de las sesiones. Próximamente disponible.
        </p>
        <span class="zone__coming-soon">Próximamente</span>
      </article>
    </section>

    <!-- Footer info strip -->
    <footer class="home__footer">
      <div class="home__footer-card">
        <v-icon icon="mdi-shield-lock-outline" size="20" color="#1A7A8A" />
        <div>
          <strong>Privacidad y confidencialidad</strong>
          <span>Toda tu información está protegida y es estrictamente confidencial.</span>
        </div>
      </div>
      <div class="home__footer-card">
        <v-icon icon="mdi-calendar-heart" size="20" color="#5B2A86" />
        <div>
          <strong>Gestiona tus citas</strong>
          <span>Consulta y revisa tus sesiones en cualquier momento.</span>
        </div>
      </div>
      <div class="home__footer-card">
        <v-icon icon="mdi-hand-heart-outline" size="20" color="#C77B2C" />
        <div>
          <strong>Tu bienestar, nuestra prioridad</strong>
          <span>Estamos aquí para acompañarte en cada paso del proceso.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'patient', middleware: ['auth', 'role'], role: 'PATIENT' })
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

/* ── Page wrapper ────────────────────────────────────────────── */
.home {
  position: relative;
  max-width: 860px;
  margin: 0 auto;
  padding: $space-5 $space-5 0;
  overflow: hidden;
}

/* ── Background SVG ─────────────────────────────────────────── */
.home__bg-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ── Hero ────────────────────────────────────────────────────── */
.home__hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f2ebf9 0%, #e4f5f4 100%);
  border-radius: $radius-xl;
  padding: $space-7 $space-7;
  margin-bottom: $space-6;
  overflow: hidden;
  min-height: 180px;
}

.home__hero-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
}

.home__hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $color-primary;
  background: rgba(91, 42, 134, 0.08);
  border-radius: 999px;
  padding: 4px 10px;
  margin-bottom: $space-3;
}

.home__hero-title {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: $font-weight-bold;
  color: $color-text-main;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 $space-3;
}

.home__hero-accent {
  color: $color-primary;
}

.home__hero-sub {
  font-size: $font-size-base;
  color: $color-text-secondary;
  margin: 0;
  line-height: 1.6;
}

.home__hero-visual {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home__hero-icon {
  position: relative;
  z-index: 1;
  opacity: 0.25;
  color: $color-primary;
}

.home__blob {
  position: absolute;
  border-radius: 50%;
}
.home__blob--1 {
  width: 100px;
  height: 100px;
  background: rgba(91, 42, 134, 0.12);
  top: 5px; left: 5px;
}
.home__blob--2 {
  width: 70px;
  height: 70px;
  background: rgba(154, 198, 197, 0.25);
  bottom: 0; right: 0;
}

/* ── Zones ───────────────────────────────────────────────────── */
.home__zones {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  margin-bottom: $space-6;
}

.zone {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  box-shadow: $shadow-xs;
}

.zone__label {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: $color-text-muted;
  margin-bottom: $space-2;
}

.zone__title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  margin: 0 0 $space-2;
}

.zone__body {
  font-size: $font-size-base;
  color: $color-text-secondary;
  line-height: 1.7;
  margin: 0;
}

/* accent-left: colored left border */
.zone--accent-left {
  border-left: 4px solid $color-primary;
}

/* card-row: tags */
.zone--card-row {
  border-left: 4px solid $color-secondary;
}

.zone__tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin-top: $space-3;
}

.zone__tag {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: #1A7A8A;
  background: #e4f5f4;
  border-radius: 999px;
  padding: 3px 10px;
}

/* highlight: icon + text side by side */
.zone--highlight {
  display: flex;
  gap: $space-4;
  align-items: flex-start;
  background: #f9f4ff;
  border: 1px solid rgba(91, 42, 134, 0.15);
}

.zone__icon-wrap {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: rgba(91, 42, 134, 0.08);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

/* soft: muted look */
.zone--soft {
  background: #fafafa;
}

.zone__coming-soon {
  display: inline-block;
  margin-top: $space-3;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #C77B2C;
  background: #fff4e5;
  border-radius: 999px;
  padding: 3px 10px;
}

/* ── Footer strip ────────────────────────────────────────────── */
.home__footer {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  border-top: 1px solid $color-border;
  padding: $space-5 0 $space-6;
}

.home__footer-card {
  display: flex;
  align-items: flex-start;
  gap: $space-3;
  padding: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;

  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
  }

  span {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    line-height: 1.5;
  }
}

@media (min-width: 640px) {
  .home__footer {
    flex-direction: row;
  }
  .home__footer-card {
    flex: 1;
  }
}
</style>
