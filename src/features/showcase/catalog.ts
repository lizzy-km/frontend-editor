import { agencyShowcase } from './agency'
import { cafeShowcase } from './cafe'
import { membersShowcase } from './members'
import { shopShowcase } from './shop'
import type { Showcase } from './types'

/** The finished example sites people can start from, in the order they are shown. */
export const SHOWCASES: Showcase[] = [shopShowcase, cafeShowcase, agencyShowcase, membersShowcase]
