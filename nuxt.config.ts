// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-12-21',
  devtools: { enabled: true },

  // ssr: false,
  modules: ['@nuxt/fonts', 'vuetify-nuxt-module', '@nuxt/eslint'],

  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/styles/settings.scss' },
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: {
              primary: '#3A5A80',
              secondary: '#6BA292',
              background: '#F7F9FA',
              surface: '#FFFFFF',
              error: '#D14343',
              warning: '#F7C873',
              success: '#4BA37B',
              info: '#4A90E2',
              border: '#E0E3E8',
              divider: '#F0F1F3',
              hover: '#F2F6FA',
              'text-main': '#25324B',
              'text-secondary': '#6B7687',
              disabled: '#B0B8C9',
            },
          },
        },
      },
    },
  },

  eslint: {
    config: {
      import: {
        package: 'eslint-plugin-import-lite',
      },
    },
  },
})