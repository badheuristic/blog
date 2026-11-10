// Link preview images: /og/posts.png and /og/diary.png for the lists (and tag pages),
// /og/<section>/<file name>.png for each entry.
import type { APIRoute, GetStaticPaths } from 'astro'
import { ogImage } from '../../lib/og'
import { formatDate, getEntries, sections, type Entry, type Section } from '../../lib/posts'

export const getStaticPaths = (async () => {
  const lists = (['posts', 'diary'] as const).map((section) => ({
    params: { path: section },
    props: { title: sections[section].intro, backdrop: sections[section].backdrop, meta: [] as string[] },
  }))
  const entries = (await Promise.all((['posts', 'diary'] as const).map((s) => getEntries(s)))).flat()
  return [
    ...lists,
    ...entries.map((entry: Entry) => {
      const section = sections[entry.collection as Section]
      return {
        params: { path: `${entry.collection}/${entry.id}` },
        props: { title: entry.data.title, backdrop: section.backdrop, meta: [formatDate(entry.data.date), section.label] },
      }
    }),
  ]
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const png = await ogImage(props as Parameters<typeof ogImage>[0])
  return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } })
}
