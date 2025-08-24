// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/mdc',
    '@pinia/nuxt',
  ],

  devtools: {
    enabled: false,
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    highlight: {
      shikiEngine: 'javascript',
    },
  },

  routeRules: {
    '*': {
      prerender: false,
      cache: false,
    },
  },

  compatibilityDate: '2025-05-01',

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
