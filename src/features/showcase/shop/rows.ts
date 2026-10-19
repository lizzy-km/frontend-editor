import type { DataSource } from '@/features/editor/model/types'

/** A real snapshot of the Platzi Fake Store API (api.escuelajs.co): the editor shows it until the live address answers. */
export const PRODUCT_ROWS: DataSource['rows'] = [
  { id: 377, title: 'Majestic Mountain Graphic T-Shirt', price: 10, description: 'Elevate your wardrobe with this stylish black t-shirt featuring a striking monochrome mountain range graphic. Perfect for those who love the outdoors or want...', category: 'Clothes', image: 'https://i.imgur.com/QkIa5tT.jpeg' },
  { id: 378, title: 'Classic Black Hooded Sweatshirt', price: 79, description: 'Elevate your casual wardrobe with our Classic Black Hooded Sweatshirt. Made from high-quality, soft fabric that ensures comfort and durability, this hoodie...', category: 'Clothes', image: 'https://i.imgur.com/cSytoSD.jpeg' },
  { id: 379, title: 'Classic Comfort Drawstring Joggers', price: 79, description: 'Experience the perfect blend of comfort and style with our Classic Comfort Drawstring Joggers. Designed for a relaxed fit, these joggers feature a soft...', category: 'Clothes', image: 'https://i.imgur.com/mp3rUty.jpeg' },
  { id: 392, title: 'Sleek White & Orange Wireless Gaming Controller', price: 69, description: 'Elevate your gaming experience with this state-of-the-art wireless controller, featuring a crisp white base with vibrant orange accents. Designed for precision...', category: 'Electronics', image: 'https://i.imgur.com/ZANVnHE.jpeg' },
  { id: 393, title: 'Sleek Wireless Headphone & Inked Earbud Set', price: 44, description: 'Experience the fusion of style and sound with this sophisticated audio set featuring a pair of sleek, white wireless headphones offering crystal-clear sound...', category: 'Electronics', image: 'https://i.imgur.com/yVeIeDa.jpeg' },
  { id: 394, title: 'Sleek Comfort-Fit Over-Ear Headphones', price: 28, description: 'Experience superior sound quality with our Sleek Comfort-Fit Over-Ear Headphones, designed for prolonged use with cushioned ear cups and an adjustable, padded...', category: 'Electronics', image: 'https://i.imgur.com/SolkFEB.jpeg' },
  { id: 402, title: 'Mid-Century Modern Wooden Dining Table', price: 24, description: 'Elevate your dining room with this sleek Mid-Century Modern dining table, featuring an elegant walnut finish and tapered legs for a timeless aesthetic. Its...', category: 'Furniture', image: 'https://i.imgur.com/DMQHGA0.jpeg' },
  { id: 403, title: 'Sleek Modern Leather Sofa', price: 53, description: 'Enhance the elegance of your living space with our Sleek Modern Leather Sofa. Designed with a minimalist aesthetic, it features clean lines and a luxurious...', category: 'Furniture', image: 'https://i.imgur.com/Qphac99.jpeg' },
  { id: 404, title: 'Elegant Golden-Base Stone Top Dining Table', price: 66, description: 'Elevate your dining space with this luxurious table, featuring a sturdy golden metal base with an intricate rod design that provides both stability and chic...', category: 'Furniture', image: 'https://i.imgur.com/NWIJKUj.jpeg' },
  { id: 409, title: 'Futuristic Holographic Soccer Cleats', price: 39, description: 'Step onto the field and stand out from the crowd with these eye-catching holographic soccer cleats. Designed for the modern player, these cleats feature a...', category: 'Shoes', image: 'https://i.imgur.com/qNOjJje.jpeg' },
  { id: 410, title: 'Rainbow Glitter High Heels', price: 39, description: 'Step into the spotlight with these eye-catching rainbow glitter high heels. Designed to dazzle, each shoe boasts a kaleidoscope of shimmering colors that catch...', category: 'Shoes', image: 'https://i.imgur.com/62gGzeF.jpeg' },
  { id: 411, title: 'Chic Summer Denim Espadrille Sandals', price: 33, description: 'Step into summer with style in our denim espadrille sandals. Featuring a braided jute sole for a classic touch and adjustable denim straps for a snug fit...', category: 'Shoes', image: 'https://i.imgur.com/9qrmE1b.jpeg' },
  { id: 419, title: 'Sleek Futuristic Electric Bicycle', price: 22, description: 'This modern electric bicycle combines style and efficiency with its unique design and top-notch performance features. Equipped with a durable frame, enhanced...', category: 'Miscellaneous', image: 'https://i.imgur.com/BG8J0Fj.jpg' },
  { id: 420, title: 'Sleek All-Terrain Go-Kart', price: 37, description: 'Experience the thrill of outdoor adventures with our Sleek All-Terrain Go-Kart, featuring a durable frame, comfortable racing seat, and robust, large-tread...', category: 'Miscellaneous', image: 'https://i.imgur.com/Ex5x3IU.jpg' },
  { id: 421, title: 'Radiant Citrus Eau de Parfum', price: 73, description: 'Indulge in the essence of summer with this vibrant citrus-scented Eau de Parfum. Encased in a sleek glass bottle with a bold orange cap, this fragrance...', category: 'Miscellaneous', image: 'https://i.imgur.com/xPDwUb3.jpg' },
]

/** The five real categories of the same API. */
export const CATEGORY_ROWS: DataSource['rows'] = [
  { id: 24, name: 'Clothes', image: 'https://i.imgur.com/QkIa5tT.jpeg' },
  { id: 25, name: 'Electronics', image: 'https://i.imgur.com/ZANVnHE.jpeg' },
  { id: 26, name: 'Furniture', image: 'https://i.imgur.com/Qphac99.jpeg' },
  { id: 27, name: 'Shoes', image: 'https://i.imgur.com/qNOjJje.jpeg' },
  { id: 28, name: 'Miscellaneous', image: 'https://i.imgur.com/BG8J0Fj.jpg' },
]
