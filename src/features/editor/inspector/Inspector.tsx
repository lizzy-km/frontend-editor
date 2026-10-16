import { Icon } from '@/shared/ui'
import { getElement } from '../model/tree/queries'
import { collectTextPieces, isTextEditable } from '../model/tree/textRules'
import { dataAround } from '../model/dataRecords'
import { isPageNode } from '../model/pages'
import { isElement, type ElementNode, type NodeMap } from '../model/types'
import { useDocStore } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { useViewStore } from '../store/view.store'
import type { SectionContext } from './fieldTypes'
import styles from './Inspector.module.css'
import { InspectorHeader } from './InspectorHeader'
import { hasActions, InspectorTabs } from './InspectorTabs'
import { AdvancedSection } from './sections/AdvancedSection'
import { FormFieldSection, HAS_PLACEHOLDER } from './sections/FormFieldSection'
import { ClickSection, PopupSection } from './sections/ClickSection'
import { FormSection } from './sections/FormSection'
import { AnimationSection } from './sections/AnimationSection'
import { DataSection } from './sections/DataSection'
import { GoToPageSection } from './sections/GoToPageSection'
import { ShowDataSection } from './sections/ShowDataSection'
import { MODAL_ATTR } from '../model/popups'
import { WhoSection } from './sections/WhoSection'
import { LinkSection } from './sections/LinkSection'
import { PageSection } from './sections/PageSection'
import { PictureSection } from './sections/PictureSection'
import { VisibilitySection } from './sections/VisibilitySection'
import { WordsSection } from './sections/WordsSection'
import { ReuseSection } from './sections/ReuseSection'
import { WidgetSection } from './widgets/WidgetSection'
import { StyleSections } from './StyleSections'
import { useComputedStyle } from './useComputedStyle'

function buildContext(node: ElementNode, nodes: NodeMap): SectionContext {
  return {
    node,
    nodes,
    hasText: collectTextPieces(nodes, node.id).length > 0,
    isTextEditable: isTextEditable(nodes, node.id),
    elementChildren: node.children.filter((id) => isElement(nodes[id])).length,
  }
}

/** Shown when nothing is selected: how to get started. */
function NothingSelected() {
  return (
    <div className={styles.empty}>
      <Icon name="sparkle" size={28} />
      <h3>Click anything on your page</h3>
      <p>Its settings will show up here.</p>
      <ul className={styles.tips}>
        <li><Icon name="pencil" size={16} /> Double-click text to change the words</li>
        <li><Icon name="grip" size={16} /> Drag things to move them</li>
        <li><Icon name="phone" size={16} /> Switch to Phone to fix the mobile look</li>
        <li><Icon name="undo" size={16} /> Made a mistake? <kbd>Ctrl</kbd>+<kbd>Z</kbd></li>
      </ul>
    </div>
  )
}

/** The right-hand settings panel for the selected element. */
export function Inspector() {
  const selectedId = useSelectionStore((state) => state.selectedId)
  const nodes = useDocStore((state) => state.doc.nodes)
  const rootId = useDocStore((state) => state.doc.rootId)
  const breakpoint = useViewStore((state) => state.breakpoint)
  const chosenTab = useViewStore((state) => state.inspectorTab)
  const setTab = useViewStore((state) => state.setInspectorTab)
  const computed = useComputedStyle(selectedId)
  const node = getElement(nodes, selectedId)

  if (!node) return <NothingSelected />
  const context = buildContext(node, nodes)
  const overrides = node.styles[breakpoint] ?? {}
  const inData = dataAround(nodes, node.id)

  const canAct = node.id !== rootId && !isPageNode(node)
  const tab = chosenTab === 'actions' && !canAct ? 'design' : chosenTab

  return (
    <div className={styles.panel}>
      <InspectorHeader node={node} nodes={nodes} />
      <InspectorTabs tab={tab} onChange={setTab} actions={canAct} actionsUsed={hasActions(node)} />
      {tab === 'design' && (
        <>
          {node.id === rootId && <PageSection />}
          {context.hasText && !context.isTextEditable && <WordsSection id={node.id} />}
          {node.tag === 'img' && <PictureSection node={node} />}
          {computed && <StyleSections id={node.id} context={context} computed={computed} overrides={overrides} />}
        </>
      )}
      {tab === 'actions' && (
        <>
          <ReuseSection key={`reuse-${node.id}`} node={node} />
          <WidgetSection nodeId={node.id} />
          {node.tag === 'a' && <LinkSection node={node} />}
          {node.tag !== 'a' && <GoToPageSection key={`go-${node.id}`} node={node} />}
          {MODAL_ATTR in node.attrs && <PopupSection key={`popup-${node.id}`} node={node} />}
          <ClickSection key={`click-${node.id}`} node={node} />
          <DataSection key={`wire-${node.id}`} node={node} />
          {inData && <ShowDataSection key={`data-${node.id}`} node={node} box={inData} />}
          {node.tag === 'form' && <FormSection key={`form-${node.id}`} node={node} />}
          {HAS_PLACEHOLDER.has(node.tag) && <FormFieldSection key={`field-${node.id}`} node={node} />}
          <WhoSection key={`who-${node.id}`} node={node} />
          <AnimationSection key={`animation-${node.id}`} node={node} />
        </>
      )}
      {tab === 'more' && (
        <>
          {computed && node.id !== rootId && <VisibilitySection node={node} computedDisplay={computed.display ?? ''} />}
          <AdvancedSection node={node} />
        </>
      )}
    </div>
  )
}
