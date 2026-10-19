const PLACEHOLDER = 'https://i.imgur.com/QkIa5tT.jpeg'

/**
 * The card design for a product list. Clicking the card opens the product page (data-fe-go); the "Quick look" button
 * (data-fe-open) opens the pop-up on the same page and the heart button changes the "favourites" flag.
 * `quick` is only for pages that have the pop-up; `filterable` lets the Shop page's filter buttons read the category.
 */
export function productCard(options: { quick?: boolean; filterable?: boolean } = {}): string {
  const by = options.filterable ? ' data-fe-bind-data-category="category"' : ''
  const quick = options.quick ? '<button type="button" class="shop-btn shop-btn--small" data-fe-open="quick">Quick look</button>' : ''
  return `<article class="shop-card" data-fe-go="/product/:id"${by}>`
    + `<div class="shop-card__pic"><img data-fe-bind-src="image" src="${PLACEHOLDER}" alt="Product photo" loading="lazy"></div>`
    + '<div class="shop-card__body"><p class="shop-card__cat" data-fe-bind="category">Clothes</p>'
    + '<h3 data-fe-bind="title">Product name</h3>'
    + '<p class="shop-card__price">$<span data-fe-bind="price">20</span></p>'
    + `<div class="shop-card__actions">${quick}<button type="button" class="shop-fav" data-fe-flag="favourites" data-fe-flag-mode="toggle" aria-label="Save to favourites">&#9825; Save</button></div>`
    + '</div></article>'
}

/** The pop-up of the Shop page: it shows the product whose "Quick look" button was clicked. */
export const QUICK_LOOK = '<div data-fe-modal="quick" style="padding: 40px 16px; background: rgba(43, 38, 34, .6)">'
  + '<div class="shop-quick" data-fe-record="products" data-fe-row="clicked">'
  + `<img data-fe-bind-src="image" src="${PLACEHOLDER}" alt="Product photo" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 14px">`
  + '<div style="display: flex; flex-direction: column; gap: 10px; justify-content: center">'
  + '<p class="shop-card__cat" data-fe-bind="category">Clothes</p>'
  + '<h2 data-fe-bind="title" style="font-size: 26px">Product name</h2>'
  + '<p class="shop-card__price" style="font-size: 22px">$<span data-fe-bind="price">20</span></p>'
  + '<p data-fe-bind="description" style="margin: 0; color: #6b625a; font-size: 15px">Description</p>'
  + '<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px"><a class="shop-btn shop-btn--small" data-fe-bind-href="/product/:id" href="/shop">See the details</a>'
  + '<button type="button" class="shop-btn shop-btn--ghost shop-btn--small" data-fe-close>Close</button></div></div></div></div>'
