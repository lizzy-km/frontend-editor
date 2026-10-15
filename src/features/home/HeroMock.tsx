import { Icon } from '@/shared/ui'
import styles from './HeroMock.module.css'

/** A small, made-up picture of the editor for the home page (not a screenshot, so it is always sharp and in the app's colors). */
export function HeroMock() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.window}>
        <div className={styles.bar}>
          <span /><span /><span />
          <b>My bakery · Home</b>
          <i className={styles.pill}><Icon name="desktop" size={12} /> Computer</i>
        </div>
        <div className={styles.body}>
          <div className={styles.rail}>
            {(['layers', 'plus', 'globe', 'sun', 'box', 'code'] as const).map((name, index) => (
              <span key={name} className={index === 0 ? styles.railOn : ''}><Icon name={name} size={15} /></span>
            ))}
          </div>
          <div className={styles.canvas}>
            <div className={styles.page}>
              <div className={styles.menu}><b>Sunny Bakery</b><span>Menu</span><span>Shop</span><span className={styles.login}>Log in</span></div>
              <div className={styles.selected}>
                <em>Heading</em>
                <h3>Fresh bread, every single morning.</h3>
                <i className={styles.h} style={{ left: -4, top: -4 }} /><i className={styles.h} style={{ right: -4, top: -4 }} />
                <i className={styles.h} style={{ left: -4, bottom: -4 }} /><i className={styles.h} style={{ right: -4, bottom: -4 }} />
              </div>
              <p>Baked small, baked slow, delivered warm.</p>
              <div className={styles.cards}>
                {[0, 1, 2].map((n) => (
                  <div key={n} className={styles.card}><span className={styles[`pic${n}`]} /><b /><s /></div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.tabs}><b>Design</b><span>Actions</span><span>More</span></div>
            <p>Text</p>
            <div className={styles.row}><span>Size</span><u><i style={{ width: '62%' }} /></u></div>
            <div className={styles.row}><span>Color</span><em className={styles.swatch} /></div>
            <div className={styles.row}><span>Max lines</span><code>2 lines</code></div>
            <p>Background</p>
            <div className={styles.swatches}>{['#e8573a', '#ffb347', '#7c5cff', '#1fb6a6', '#2a2420'].map((c) => <i key={c} style={{ background: c }} />)}</div>
          </div>
        </div>
      </div>
      <span className={`${styles.chip} ${styles.chipA}`}><Icon name="lock" size={14} /> Log in page</span>
      <span className={`${styles.chip} ${styles.chipB}`}><Icon name="box" size={14} /> /product/:id</span>
      <span className={`${styles.chip} ${styles.chipC}`}><Icon name="check" size={14} /> Form checks itself</span>
      <span className={`${styles.chip} ${styles.chipD}`}><Icon name="code" size={14} /> React project</span>
    </div>
  )
}
