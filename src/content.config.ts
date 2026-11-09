import { glob } from 'astro/loaders'
import { defineCollection, type SchemaContext } from 'astro:content'
import { z } from 'astro/zod'

// Posts and diary entries share one shape; they differ in tone, not in fields.
const schema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),
    // Drafts show up in `bun dev` (marked as drafts) and are left out of the build.
    draft: z.boolean().default(false),
  })

/** Finished, considered writing: technical posts and the like. */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema,
})

/** Looser notes from along the way: what I did, what I'm thinking about. */
const diary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/diary' }),
  schema,
})

export const collections = { posts, diary }
