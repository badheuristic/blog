# Blog architecture

The blog that goes with the personal site (`../website`). It's a separate project with
the same design rules: monotone, type-led, flat, no borders, no rounded corners. It's a
quiet place to read, so it keeps the site's chrome and look but drops what gets in the way
of a long post (no mascot, no section stepping, native scroll).

## Stack

- **Astro**, static output. Posts are markdown files, rendered to plain HTML at build
  time. JavaScript only goes to the browser where it's needed (theme switch, and later the
  cursor and particles).
- **Shiki** (built into Astro) highlights code with two hand-made grayscale themes
  (`src/lib/codeThemes.ts`). Both are emitted as CSS variables, and `prose.css` picks one
  from `data-theme`, so code follows the theme switch without a reload.
- **bun** for packages and scripts, as on the main site.

## Shared with the main site

Copied, not linked, so each project builds on its own. If one changes, update the other.

| what | here | there |
|---|---|---|
| tokens | `src/styles/tokens.css` | `src/styles/tokens.css` |
| reset and base type | `src/styles/global.css` | `src/styles/global.css` |
| font subsets | `src/assets/fonts`, `scripts/subset-fonts.sh` | same |
| logo | `components/Logo.astro` | `components/chrome/Logo.tsx` |
| theme switch and dissolve | `components/ThemeSwitch.astro`, `lib/theme.ts`, `lib/themeDissolve.ts` | `ThemeSwitch.tsx`, `useTheme.ts`, `themeDissolve.ts` |

Blog-only tokens: `--code-bg` and `--code-1`…`--code-4` (code fill and shades),
`--text-title` (post titles, a step under the display size) and `--measure` (62ch).

## Layout

- **Header** (fixed): logo top left (links to the blog index), `Home` (the main site) and
  `light / dark` top right. It sits on a page-colored strip that fades out at the bottom,
  so text scrolls under it.
- **Backdrop** (fixed, behind the content): the section's word (`blog` or `diary`), bottom left, at display size
  in `--title-faint`, like the main site's section titles. Hidden on screens under 500px
  tall.
- **Content** keeps to the main site's center-right column (`--col-start` to `--col-end`),
  with running text held to `--measure`. Below 1024px wide or 500px tall the column goes
  full width, as on the main site.

## Sections

Two kinds of writing, kept apart:

- **posts**: finished, considered pieces (technical write-ups and the like). Listed at
  `/`, served at `/posts/<file name>/`, backdrop `blog`, feed `/rss.xml`.
- **diary**: looser notes from along the way (what I did, what I'm thinking about).
  Listed at `/diary/`, served at `/diary/<file name>/`, backdrop `diary`, feed
  `/diary/rss.xml`.

Both share one schema, one list component and one entry layout; they differ in tone, not
in fields. Section names, paths and intros live in `src/lib/posts.ts`.

## Pages

- **List** (`/`, `/diary/`): `posts / diary` switch (the current one at full contrast,
  like the theme switch), a line about the section, then entries grouped by year, newest
  first. Each row is date, title and summary. Hover fills the row with `--code-bg` and
  nudges the title right. (`components/EntryList.astro`)
- **Entry**: `← posts` or `← diary`, title, meta line (date, reading time, updated date)
  with square separators, tags, the text, then links to the older and newer entries in
  the same section. (`layouts/Entry.astro`)
- **RSS** per section and a sitemap (`@astrojs/sitemap`).

## Posts

One markdown file per entry, in `src/content/posts/` or `src/content/diary/`; the file
name is the URL. Frontmatter (checked by `src/content.config.ts`):

```yaml
title: spreadsheets as a backend, on purpose
date: 2026-11-04
summary: One sentence for the index, RSS and link previews.
tags: [data, workflow]   # optional
updated: 2026-11-10      # optional
cover: ./cover.png       # optional, not shown anywhere yet
draft: true              # optional: shown in `bun dev` (marked), left out of the build
```

Post typography (`src/styles/prose.css`): light headings set by size, `strong` only goes
up to Medium, links get a faint underline that darkens on hover, bullets are small
squares, quotes are indented and muted (no side rule), `---` is one small square, tables
have no rules (alternate rows on the code fill), footnotes are small and muted at the end.

## Build order

Each step leaves a working blog.

1. ✅ **Scaffold.** Astro project, shared tokens, fonts and base styles, header, backdrop,
   index, post page, post typography, grayscale code, theme switch with the dissolve,
   RSS, sitemap. One placeholder post and the spreadsheet post as a draft.
   Then split into posts and diary; the spreadsheet post is a diary entry.
2. ✅ **Motion.** Cursor and the particle field (sparser and fainter than on the main
   site, so they don't compete with text), a square-tile page transition between index
   and post (cross-document view transitions), all off under reduced motion.
   - The page reveal runs from an inline script in `Base.astro`'s head (it must be set
     up before the first frame), starting from where the link was clicked; keyboard and
     back/forward start from the center. It duplicates the tile loop in
     `lib/themeDissolve.ts`, a little quicker (0.35s spread, 0.22s per tile).
   - The click point is kept in sessionStorage for 5s (`lib/pointer.ts`), so the next
     page's cursor shows up where it was instead of vanishing until the mouse moves.
   - The cursor's dot and trail have their own `view-transition-name`, so they stay on
     top during the theme dissolve and page reveal.
   - Chrome and Safari 18.2+ run the reveal; Firefox navigates normally.
3. **Rich posts.** Images with captions, embedding interactive demos (like the hub
   location simulation in `../blogpost/demo`), grayscale diagrams.
4. **Extras.** Tag pages, link previews (Open Graph images), a table of contents for long
   posts.
5. **Polish and deploy.** Accessibility, performance, the real URLs in `src/config.ts`,
   and linking it from the main site's header.

## Open questions

- **Hosting and URL.** A subdomain (`blog.<domain>`) or somewhere else? `src/config.ts`
  holds placeholders until then.
- **The diagram in `../blogpost`** uses yellow and cyan. It needs a grayscale version
  before it goes in a post.
