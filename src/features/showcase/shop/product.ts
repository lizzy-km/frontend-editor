import { productCard } from './cards'

/** The product page at /product/:id: it shows the one row whose id is in the address, with favourites and "add to basket". */
export const PRODUCT_HTML = `
<style>.shop-detail { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 56px; align-items: start }
.shop-detail__pic { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 24px; background: var(--shop-sand) }
.shop-detail h1 { font-size: 38px; margin: 6px 0 14px }
.shop-detail__price { margin: 0 0 16px; font-size: 30px; font-weight: 700; color: var(--shop-accent) }
.shop-detail__text { margin: 0 0 24px; color: var(--shop-soft); font-size: 17px }
.shop-points { margin: 24px 0 0; padding: 20px 0 0; border-top: 1px solid var(--shop-line); list-style: none; display: grid; gap: 6px; color: var(--shop-soft); font-size: 15px }
@media (max-width: 1024px) { .shop-detail { gap: 32px } }
@media (max-width: 640px) { .shop-detail { grid-template-columns: 1fr } .shop-detail h1 { font-size: 30px } }</style>
<section class="shop-wrap shop-wrap--tight">
  <a href="/shop" style="font-weight: 600; text-decoration: none; color: var(--shop-soft)">&larr; Back to the shop</a>
</section>
<section class="shop-wrap shop-wrap--tight" style="padding-top: 0" data-fe-animate="fade-up" data-fe-trigger="load">
  <div class="shop-detail" data-fe-record="products" data-fe-row="?id">
    <img class="shop-detail__pic" data-fe-bind-src="image" src="https://i.imgur.com/QkIa5tT.jpeg" alt="Product photo">
    <div>
      <p class="shop-eyebrow" data-fe-bind="category">Category</p>
      <h1 data-fe-bind="title">Product name</h1>
      <p class="shop-detail__price">$<span data-fe-bind="price">20</span></p>
      <p class="shop-detail__text" data-fe-bind="description">A few words about the product.</p>
      <p class="shop-banner" data-fe-flags="favourites">&#9829; Saved to your favourites. You can find the heart on every card in the shop.</p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap">
        <a class="shop-btn" href="/cart">Add to basket</a>
        <button type="button" class="shop-btn shop-btn--ghost" data-fe-flag="favourites" data-fe-flag-mode="toggle">&#9825; Save to favourites</button>
      </div>
      <ul class="shop-points"><li>Free delivery on orders over $50</li><li>30 days to send it back</li><li>Questions? <a href="/contact">Write to us</a></li></ul>
    </div>
  </div>
</section>
<section class="shop-wrap" data-fe-animate="fade-up" data-fe-trigger="scroll">
  <h2 class="shop-title">You might also like</h2>
  <div class="shop-grid shop-grid--three" data-fe-list="products" data-fe-page-size="3" data-fe-load="all" style="margin-top: 24px">${productCard()}</div>
</section>`
