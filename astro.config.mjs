// @ts-check
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { config } from './src/config.ts'
import { codeDark, codeLight } from './src/lib/codeThemes.ts'

export default defineConfig({
  site: config.url,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: codeLight, dark: codeDark },
      // No inline colors: prose.css chooses between --shiki-light and --shiki-dark.
      defaultColor: false,
      wrap: false,
    },
  },
})
