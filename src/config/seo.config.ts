/**
 * The address of the deployed site, without a trailing slash (e.g. https://tweak.example). Canonical links, share
 * pictures and the sitemap need a full address, so they are left out while this is empty.
 */
export const SITE_URL: string = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? '').trim().replace(/\/+$/, '')

/** The picture shown when a link is shared (1200 × 630), in /public. */
export const SHARE_IMAGE = '/og-image.png'

/** Pages people share from their account are not indexed by search engines unless this is switched on. */
export const INDEX_SHARED_PAGES = false
