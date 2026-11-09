// Where the last click on a link was, kept across one page load so the next page can
// start its cursor (and its tile reveal) there. Must match the key in Base.astro.
const KEY = 'blog:pointer'
// Older than this and it belongs to some other visit.
const MAX_AGE = 5000

export type Point = { x: number; y: number }

export function lastPointer(): Point | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
    if (!saved || Date.now() - saved.t > MAX_AGE) return null
    return { x: saved.x, y: saved.y }
  } catch {
    return null
  }
}
