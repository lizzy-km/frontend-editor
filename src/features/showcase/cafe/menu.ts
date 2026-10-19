import { filterChipsHtml, filterSelectHtml } from '@/features/editor/model/widgets/blocksTable'
import { PHOTO, PICS } from './css'
import { widget } from '../site'

const FADE = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'
const CATEGORIES = ['Breakfast', 'Lunch', 'Drinks', 'Dessert']
const PLACEHOLDER = PHOTO(PICS.brunch, 800)

const veggieFilter = () => filterSelectHtml('dishes', ['Yes'], 'vegetarian')
  .replace('<option>Yes</option>', '<option value="Yes">Vegetarian only</option>').replace('>Show<', '>Dishes<')

/** One dish card: opens the pop-up for that dish; category and vegetarian flag are what the filters look at. */
const card = `<article class="cafe-card" data-fe-open="dish" data-fe-bind-data-category="category" data-fe-bind-data-vegetarian="vegetarian">`
  + `<img data-fe-bind-src="image" data-fe-bind-alt="name" src="${PLACEHOLDER}" alt="A dish from our menu">`
  + '<div class="cafe-card-body"><span class="cafe-tag" data-fe-bind="category">Breakfast</span>'
  + '<div class="cafe-dish"><h3 data-fe-bind="name">Dish name</h3><span class="cafe-price">$<span data-fe-bind="price">12</span></span></div>'
  + '<p data-fe-bind="description">What is in the dish.</p></div></article>'

/** The pop-up that shows the dish that was clicked, with a picture, the price and a way to book. */
const dishPopup = `<div data-fe-modal="dish" data-fe-record="menu" data-fe-row="clicked" class="cafe-popup"><div class="cafe-popup-box">`
  + `<img data-fe-bind-src="image" data-fe-bind-alt="name" src="${PLACEHOLDER}" alt="The dish you picked">`
  + '<div class="cafe-popup-body"><span class="cafe-tag" style="justify-self: start" data-fe-bind="category">Breakfast</span>'
  + '<div class="cafe-dish"><h2 style="font-size: 28px" data-fe-bind="name">Dish name</h2><span class="cafe-price">$<span data-fe-bind="price">12</span></span></div>'
  + '<p style="color: #6b5a4c" data-fe-bind="description">What is in the dish.</p><p style="font-size: 14px">Vegetarian: <strong data-fe-bind="vegetarian">Yes</strong></p>'
  + '<div class="cafe-row"><a class="cafe-btn" href="/reservations">Book a table</a><button type="button" class="cafe-btn cafe-btn--ghost" data-fe-close>Close</button></div></div></div></div>'

/** The menu page: a search bar, category buttons and a vegetarian filter narrowing the "List from data" box; each dish opens a pop-up. */
export const menuHtml = `<section class="cafe-section"><div class="cafe-wrap">
<div class="cafe-center" ${FADE}><span class="cafe-eyebrow">The menu</span><h1 class="cafe-title">Everything we cook</h1><p class="cafe-lead">Search, pick a course, or tap any dish to see it up close. Prices are in dollars and include tax.</p></div>
<div class="cafe-bar" ${FADE}>${widget('search', { target: 'dishes' })}${veggieFilter()}</div>
<div ${FADE}>${filterChipsHtml('dishes', CATEGORIES, 'category')}</div>
<div class="cafe-menu-list" data-ui-filterable="dishes" data-fe-list="menu" data-fe-page-size="50" data-fe-load="all">${card}</div>
<p class="cafe-center" style="margin-top: 40px; color: #6b5a4c">Ask us about allergies. We are happy to adapt most dishes.</p>
</div></section>${dishPopup}`
