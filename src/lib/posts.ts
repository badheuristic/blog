import { getCollection, type CollectionEntry } from 'astro:content'

export type Section = 'posts' | 'diary'
export type Entry = CollectionEntry<Section>

/** What each section is called, where it lives, and the word behind its pages. */
export const sections: Record<Section, { label: string; path: string; intro: string; backdrop: string }> = {
  posts: {
    label: 'posts',
    path: '/',
    intro: 'Notes on things I build and how.',
    backdrop: 'blog',
  },
  diary: {
    label: 'diary',
    path: '/diary/',
    intro: 'Looser notes from along the way.',
    backdrop: 'diary',
  },
}

/** A section's published entries, newest first. Drafts are included in dev only. */
export async function getEntries(section: Section): Promise<Entry[]> {
  const entries = await getCollection(section, (entry: Entry) => import.meta.env.DEV || !entry.data.draft)
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** Where an entry is served: /posts/<file name>/ or /diary/<file name>/. */
export const entryUrl = (entry: Entry) => `/${entry.collection}/${entry.id}/`

/** Minutes to read, at about 220 words a minute, never less than one. */
export function readingTime(entry: Entry): number {
  const words = (entry.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const shortDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })

/** "8 November 2026" */
export const formatDate = (date: Date) => longDate.format(date)
/** "08 Nov" */
export const formatShortDate = (date: Date) => shortDate.format(date)
/** For <time datetime>. */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10)

/** A tag as it appears in a URL: lowercase, spaces as dashes. */
export const tagSlug = (tag: string) =>
  tag
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')

/** Where a tag's page is. */
export const tagUrl = (tag: string) => `/tags/${tagSlug(tag)}/`

/** Every tag in both sections, with its entries (newest first), most used first. */
export async function getTags(): Promise<{ tag: string; slug: string; entries: Entry[] }[]> {
  const all = [...(await getEntries('posts')), ...(await getEntries('diary'))].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )
  const tags = new Map<string, { tag: string; slug: string; entries: Entry[] }>()
  for (const entry of all) {
    for (const tag of entry.data.tags) {
      const slug = tagSlug(tag)
      if (!tags.has(slug)) tags.set(slug, { tag, slug, entries: [] })
      tags.get(slug)!.entries.push(entry)
    }
  }
  return [...tags.values()].sort((a, b) => b.entries.length - a.entries.length || a.tag.localeCompare(b.tag))
}
