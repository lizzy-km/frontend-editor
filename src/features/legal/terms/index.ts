import type { LegalDoc } from '../types'
import { TERMS_PART_1 } from './part1'
import { TERMS_PART_2 } from './part2'
import { TERMS_PART_3 } from './part3'

/** The Terms of Use (sections that depend on paid plans or the marketplace only show while those are on). */
export const TERMS: LegalDoc = {
  title: 'Terms of Use',
  intro: 'These are the rules for using Tweak. We wrote them in plain words. The short version: you keep what you make, you are responsible for what you publish, please do not misuse the Service, and we provide it as it is.',
  sections: [...TERMS_PART_1, ...TERMS_PART_2, ...TERMS_PART_3],
}
