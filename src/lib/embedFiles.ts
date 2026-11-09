import { cpSync, existsSync, readFileSync, readdirSync, statSync, watch, type FSWatcher } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'

// Files that posts embed (lib/embeds.ts) but that live outside the markdown:
//
// - Demos, in demos/<name>/ (outside public/, on purpose). The dev server serves all of
//   them; a build copies only the ones that published entries embed, so a demo for a
//   draft doesn't go out before its post does.
// - Diagrams, in src/content/diagrams/. They're inlined when a page renders
//   (components/Diagrams.astro); in dev a changed one reloads the browser.

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const DEMOS = join(ROOT, 'demos')
const CONTENT = join(ROOT, 'src/content')
const DIAGRAMS = join(CONTENT, 'diagrams')

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.name.endsWith('.md') ? [path] : []
  })
}

/** Names of the demos embedded by entries that aren't drafts. */
function publishedDemos(): Set<string> {
  const names = new Set<string>()
  for (const file of markdownFiles(CONTENT)) {
    const text = readFileSync(file, 'utf8')
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
    if (/^draft:\s*true\s*$/m.test(frontmatter)) continue
    for (const fence of text.matchAll(/```demo\n([\s\S]*?)```/g)) {
      const src = fence[1].match(/^\s*src\s*:\s*([\w-]+)/m)?.[1]
      if (src) names.add(src)
    }
  }
  return names
}

let diagramWatcher: FSWatcher | undefined

export function embedFiles(): AstroIntegration {
  return {
    name: 'blog-embeds',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        // Watched directly: Vite's watcher doesn't report this folder's changes. One
        // watcher at a time, since config reloads run this hook again.
        diagramWatcher?.close()
        let pending: ReturnType<typeof setTimeout> | undefined
        diagramWatcher = watch(DIAGRAMS, () => {
          // Editors fire a few events per save; act once.
          clearTimeout(pending)
          pending = setTimeout(() => {
            logger.info('diagram changed, reloading')
            server.ws.send({ type: 'full-reload' })
          }, 100)
        })
        server.middlewares.use((req, res, next) => {
          const url = decodeURIComponent((req.url ?? '').split('?')[0])
          if (!url.startsWith('/demos/')) return next()
          let path = normalize(join(DEMOS, url.slice('/demos/'.length)))
          if (!path.startsWith(DEMOS)) return next()
          if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html')
          if (!existsSync(path)) return next()
          res.setHeader('Content-Type', TYPES[extname(path)] ?? 'application/octet-stream')
          res.end(readFileSync(path))
        })
      },
      'astro:build:done': ({ dir, logger }) => {
        const out = resolve(fileURLToPath(dir), 'demos')
        const names = publishedDemos()
        for (const name of names) cpSync(join(DEMOS, name), join(out, name), { recursive: true })
        if (names.size > 0) cpSync(join(DEMOS, 'embed.js'), join(out, 'embed.js'))
        logger.info(names.size ? `copied ${[...names].join(', ')}` : 'no published demos')
      },
    },
  }
}
