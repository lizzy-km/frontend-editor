import type { DataSource } from '@/features/editor/model/types'
import { photo, type PhotoName } from './photos'

const project = (id: number, title: string, client: string, category: string, year: number, image: PhotoName, summary: string) =>
  ({ id, title, client, category, year, image: photo(image, 900, 700), summary })

/** The studio's projects, one row each (the Work page and the Project page read them). */
export const PROJECTS: Omit<DataSource, 'id'> = {
  name: 'projects',
  fields: [
    { name: 'id', type: 'number' }, { name: 'title', type: 'text' }, { name: 'client', type: 'text' }, { name: 'category', type: 'text' },
    { name: 'year', type: 'number' }, { name: 'image', type: 'image' }, { name: 'summary', type: 'longText' },
  ],
  rows: [
    project(1, 'Harbour & Pine', 'Harbour & Pine Coffee', 'Branding', 2026, 'craft', 'A new name plate, cup and shopfront for a roaster opening its fifth cafe. We drew a quiet, confident mark and a colour palette taken from the morning sea.'),
    project(2, 'Fieldnote', 'Fieldnote Journals', 'Web', 2026, 'laptop', 'An online shop for hand-bound notebooks. Fast pages, big photographs and a checkout that takes under a minute.'),
    project(3, 'Orbit Ledger', 'Orbit Finance', 'Product', 2025, 'desk', 'A bookkeeping app for freelancers. We simplified twelve screens into four and cut the time to send an invoice in half.'),
    project(4, 'Lumen Festival', 'Lumen Arts Trust', 'Motion', 2025, 'neon', 'Opening titles, posters in motion and a looping light show for a three-day arts festival in the old docks.'),
    project(5, 'Terrace', 'Terrace Living', 'Branding', 2025, 'building', 'Identity and signage for a group of apartment buildings: calm colours, clear numbers, friendly words.'),
    project(6, 'Kite Studio', 'Kite Yoga', 'Web', 2025, 'studio', 'A booking site for a yoga studio. Classes, teachers and a simple membership page, all editable by the studio themselves.'),
    project(7, 'Plume', 'Plume Stationery', 'Branding', 2024, 'print', 'A refresh for a stationery maker: letterpress cards, a hand-lettered wordmark and packaging that is a gift in itself.'),
    project(8, 'Tidewatch', 'Coastline Trust', 'Product', 2024, 'coast', 'A phone app that tells walkers when the tide is safe. Clear colours, large type and no sign-up needed.'),
    project(9, 'Common Room', 'Common Room Cowork', 'Motion', 2024, 'office', 'A thirty second brand film and a set of animated posters for a neighbourhood coworking space.'),
  ],
}
