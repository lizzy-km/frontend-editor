import type { LegalDoc } from '../types'
import { PRIVACY_PART_1 } from './part1'
import { PRIVACY_PART_2 } from './part2'
import { PRIVACY_PART_3 } from './part3'

/** The Privacy Policy. */
export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  intro: 'Your pages and your data are yours. This policy says what we collect, why, who else handles it, how long we keep it, and what you can do about it, in plain words.',
  sections: [...PRIVACY_PART_1, ...PRIVACY_PART_2, ...PRIVACY_PART_3],
}
