// Link preview images (Open Graph), 1200×630, drawn at build time. Satori lays the card
// out as SVG and resvg (its WebAssembly build, so it runs anywhere) turns that into a
// PNG. The card is the blog in light mode: the logo, the title in light type, a muted
// meta line, the section's word faint at the bottom left, and a few squares.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import satori from 'satori'

export const WIDTH = 1200
export const HEIGHT = 630

// Light theme tokens (src/styles/tokens.css).
const BG = '#ffffff'
const FG = '#000000'
const MUTED = '#7a7a7a'
const FAINT = '#dcdcdc'
const TITLE_FAINT = '#ededed'
const PARTICLE = 'rgba(0, 0, 0, 0.13)'
const PAD = 72

// Satori reads woff but not woff2, so the fonts come from @fontsource rather than the
// site's subsets. Read relative to the project, as the build runs from a copy elsewhere.
const fontsource = (file: string) =>
  readFileSync(join(process.cwd(), 'node_modules/@fontsource/iosevka-aile/files', file))

const fonts = ([300, 400, 500] as const).map((weight) => ({
  name: 'Iosevka Aile',
  data: fontsource(`iosevka-aile-latin-${weight}-normal.woff`),
  weight,
  style: 'normal' as const,
}))

// resvg's WebAssembly can only be set up once per process, and in dev this module is
// reloaded on every edit while resvg stays loaded, so the setup is kept on globalThis.
const shared = globalThis as typeof globalThis & { blogResvg?: Promise<void> }
const setup = () =>
  (shared.blogResvg ??= initWasm(readFileSync(join(process.cwd(), 'node_modules/@resvg/resvg-wasm/index_bg.wasm'))))

type Node = { type: string; props: Record<string, unknown> }
const h = (type: string, props: Record<string, unknown>, ...children: unknown[]): Node => {
  const kids = children.filter((child) => child !== false && child != null)
  return { type, props: { ...props, children: kids.length === 1 ? kids[0] : kids } }
}

/** The logo, drawn as on the site: ch{✱} with the star as three lines. */
const logo = () =>
  h(
    'div',
    { style: { display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 500 } },
    'ch',
    h('span', { style: { fontWeight: 300, color: MUTED } }, '{'),
    h(
      'svg',
      { width: 24, height: 24, viewBox: '-10 -10 20 20', style: { margin: '0 4px' } },
      ...[0, 60, 120].map((deg) =>
        h('line', { x1: 0, y1: -9, x2: 0, y2: 9, stroke: FG, 'stroke-width': 3.4, transform: `rotate(${deg})` }),
      ),
    ),
    h('span', { style: { fontWeight: 300, color: MUTED } }, '}'),
  )

/** A few squares in the empty bottom right, placed from the title so each card differs. */
function particles(seed: string) {
  let n = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const next = () => ((n = (n * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return Array.from({ length: 7 }, () => {
    const size = 6 + Math.round(next() * 10)
    return h('div', {
      style: {
        position: 'absolute',
        left: 680 + next() * (WIDTH - 680 - PAD),
        top: 470 + next() * (HEIGHT - 470 - PAD),
        width: size,
        height: size,
        background: PARTICLE,
      },
    })
  })
}

interface Card {
  title: string
  /** The faint word at the bottom left: `blog` or `diary`. */
  backdrop: string
  /** Muted bits under the title, separated by squares. */
  meta?: string[]
}

export async function ogImage({ title, backdrop, meta = [] }: Card): Promise<Uint8Array> {
  await setup()
  const size = title.length > 60 ? 60 : title.length > 36 ? 68 : 80

  const card = h(
    'div',
    {
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: WIDTH,
        height: HEIGHT,
        padding: PAD,
        background: BG,
        color: FG,
        fontFamily: 'Iosevka Aile',
      },
    },
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: PAD - 8,
          bottom: 150,
          fontSize: 240,
          fontWeight: 300,
          lineHeight: 0.85,
          letterSpacing: -10,
          color: TITLE_FAINT,
        },
      },
      backdrop,
    ),
    ...particles(title),
    logo(),
    h(
      'div',
      {
        style: {
          display: 'flex',
          marginTop: 88,
          maxWidth: 940,
          fontSize: size,
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: -size * 0.04,
        },
      },
      title,
    ),
    meta.length > 0 &&
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', marginTop: 36, fontSize: 26, fontWeight: 400, color: MUTED } },
        ...meta.flatMap((part, i) => [
          i > 0 && h('div', { style: { width: 7, height: 7, margin: '0 18px', background: FAINT } }),
          h('span', {}, part),
        ]),
      ),
  )

  const svg = await satori(card as never, { width: WIDTH, height: HEIGHT, fonts })
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
}
