import { appBrief } from './appBrief'
import type { PromptPreset } from './types'

/** Ideas for shops and marketplaces: catalogues, carts, orders and people who sell. */
export const SHOP_APPS: PromptPreset[] = [
  {
    id: 'appShop', label: 'Online shop', icon: '🛍️',
    brief: appBrief({
      purpose: 'the online store "Alder & Co.", clothes and home goods. Goal: people browse, save favourites, order and follow their orders; staff manage the products.',
      users: 'visitors (browse), members (buy, favourites, order history) and an admin (manages products and orders).',
      pages: ['Home (hero, featured products, categories, benefits)', 'Shop (/shop: product grid, search, category and price filters, sorting)', 'Product (/shop/:id: pictures, sizes, add to cart, related items)',
        'Cart (/cart)', 'Checkout (/checkout, members only: address form, order summary, confirmation)', 'My orders (/account/orders, members only)', 'Favourites (/account/favourites, members only)',
        'Log in, Create account, Forgot password', 'Admin products (/admin/products, admin only: list, add, edit, delete)', 'About, Contact', 'Not found'],
      features: ['Sign-in with demo accounts: a member and an admin', 'Cart saved in the browser with quantity changes, totals and a free-shipping bar', 'Protected checkout that places a mock order and shows it in My orders',
        'Favourites toggle on every product card', 'Admin-only product form that changes the mock data until reload', 'Search, filters and sorting kept in the address'],
      data: ['Products: 24 (name, price, category, sizes, colours, 3 pictures, rating, stock)', 'Categories: 5', 'Orders: 3 for the demo member (items, total, status, date)'],
      look: 'airy and modern: warm white, soft sand and a deep olive accent, big product photos, generous spacing, rounded cards that lift on hover, a sticky header with a cart badge.',
      fonts: 'Fraunces for headings, Inter for text',
      details: 'Prices in USD, free shipping over $75, demo coupon WELCOME10 (10% off), 30-day returns, support@alderandco.example.',
    }),
  },
  {
    id: 'appMarket', label: 'Handmade marketplace', icon: '🧶',
    brief: appBrief({
      purpose: 'the marketplace "Loomly" where makers sell handmade goods. Goal: buyers find and buy items; makers open a shop and list their work.',
      users: 'visitors, buyers (members), makers (members with a shop) and an admin who can hide listings.',
      pages: ['Home (hero, trending items, featured makers, categories)', 'Browse (/browse: grid, search, category, price and "ships from" filters)', 'Item (/items/:id: pictures, maker card, reviews, add to cart)',
        'Maker shop (/makers/:id)', 'Cart and Checkout (checkout for members)', 'Become a maker (/sell, members: open a shop)', 'Maker dashboard (/dashboard, makers only: my listings, orders, add and edit a listing)',
        'My purchases (/account/orders)', 'Log in, Create account, Forgot password', 'Admin (/admin, admin only: listings to review)', 'About, Help centre, Not found'],
      features: ['Roles: buyer, maker, admin, each seeing different menu items', 'A maker opens a shop and creates, edits and pauses listings (mock data)', 'Reviews with star ratings on items', 'Cart grouped by maker', 'Favourite items and followed makers'],
      data: ['Items: 30 (title, price, category, materials, pictures, maker, stock, rating)', 'Makers: 8 (name, story, city, picture, banner)', 'Reviews: 40', 'Orders: a few per demo account'],
      look: 'crafty and warm: oatmeal paper background, terracotta and sage accents, hand-drawn flourishes in inline SVG, polaroid-style item photos, friendly rounded shapes.',
      fonts: 'DM Serif Display for headings, Nunito for text',
      details: 'A 6% marketplace fee, makers are paid weekly, shipping set by each maker, demo accounts: buyer, maker and admin.',
    }),
  },
  {
    id: 'appFood', label: 'Food ordering', icon: '🍜',
    brief: appBrief({
      purpose: 'the ordering app of the restaurant "Saffron Table". Goal: customers pick dishes, order for delivery or pickup and track the order; staff manage the menu and orders.',
      users: 'guests (see the menu), customers (order, saved addresses, order history) and staff (kitchen and menu management).',
      pages: ['Home (hero, popular dishes, how it works)', 'Menu (/menu: categories, search, dietary filters)', 'Dish (/menu/:id: options, extras, notes, add to basket)', 'Basket (/basket)',
        'Checkout (/checkout, customers only: delivery or pickup, address, time, payment summary)', 'Order tracking (/orders/:id: status steps)', 'My orders and addresses (/account)',
        'Log in, Create account, Forgot password', 'Staff board (/staff, staff only: new, cooking, ready, delivered columns)', 'Menu manager (/staff/menu, staff only)', 'About, Contact, Not found'],
      features: ['Dish options and extras that change the price', 'Basket kept in the browser, delivery fee and minimum order', 'Order status that advances on a timer in mock mode', 'Staff-only board to move orders between columns', 'Saved delivery addresses'],
      data: ['Dishes: 28 (name, price, category, dietary tags, options, picture)', 'Orders: 6 with statuses', 'Addresses: 2 per demo customer'],
      look: 'rich and appetising: deep saffron, charcoal and cream, large food photos, gold hairline dividers, a floating basket button on phones.',
      fonts: 'Playfair Display for headings, Inter for text',
      details: 'Delivery $3.50 under 5 km, pickup ready in 20 minutes, open daily 11:00 to 22:00, demo accounts: customer and staff.',
    }),
  },
  {
    id: 'appClassifieds', label: 'Local classifieds', icon: '📌',
    brief: appBrief({
      purpose: 'the local classifieds site "Nearby". Goal: neighbours post things to sell or give away and message each other.',
      users: 'visitors (browse), members (post, save, message) and a moderator (removes bad posts).',
      pages: ['Home (search bar, categories, newest posts)', 'Browse (/browse: filters for category, price, distance and condition; list and grid view)', 'Post (/posts/:id: pictures, details, seller, message box)',
        'Create a post (/posts/new, members only: form with picture links and preview)', 'My posts (/account/posts, members only: edit, mark as sold, delete)', 'Messages (/account/messages, members only: conversations)', 'Saved (/account/saved)',
        'Log in, Create account, Forgot password', 'Moderation (/moderation, moderator only: reported posts)', 'Safety tips, Not found'],
      features: ['Posting form with validation and a live preview', 'Conversations per post with unread counts', 'Save and unsave posts', 'Report a post; moderator can remove it', 'Filters and search kept in the address'],
      data: ['Posts: 30 (title, price, category, condition, pictures, area, date, seller, status)', 'Conversations: 5 with messages', 'Reports: 4'],
      look: 'friendly and practical: white cards on a light grey page, one bright blue accent, clear price tags, small badges for "New" and "Free".',
      fonts: 'Plus Jakarta Sans for headings, Inter for text',
      details: 'Free to post, posts expire after 30 days, areas are neighbourhoods of one city, demo accounts: member and moderator.',
    }),
  },
  {
    id: 'appPlants', label: 'Plant shop with subscriptions', icon: '🪴',
    brief: appBrief({
      purpose: 'the shop "Fern & Co." for houseplants. Goal: sell plants and a monthly plant subscription that members can pause or cancel.',
      users: 'visitors, members (orders, subscription, plant care reminders) and an admin (stock and subscriptions).',
      pages: ['Home (hero, bestsellers, subscription teaser, care guides)', 'Shop (/shop: filters for light, pet-safe, size and price)', 'Plant (/shop/:id: care card, sizes, add to cart)', 'Subscription plans (/subscribe: three plans with a comparison)',
        'Cart and Checkout (members)', 'My plants (/account/plants, members: reminders to water, calendar)', 'My subscription (/account/subscription, members: change plan, pause, cancel)', 'Log in, Create account, Forgot password',
        'Admin (/admin, admin only: stock and subscribers)', 'Care guides (/guides and /guides/:slug)', 'Contact, Not found'],
      features: ['Subscription sign-up flow with a plan choice and a summary', 'Pause and cancel with a confirmation and a clear message', 'Watering reminders shown on a small calendar', 'Pet-safe and light-level filters', 'Admin stock changes'],
      data: ['Plants: 22 (name, price, light, pet-safe, size, care level, pictures, stock)', 'Plans: 3 (Seedling, Sprout, Jungle)', 'Guides: 8 articles', 'Subscribers: 6'],
      look: 'fresh and botanical: soft cream, deep leaf green and a coral accent, big leafy photos, organic blob shapes, calm motion.',
      fonts: 'Fraunces for headings, DM Sans for text',
      details: 'Plans $19, $34 and $59 per month, free delivery on subscriptions, 14-day plant guarantee, demo accounts: member and admin.',
    }),
  },
]
