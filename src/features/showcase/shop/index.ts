import { buildSite } from '../site'
import type { Showcase } from '../types'
import { SHOP_CSS, SHOP_LINKS } from './css'
import { CATEGORY_ROWS, PRODUCT_ROWS } from './rows'
import { HOME_HTML } from './home'
import { SHOP_HTML } from './shop'
import { PRODUCT_HTML } from './product'
import { ABOUT_HTML, CART_HTML, CONTACT_HTML, FOOTER_HTML } from './info'

/** The example online shop "Alder & Co.": real product data, search and filters, pop-up, favourites, forms and animations. */
export const shopShowcase: Showcase = {
  id: 'shop',
  title: 'Online shop',
  tagline: 'A finished shop with live product data, search, category filters, a quick-look pop-up and favourites.',
  features: ['Live product data from a real API', 'Search and category filters', 'Product pages for every item', 'Quick-look pop-up on each card', 'Favourites that remember a click', 'Demo checkout and contact forms', 'Gentle scroll animations'],
  requires: ['data-fe-list', 'data-fe-record', 'data-ui-filterable', 'data-ui-choices', 'data-fe-modal', 'data-fe-open', 'data-fe-go', 'data-fe-flag', 'data-fe-flags', 'data-fe-animate', 'data-fe-submit'],
  build: () => buildSite({
    title: 'Alder & Co.',
    css: SHOP_CSS,
    links: SHOP_LINKS,
    home: HOME_HTML,
    footer: FOOTER_HTML,
    pages: [
      { title: 'Shop', path: '/shop', html: SHOP_HTML },
      { title: 'Product details', path: '/product/:id', html: PRODUCT_HTML, inMenu: false },
      { title: 'About', path: '/about', html: ABOUT_HTML },
      { title: 'Contact', path: '/contact', html: CONTACT_HTML },
      { title: 'Basket', path: '/cart', html: CART_HTML },
    ],
    data: [
      {
        name: 'products',
        fields: [{ name: 'id', type: 'number' }, { name: 'title', type: 'text' }, { name: 'price', type: 'number' }, { name: 'description', type: 'longText' }, { name: 'category', type: 'text', from: 'category.name' }, { name: 'image', type: 'image', from: 'images.0' }],
        rows: PRODUCT_ROWS,
        api: { url: 'https://api.escuelajs.co/api/v1/products?offset=0&limit=20', itemUrl: 'https://api.escuelajs.co/api/v1/products/:id' },
      },
      {
        name: 'categories',
        fields: [{ name: 'id', type: 'number' }, { name: 'name', type: 'text' }, { name: 'image', type: 'image' }],
        rows: CATEGORY_ROWS,
        api: { url: 'https://api.escuelajs.co/api/v1/categories' },
      },
    ],
    access: { roles: ['member', 'admin'], flags: ['favourites'] },
  }),
}
