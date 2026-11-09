import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Code } from 'mdast'
import { defineMdastPlugin } from 'satteri'

// Markdown extras for posts, without moving to MDX (a Sätteri plugin, Astro 7's
// markdown processor):
//
//   ![alt](./photo.png "Caption")      an image with a title becomes a captioned figure
//
//   ```demo                            an interactive page from demos/<src>/, in a frame
//   src: hub-location                  that follows the theme and grows to fit
//   caption: The validation job, simulated
//   height: 900                        (optional) starting height before it reports in
//   ```
//
//   ```diagram                         an SVG from src/content/diagrams/<src>.svg, inlined
//   src: hub-architecture              (components/Diagrams.astro) so its fills follow the
//                                      theme tokens
//   caption: Where it's heading
//   ```
//
// Demos and diagrams are wide: they reach left past the text column (prose.css).

const DIAGRAMS = fileURLToPath(new URL('../content/diagrams/', import.meta.url))

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** `key: value` lines, as written inside a demo or diagram fence. */
function fields(code: Code): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of code.value.split('\n')) {
    const match = line.match(/^\s*([a-z]+)\s*:\s*(.*?)\s*$/i)
    if (match) out[match[1].toLowerCase()] = match[2]
  }
  return out
}

const caption = (text: string | undefined, extra = '') =>
  text || extra ? `<figcaption>${text ? escape(text) : ''}${extra}</figcaption>` : ''

function demo(code: Code): string {
  const { src, caption: text, height = '720' } = fields(code)
  if (!src || !/^[\w-]+$/.test(src)) throw new Error(`demo fence needs a src (a folder in demos/), got "${src}"`)
  const url = `/demos/${src}/`
  const open = `<a class="open" href="${url}" target="_blank" rel="noopener">open on its own <span aria-hidden="true">↗</span></a>`
  return (
    `<figure class="wide demo">` +
    `<iframe src="${url}" title="${escape(text ?? src)}" loading="lazy" style="height:${Number(height) || 720}px" data-demo></iframe>` +
    caption(text, open) +
    `</figure>`
  )
}

function diagram(code: Code): string {
  const { src, caption: text } = fields(code)
  if (!src || !/^[\w-]+$/.test(src)) throw new Error(`diagram fence needs a src (an SVG in src/content/diagrams/), got "${src}"`)
  if (!existsSync(`${DIAGRAMS}${src}.svg`)) throw new Error(`no diagram at src/content/diagrams/${src}.svg`)
  // The SVG goes in when the page renders (components/Diagrams.astro), not here: Astro
  // caches rendered markdown by the post's own text and wouldn't notice a changed SVG.
  return `<figure class="wide diagram"><div class="diagramScroll" data-diagram="${src}"></div>${caption(text)}</figure>`
}

export const embeds = defineMdastPlugin({
  name: 'blog-embeds',
  code(node, ctx) {
    if (node.lang === 'demo') ctx.replaceNode(node, { type: 'html', value: demo(node) })
    else if (node.lang === 'diagram') ctx.replaceNode(node, { type: 'html', value: diagram(node) })
  },
  // A paragraph holding just one image with a title: <figure><img><figcaption>. The
  // image node stays, so Astro still optimizes local images.
  paragraph(node, ctx) {
    const [image] = node.children
    if (node.children.length !== 1 || image.type !== 'image' || !image.title) return
    const text = image.title
    ctx.setProperty(image, 'title', null)
    ctx.setProperty(node, 'data', { hName: 'figure' })
    ctx.appendChild(node, { type: 'html', value: `<figcaption>${escape(text)}</figcaption>` })
  },
})
