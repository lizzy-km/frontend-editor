import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@/shared/ui'
import { BlockView } from './Blocks'
import { searchGuide } from './guideContent'
import styles from './Guide.module.css'

/** The detailed guide: a table of contents that follows you, search, and every topic in full. */
export function FullGuide({ hash }: { hash: string }) {
  const [query, setQuery] = useState('')
  const groups = useMemo(() => searchGuide(query), [query])
  const [active, setActive] = useState('')

  // Open on the topic the link pointed at (/guide/full#layouts).
  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView({ block: 'start' })
  }, [hash])

  // Highlight the topic being read.
  useEffect(() => {
    const watcher = new IntersectionObserver((entries) => {
      const seen = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (seen) setActive(seen.target.id)
    }, { rootMargin: '-90px 0px -65% 0px' })
    document.querySelectorAll('[data-topic]').forEach((element) => watcher.observe(element))
    return () => watcher.disconnect()
  }, [groups])

  const count = groups.reduce((sum, group) => sum + group.topics.length, 0)
  return (
    <div className={styles.full}>
      <nav className={styles.toc} aria-label="Guide contents">
        <label className={styles.search}>
          <Icon name="eye" size={16} />
          <input type="search" aria-label="Search the guide" placeholder="Search the guide…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        {groups.map((group) => (
          <div key={group.id} className={styles.tocGroup}>
            <p><Icon name={group.icon} size={14} /> {group.title}</p>
            {group.topics.map((topic) => (
              <a key={topic.id} href={`#${topic.id}`} className={active === topic.id ? styles.tocOn : ''} onClick={() => setActive(topic.id)}>{topic.title}</a>
            ))}
          </div>
        ))}
      </nav>
      <div className={styles.topics}>
        {query && <p className={styles.found}>{count ? `${count} ${count === 1 ? 'topic' : 'topics'} for “${query}”.` : `Nothing found for “${query}”. Try fewer or simpler words.`} <button type="button" onClick={() => setQuery('')}>Show everything</button></p>}
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className={styles.groupTitle}><span className={styles.groupIcon}><Icon name={group.icon} size={20} /></span>{group.title}</h2>
            <p className={styles.groupIntro}>{group.intro}</p>
            {group.topics.map((topic) => (
              <article key={topic.id} id={topic.id} data-topic className={styles.topic}>
                <h3>{topic.title}</h3>
                {topic.blocks.map((block, index) => <BlockView key={index} block={block} />)}
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
