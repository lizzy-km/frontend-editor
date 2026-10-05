/** A ready-made Part 1: what the page is about, in the person's own words. */
export type PromptPreset = {
  id: string
  /** Chip label, everyday words. */
  label: string
  /** Emoji shown on the chip. */
  icon: string
  /** The page brief (Part 1); people edit it before copying. */
  brief: string
}
