import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { config } from '../config'
import { entryUrl, getEntries, sections, type Section } from './posts'

/** One RSS feed per section. */
export async function feed(section: Section, context: APIContext) {
  const entries = await getEntries(section)
  return rss({
    title: `${config.title}: ${sections[section].label}`,
    description: sections[section].intro,
    site: context.site ?? config.url,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary,
      pubDate: entry.data.date,
      link: entryUrl(entry),
      categories: entry.data.tags,
    })),
  })
}
