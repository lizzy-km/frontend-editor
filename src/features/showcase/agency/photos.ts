/** Photos already used elsewhere in the editor (all checked to load). */
const IDS = {
  desk: '1561070791-2526d30994b5', studio: '1522202176988-66273c2fd55f', office: '1497366216548-37526070297c', building: '1486406146926-c627a92ad1ab',
  craft: '1558655146-9f40138edfeb', color: '1618005182384-a83a8bd57fbe', neon: '1550745165-9bc0b252726f', print: '1545235617-9465d2a55698',
  shop: '1523275335684-37898b6baf30', coast: '1500530855697-b586d89ba3ee', laptop: '1509440159596-0249088772ff',
  woman: '1494790108377-be9c29b29330', man: '1507003211169-0a1dd7228f2d', woman2: '1438761681033-6461ffad8d80', man2: '1472099645785-5658abf4ff4e', woman3: '1573496359142-b8d87734a5a2',
} as const

export type PhotoName = keyof typeof IDS

/** The https address of a known photo, cropped to a size. */
export const photo = (name: PhotoName, width = 1000, height = 0): string =>
  `https://images.unsplash.com/photo-${IDS[name]}?auto=format&fit=crop&w=${width}${height ? `&h=${height}` : ''}&q=80`
