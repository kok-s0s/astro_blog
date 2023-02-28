import { defineConfig } from 'astro/config'

// https://astro.build/config
import preact from '@astrojs/preact'

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  markdown: {
    // Can be 'shiki' (default), 'prism' or false to disable highlighting
    syntaxHighlight: 'prism',
  },
})
