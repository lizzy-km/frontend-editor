import { describe, expect, it } from 'vitest'
import { ANIMATION_BOX_HTML } from '@/features/editor/model/animations'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildReactProject } from './buildReactProject'

describe('React animations (Motion)', () => {
  const files = buildReactProject(parseHtmlDocument(`<body>${ANIMATION_BOX_HTML}<h1 data-fe-animate="zoom-in" data-fe-trigger="hover">Hi</h1></body>`))

  it('adds Motion and the ready-made helpers', () => {
    expect(JSON.parse(files['package.json']!).dependencies).toHaveProperty('motion')
    expect(files['src/components/ui/animation.ts']).toContain('export function animation(options: AnimationOptions): MotionProps')
    expect(files['src/components/ui/AnimateBox.tsx']).toContain('<motion.div className={className} {...animation(options)}>')
  })

  it('animates elements with motion.* and staggers children one by one', () => {
    const box = files['src/components/AnimatedBox.tsx']!
    expect(box).toContain("import { motion } from 'motion/react'")
    expect(box).toContain("<motion.div className=\"fe-")
    expect(box).toContain("{...animation({ effect: 'fade-up', trigger: 'scroll', duration: 0.7, stagger: 0.12 })}")
    expect(box).toContain("<motion.h2 {...animationItem('fade-up', { duration: 0.7 })}>")
    expect(box).toContain('</motion.div>')
    expect(box).not.toContain('data-fe-')
  })

  it('leaves projects without animations alone', () => {
    const plain = buildReactProject(parseHtmlDocument('<body><h1>Hi</h1></body>'))
    expect(plain['src/components/ui/animation.ts']).toBeUndefined()
    expect(JSON.parse(plain['package.json']!).dependencies).not.toHaveProperty('motion')
  })
})
