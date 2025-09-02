// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/mdc',
    '@pinia/nuxt',
    'nuxt-auth-utils',
  ],

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    highlight: {
      shikiEngine: 'javascript',
    },
  },

  ui: {
    fonts: false,
    theme: {
      colors: ['primary', 'success', 'info', 'warning', 'error'],
    },
  },

  compatibilityDate: '2025-05-01',

  typescript: {
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
  },

  debug: {
    hydration: true,
  },

  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
})
