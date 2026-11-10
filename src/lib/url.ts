import { config } from '../config'

/** A path inside the blog ('/tags/'), as a link that works under the base ('/blog/tags/'). */
export const href = (path: string) => `${config.base}${path}`
