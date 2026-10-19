import { productCard } from './cards'

const HERO = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80'

const BENEFITS = [
  ['Free delivery over $50', 'Orders are packed the same day and arrive in two to four working days.'],
  ['30 days to change your mind', 'Not right for you? Send it back, no questions and no forms.'],
  ['Checked by hand', 'Every item is looked over by one of us before it leaves the shelf.'],
  ['People, not robots', 'Write to us and a real person answers, usually within a few hours.'],
]

/** The home page: hero, featured products, categories, benefits and a short invitation to get in touch. */
export const HOME_HTML = `
<style>.shop-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 48px; align-items: center }
.shop-hero h1 { font-size: 56px; margin-bottom: 18px }
.shop-hero__pic { width: 100%; aspect-ratio: 5 / 4; object-fit: cover; border-radius: 28px; box-shadow: 0 30px 60px -30px rgba(43, 38, 34, .6) }
.shop-actions { display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap }
@media (max-width: 1024px) { .shop-hero h1 { font-size: 44px } }
@media (max-width: 640px) { .shop-hero { grid-template-columns: 1fr; gap: 28px } .shop-hero h1 { font-size: 34px } }</style>
<section class="shop-wrap" data-fe-animate="fade-up" data-fe-trigger="load">
  <div class="shop-hero">
    <div><p class="shop-eyebrow">Everyday goods, honestly priced</p>
      <h1>Things you will actually use, picked with care.</h1>
      <p class="shop-lead">Alder &amp; Co. is a small online shop for clothes, sound, furniture and a few surprises. Browse the shelves, take a quick look and keep a list of favourites.</p>
      <div class="shop-actions"><a class="shop-btn" href="/shop">Shop everything</a><a class="shop-btn shop-btn--ghost" href="/about">Our story</a></div></div>
    <img class="shop-hero__pic" src="${HERO}" alt="A bright shop counter with folded clothes and plants">
  </div>
</section>
<section class="shop-wrap shop-wrap--tight" data-fe-animate="fade-up" data-fe-trigger="scroll">
  <div class="shop-head"><div><p class="shop-eyebrow">New on the shelves</p><h2 class="shop-title" style="margin: 0">Featured products</h2></div><a class="shop-btn shop-btn--ghost shop-btn--small" href="/shop">See all products</a></div>
  <div class="shop-grid" data-fe-list="products" data-fe-page-size="4" data-fe-load="all">${productCard()}</div>
</section>
<section class="shop-wrap" data-fe-animate="fade-up" data-fe-trigger="scroll">
  <p class="shop-eyebrow">Shop by department</p><h2 class="shop-title">Find your corner of the shop</h2>
  <div class="shop-cats" data-fe-list="categories" data-fe-page-size="5" data-fe-load="all" style="margin-top: 28px">
    <a class="shop-cat" href="/shop"><img data-fe-bind-src="image" src="https://i.imgur.com/QkIa5tT.jpeg" alt="Category photo"><h3 data-fe-bind="name">Category</h3></a></div>
</section>
<section class="shop-wrap shop-wrap--tight" data-fe-animate="fade-up" data-fe-trigger="scroll">
  <div class="shop-benefits">${BENEFITS.map(([title, text]) => `<div class="shop-benefit"><h3>${title}</h3><p>${text}</p></div>`).join('')}</div>
</section>
<section class="shop-band" data-fe-animate="fade" data-fe-trigger="scroll"><div class="shop-wrap shop-split">
  <div><p class="shop-eyebrow" style="color: #f2b999">Say hello</p><h2 class="shop-title">Not sure what to pick?</h2>
    <p class="shop-lead">Tell us who the gift is for or what you need, and we will suggest three things. It is free and there is no sales talk.</p></div>
  <div style="display: flex; gap: 12px; flex-wrap: wrap"><a class="shop-btn" href="/contact">Ask us</a><a class="shop-btn shop-btn--ghost" style="color: #fff; border-color: #fff" href="/cart">View your basket</a></div>
</div></section>`
