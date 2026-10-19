import { widget } from '../site'
import { chipsInner, chipsLiveInner, CHOICES } from '@/features/editor/model/widgets/blocksTable'
import { QUICK_LOOK, productCard } from './cards'

/** Filter buttons whose choices are the live list of the `categories` source, matching the products' `category` field. */
const categoryChips = () => widget('filter-chips', { target: 'shop' })
  .replace(chipsInner(CHOICES), chipsLiveInner('categories', 'name'))
  .replace('data-ui-for="shop"', 'data-ui-for="shop" data-ui-by="category" data-ui-choices="categories.name"')

/** The Shop page: search, category buttons, every product as a card, and the quick-look pop-up. */
export const SHOP_HTML = `
<section class="shop-wrap shop-wrap--tight">
  <p class="shop-eyebrow">The shop</p><h1 class="shop-title">Every product, one page</h1>
  <p class="shop-lead">Type in the search bar or pick a department. Click a card to see the details, or use Quick look to peek without leaving the page.</p>
</section>
<section class="shop-wrap shop-wrap--tight" style="padding-top: 0">
  <p class="shop-banner" data-fe-flags="favourites">&#9829; Saved to your favourites. Tap the heart again on a product to remove it.</p>
  <div class="shop-tools">${widget('search', { target: 'shop' })}${categoryChips()}</div>
  <div class="shop-grid" data-ui-filterable="shop" data-fe-list="products" data-fe-page-size="50" data-fe-load="all">${productCard({ quick: true, filterable: true })}</div>
</section>
${QUICK_LOOK}`
