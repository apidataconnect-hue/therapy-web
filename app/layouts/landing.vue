<template>
  <v-app>
    <v-main class="landing-main">
      <slot />
    </v-main>
  </v-app>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.landing-main {
  background: $color-background;
  min-height: 100vh;
}
</style>
