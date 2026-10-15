import type { IconName } from '@/shared/ui'

/**
 * The user guide is data: groups of topics made of simple blocks. Text may use **bold**
 * for names on screen. Write for someone who has never made a website.
 */
export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'steps'; items: string[] }
  | { kind: 'list'; items: string[] }
  | { kind: 'tip'; text: string }
  | { kind: 'note'; text: string }
  | { kind: 'figure'; src: string; alt: string; caption: string }
  | { kind: 'table'; head: string[]; rows: string[][] }

/** `summary` is a few words (search results); `brief` is the one-line how-to the Quick guide shows. */
export type Topic = { id: string; title: string; summary: string; brief: string; blocks: Block[] }
export type Group = { id: string; title: string; icon: IconName; intro: string; topics: Topic[] }
