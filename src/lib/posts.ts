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
