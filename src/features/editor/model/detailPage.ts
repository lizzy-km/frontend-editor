import { rowTypeName } from './data'
import { BIND_ATTR, BIND_PREFIX } from './dataLists'
import { RECORD_ATTR, ROW_ATTR } from './dataRecords'
import { slugify } from './pages'
import type { DataSource } from './types'

/** A ready-made page that shows ONE row of a data source, picked by the address (/product/:id): the "detail page". */

/** "storeProducts" -> "/store-product/:id" */
export const detailPath = (source: DataSource) => `/${slugify(rowTypeName(source.name).replace(/([a-z0-9])([A-Z])/g, '$1 $2'))}/:id`

/** The row's own words: "StoreProduct" -> "Store product". */
export const detailTitle = (source: DataSource) => {
  const words = rowTypeName(source.name).replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} details`
}

/**
 * The page's content: a picture, the title, a number, the long text and a "back" link,
 * each connected to a field by what fits. The box takes its row from the address (data-fe-row="?id").
 */
export function detailPageHtml(source: DataSource): string {
  const field = (...types: string[]) => source.fields.find((item) => types.includes(item.type))
  const image = field('image')
  const title = field('text')
  const number = field('number')
  const body = field('longText')
  const category = source.fields.find((item) => item.type === 'text' && item.name !== title?.name)
  return [
    `<section ${RECORD_ATTR}="${source.name}" ${ROW_ATTR}="?id" style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; max-width: 1040px; margin: 0 auto; padding: 56px 24px">`,
    image ? `<img ${BIND_PREFIX}src="${image.name}" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80" alt="" style="width: 100%; aspect-ratio: 1 / 1; object-fit: contain; border-radius: 18px; background: #f5f5f4">` : '',
    '<div style="display: flex; flex-direction: column; gap: 14px; justify-content: center">',
    category ? `<p ${BIND_ATTR}="${category.name}" style="margin: 0; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; opacity: .6">${category.name}</p>` : '',
    title ? `<h1 ${BIND_ATTR}="${title.name}" style="margin: 0; font-size: 34px; line-height: 1.15">${title.name}</h1>` : '',
    number ? `<p ${BIND_ATTR}="${number.name}" style="margin: 0; font-size: 26px; font-weight: 800">${number.name}</p>` : '',
    body ? `<p ${BIND_ATTR}="${body.name}" style="margin: 0; line-height: 1.6; opacity: .8">${body.name}</p>` : '',
    '<a href="/" style="font-weight: 700; margin-top: 8px">← Back</a>',
    '</div></section>',
  ].join('')
}
