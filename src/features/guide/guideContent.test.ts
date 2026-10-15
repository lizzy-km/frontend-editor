import { describe, expect, it } from 'vitest'
import { findTopic, GROUPS, searchGuide } from './guideContent'

const topics = GROUPS.flatMap((group) => group.topics)

describe('guide content', () => {
  it('has unique topic ids and a brief for each topic', () => {
    const ids = topics.map((topic) => topic.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const topic of topics) expect(topic.brief.length, topic.id).toBeGreaterThan(10)
  })
  it('finds topics by words and by id', () => {
    expect(searchGuide('').length).toBe(GROUPS.length)
    expect(searchGuide('zzzqqq')).toEqual([])
    expect(searchGuide('pop-up').flatMap((group) => group.topics).map((topic) => topic.id)).toContain('popups')
    expect(findTopic('fix-problems')?.topic.title).toBeTruthy()
  })
})
