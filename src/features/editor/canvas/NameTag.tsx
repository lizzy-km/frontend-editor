import { Label, Tag, Text } from 'react-konva'
import type { Box } from './geometry'
import { OVERLAY } from './overlayTheme'

type Props = { box: Box; text: string; faded?: boolean }

/** Small label above an outline, e.g. 'Button “Get started”'. */
export function NameTag({ box, text, faded }: Props) {
  const above = box.y > 24
  return (
    <Label x={box.x} y={above ? box.y - 22 : box.y + 2} opacity={faded ? 0.8 : 1} listening={false}>
      <Tag fill={OVERLAY.accent} cornerRadius={5} />
      <Text text={text} fill={OVERLAY.tagText} fontSize={12} fontStyle="600" padding={4} fontFamily="Inter, system-ui, sans-serif" />
    </Label>
  )
}
