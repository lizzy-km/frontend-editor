import { rowTypeName } from '@/features/editor/model/data'
import type { DataSource } from '@/features/editor/model/types'

/** src/data/handlers.ts: the functions data cards call when clicked. Fill in what each should do. */
export function handlerFiles(handlers: Map<string, DataSource>): Record<string, string> {
  if (!handlers.size) return {}
  const types = [...new Set([...handlers.values()].map((source) => rowTypeName(source.name)))]
  return {
    'src/data/handlers.ts': [
      `import type { ${types.join(', ')} } from './types'`, '',
      '/** Called when a card is clicked. Replace the body with what you need: open a drawer, add to the cart, navigate… */',
      ...[...handlers].flatMap(([name, source]) => [
        `export function ${name}(row: ${rowTypeName(source.name)}): void {`,
        `  console.info('${name}', row)`,
        '}', '',
      ]),
    ].join('\n'),
  }
}
