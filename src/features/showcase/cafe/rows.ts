import type { DataSource } from '@/features/editor/model/types'
import { PHOTO, PICS } from './css'

type Dish = [name: string, description: string, price: number, category: string, picture: keyof typeof PICS, vegetarian: boolean]

const DISHES: Dish[] = [
  ['Maple pancake stack', 'Three buttermilk pancakes, whipped butter and warm Vermont maple syrup.', 13, 'Breakfast', 'pancakes', true],
  ['Blueberry hotcakes', 'Fluffy hotcakes with lemon curd, fresh blueberries and a dusting of sugar.', 14, 'Breakfast', 'blueberry', true],
  ['Smashed avocado on rye', 'Our own rye toast, avocado, soft-boiled egg, chilli flakes and lime.', 12, 'Breakfast', 'eggToast', true],
  ['Brioche French toast', 'Thick brioche slices, caramelised banana, blueberries and cinnamon cream.', 14, 'Breakfast', 'frenchToast', true],
  ['Rye and butter plate', 'Warm seeded rye, cultured butter and house plum jam. Simple and good.', 7, 'Breakfast', 'bread', true],
  ['Butter croissant', 'Baked every morning with French butter, crisp outside and soft inside.', 5, 'Breakfast', 'croissant', true],
  ['Harvest grain bowl', 'Roasted chicken, sweetcorn, red cabbage, egg and a sesame dressing.', 16, 'Lunch', 'bowl', false],
  ['Smoked cheddar melt', 'Toasted sourdough with smoked cheddar, pickles and a garlic dip.', 11, 'Lunch', 'sandwich', true],
  ['Maple burger', 'Aged beef patty, cheddar, tomato, pickles and maple onion jam on a seeded bun.', 17, 'Lunch', 'burger', false],
  ['Garden salad plate', 'Crisp leaves, radish, cherry tomato, avocado and a lemon-herb dressing.', 13, 'Lunch', 'salad', true],
  ['Wood-fired pizza', 'Caramelised onion, roast chicken, mozzarella and fresh basil.', 18, 'Lunch', 'pizza', false],
  ['Market veggie platter', 'Seasonal vegetables, hummus, grains and a boiled egg. Ask for it vegan.', 15, 'Lunch', 'platter', true],
  ['Flat white', 'Double espresso with silky steamed milk from a local dairy.', 4, 'Drinks', 'pour', true],
  ['Maple latte', 'Our house latte sweetened with a spoon of dark maple syrup.', 5, 'Drinks', 'lattes', true],
  ['Glazed ring donut', 'Yeast donut with chocolate glaze and sprinkles. The kids will fight you for it.', 4, 'Dessert', 'donuts', true],
  ['Rye chocolate tart', 'Dark chocolate in a rye biscuit crust with sea salt and cream.', 8, 'Dessert', 'plated', true],
]

/** The menu as a data source: name, description, price, category, picture and a vegetarian flag. */
export const menuSource = (): Omit<DataSource, 'id'> => ({
  name: 'menu',
  fields: [{ name: 'name', type: 'text' }, { name: 'description', type: 'longText' }, { name: 'price', type: 'number' }, { name: 'category', type: 'text' }, { name: 'image', type: 'image' }, { name: 'vegetarian', type: 'boolean' }],
  rows: DISHES.map(([name, description, price, category, picture, vegetarian]) => ({ name, description, price, category, image: PHOTO(PICS[picture], 800), vegetarian })),
})

type Event = [title: string, date: string, text: string, picture: keyof typeof PICS]

const EVENTS: Event[] = [
  ['Rye baking morning', 'Sat 7 Nov, 9:00', 'Learn to shape and score a rye loaf with our head baker. Everyone takes a loaf home.', 'bread'],
  ['Latte art for beginners', 'Sun 15 Nov, 10:30', 'Pour your first heart with a barista. Coffee and a pastry are included.', 'lattes'],
  ['Long-table supper', 'Fri 20 Nov, 18:30', 'Four shared courses from the autumn menu, at one long table by the window.', 'dining'],
  ['Pancake Sunday', 'Sun 29 Nov, 8:30', 'All-you-can-eat pancakes with maple syrup and fruit. Pay what you like, we give it to the food bank.', 'pancakes'],
]

/** Upcoming events as a data source (shown as cards that open a pop-up). */
export const eventsSource = (): Omit<DataSource, 'id'> => ({
  name: 'events',
  fields: [{ name: 'title', type: 'text' }, { name: 'when', type: 'text' }, { name: 'about', type: 'longText' }, { name: 'image', type: 'image' }],
  rows: EVENTS.map(([title, when, about, picture]) => ({ title, when, about, image: PHOTO(PICS[picture], 800) })),
})
