import { Link } from 'react-router-dom'
import { Icon } from '@/shared/ui'
import { BlockView, Rich } from './Blocks'
import type { Block, Topic } from './guideTypes'
import { findTopic, GROUPS, QUICK_STEPS, topicHref } from './guideContent'
import styles from './Guide.module.css'

const figureOf = (topic: Topic) => topic.blocks.find((block): block is Extract<Block, { kind: 'figure' }> => block.kind === 'figure')

/** One screen's worth: five steps, one line per topic (with a link to the details), and the shortcuts. */
export function QuickGuide() {
  const shortcuts = findTopic('shortcuts')!.topic
  return (
    <div className={styles.quick}>
      <section>
        <h2 className={styles.h2}>Start in five steps</h2>
        <ol className={styles.fiveSteps}>
          {QUICK_STEPS.map((step, index) => (
            <li key={step.title}>
              <span className={styles.num}>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <Link to={topicHref(step.topic)}>Details →</Link>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className={styles.h2}>The screen at a glance</h2>
        <BlockView block={{ kind: 'figure', src: '/guide/editor-map.svg', alt: 'The editor with five numbered areas', caption: '1 Toolbar · 2 Left rail · 3 Panel for the rail you chose · 4 Your page · 5 Settings of what you selected.' }} />
      </section>

      {GROUPS.filter((group) => group.id !== 'start').map((group) => (
        <section key={group.id} id={group.id}>
          <h2 className={styles.h2}><span className={styles.groupIcon}><Icon name={group.icon} size={18} /></span>{group.title}</h2>
          <div className={styles.cards}>
            {group.topics.map((topic) => (
              <article key={topic.id} className={styles.card}>
                {figureOf(topic) && <img className={styles.thumb} src={figureOf(topic)!.src} alt={figureOf(topic)!.alt} loading="lazy" />}
                <h3>{topic.title}</h3>
                <p><Rich text={topic.brief} /></p>
                <Link to={topicHref(topic.id)}>Details →</Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className={styles.h2}>Keyboard shortcuts</h2>
        {shortcuts.blocks.map((block, index) => <BlockView key={index} block={block} />)}
      </section>
    </div>
  )
}
