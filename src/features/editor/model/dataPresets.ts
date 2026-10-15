import type { DataSource } from './types'

type Preset = { label: string; source: Omit<DataSource, 'id'> }
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`

/** Ready-made data to start from (mock rows look real, so the page looks finished right away). */
export const DATA_PRESETS: Preset[] = [
  {
    label: 'Products',
    source: {
      name: 'products',
      fields: [{ name: 'name', type: 'text' }, { name: 'price', type: 'number' }, { name: 'image', type: 'image' }, { name: 'description', type: 'longText' }, { name: 'inStock', type: 'boolean' }],
      rows: [
        { name: 'Linen shirt', price: 59, image: photo('1602810318383-e386cc2a3ccf'), description: 'Breathable, relaxed fit, washed for softness.', inStock: true },
        { name: 'Canvas tote', price: 29, image: photo('1544816155-12df9643f363'), description: 'Sturdy everyday bag with an inside pocket.', inStock: true },
        { name: 'Ceramic mug', price: 18, image: photo('1514228742587-6b1558fcca3d'), description: 'Hand-glazed, holds a generous 350 ml.', inStock: false },
        { name: 'Wool beanie', price: 24, image: photo('1576871337622-98d48d1cf531'), description: 'Soft merino that keeps its shape.', inStock: true },
        { name: 'Leather wallet', price: 45, image: photo('1627123424574-724758594e93'), description: 'Slim, six cards, ages beautifully.', inStock: true },
        { name: 'Desk lamp', price: 79, image: photo('1507473885765-e6ed057f782c'), description: 'Warm dimmable light for late nights.', inStock: true },
      ],
    },
  },
  {
    // Same shape as https://fakestoreapi.com/products, so pointing it at the real API (or any store API like it) just works.
    label: 'Store products (Fake Store API)',
    source: {
      name: 'storeProducts',
      fields: [{ name: 'id', type: 'number' }, { name: 'title', type: 'text' }, { name: 'price', type: 'number' }, { name: 'description', type: 'longText' }, { name: 'category', type: 'text' }, { name: 'image', type: 'image' }],
      api: { url: 'https://fakestoreapi.com/products' },
      rows: [
        { id: 1, title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops', price: 109.95, description: 'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve.', category: "men's clothing", image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg' },
        { id: 2, title: 'Mens Casual Premium Slim Fit T-Shirts', price: 22.3, description: 'Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight and soft fabric.', category: "men's clothing", image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg' },
        { id: 3, title: 'Mens Cotton Jacket', price: 55.99, description: 'Great outerwear jackets for spring, autumn and winter: hiking, camping, travelling or other outdoors.', category: "men's clothing", image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg' },
        { id: 4, title: 'Mens Casual Slim Fit', price: 15.99, description: 'The color could be slightly different between on the screen and in practice. Please note the size chart.', category: "men's clothing", image: 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg' },
        { id: 5, title: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet", price: 695, description: 'From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean’s pearl.', category: 'jewelery', image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg' },
      ],
    },
  },
  {
    // The categories of the store above: a filter can offer these as its choices, and "Store products" items match them by their category.
    label: 'Categories (for filters)',
    source: {
      name: 'categories',
      fields: [{ name: 'name', type: 'text' }, { name: 'description', type: 'longText' }],
      rows: [
        { name: 'electronics', description: 'Drives, screens and gadgets.' },
        { name: 'jewelery', description: 'Rings, bracelets and chains.' },
        { name: "men's clothing", description: 'Shirts, jackets and everyday wear.' },
        { name: "women's clothing", description: 'Tops, coats and more.' },
      ],
    },
  },
  {
    label: 'Blog posts',
    source: {
      name: 'posts',
      fields: [{ name: 'title', type: 'text' }, { name: 'excerpt', type: 'longText' }, { name: 'cover', type: 'image' }, { name: 'date', type: 'date' }, { name: 'link', type: 'url' }],
      rows: [
        { title: '5 habits for calmer mornings', excerpt: 'Small changes that make the first hour of the day easier.', cover: photo('1495474472287-4d71bcdd2085'), date: '2026-09-02', link: '#' },
        { title: 'Designing a reading nook', excerpt: 'Light, texture and one very good chair.', cover: photo('1519710164239-da123dc03ef4'), date: '2026-08-21', link: '#' },
        { title: 'Our favourite autumn recipes', excerpt: 'Warm, simple dishes for cooler evenings.', cover: photo('1476718406336-bb5a9690ee2a'), date: '2026-08-09', link: '#' },
        { title: 'Travel light, travel happy', excerpt: 'A packing list that fits in one small bag.', cover: photo('1488646953014-85cb44e25828'), date: '2026-07-28', link: '#' },
      ],
    },
  },
  {
    label: 'Team members',
    source: {
      name: 'team',
      fields: [{ name: 'name', type: 'text' }, { name: 'role', type: 'text' }, { name: 'photo', type: 'image' }, { name: 'bio', type: 'longText' }],
      rows: [
        { name: 'Ana Silva', role: 'Founder', photo: photo('1494790108377-be9c29b29330'), bio: 'Started it all from a kitchen table.' },
        { name: 'Leo Chen', role: 'Designer', photo: photo('1500648767791-00dcc994a43e'), bio: 'Turns ideas into things people love.' },
        { name: 'Maya Patel', role: 'Engineer', photo: photo('1438761681033-6461ffad8d80'), bio: 'Keeps everything fast and reliable.' },
        { name: 'Sam Okafor', role: 'Support', photo: photo('1506794778202-cad84cf45f1d'), bio: 'Answers every message with a smile.' },
      ],
    },
  },
  {
    label: 'Reviews',
    source: {
      name: 'reviews',
      fields: [{ name: 'author', type: 'text' }, { name: 'rating', type: 'number' }, { name: 'quote', type: 'longText' }, { name: 'avatar', type: 'image' }],
      rows: [
        { author: 'Grace', rating: 5, quote: 'Exactly what I needed, and it arrived in two days.', avatar: photo('1544005313-94ddf0286df2') },
        { author: 'Tom', rating: 5, quote: 'Friendly people and great quality. Will order again.', avatar: photo('1507003211169-0a1dd7228f2d') },
        { author: 'Lina', rating: 4, quote: 'Lovely design, just wish there were more colours.', avatar: photo('1534528741775-53994a69daeb') },
      ],
    },
  },
  {
    label: 'Events',
    source: {
      name: 'events',
      fields: [{ name: 'title', type: 'text' }, { name: 'date', type: 'date' }, { name: 'place', type: 'text' }, { name: 'image', type: 'image' }, { name: 'tickets', type: 'url' }],
      rows: [
        { title: 'Spring market', date: '2026-04-18', place: 'Town square', image: photo('1488459716781-31db52582fe9'), tickets: '#' },
        { title: 'Jazz by the river', date: '2026-05-09', place: 'Riverside stage', image: photo('1511192336575-5a79af67a629'), tickets: '#' },
        { title: 'Night food fair', date: '2026-06-13', place: 'Old station', image: photo('1555939594-58d7cb561ad1'), tickets: '#' },
      ],
    },
  },
  { label: 'Empty', source: { name: 'items', fields: [{ name: 'title', type: 'text' }], rows: [] } },
]
