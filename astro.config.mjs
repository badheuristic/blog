// @ts-check
import { satteri } from '@astrojs/markdown-satteri'
import sitemap from '@astrojs/sitemap'
import { defineConfig, passthroughImageService } from 'astro/config'
import { config } from './src/config.ts'
import { codeDark, codeLight } from './src/lib/codeThemes.ts'
import { embedFiles } from './src/lib/embedFiles.ts'
import { embeds } from './src/lib/embeds.ts'

// Sharp optimizes images wherever it loads. On this NixOS machine its binary can't find
// libstdc++, so images go out as they are instead of failing the build.
const sharpLoads = await import('sharp').then(
  () => true,
  () => false,
)

export default defineConfig({
  site: config.url,
  integrations: [sitemap(), embedFiles()],
  image: sharpLoads ? {} : { service: passthroughImageService() },
  markdown: {
    // Captioned images, ```demo and ```diagram fences.
    processor: satteri({ mdastPlugins: [embeds] }),
    shikiConfig: {
      themes: { light: codeLight, dark: codeDark },
      // No inline colors: prose.css chooses between --shiki-light and --shiki-dark.
      defaultColor: false,
      wrap: false,
    },
  },
})
