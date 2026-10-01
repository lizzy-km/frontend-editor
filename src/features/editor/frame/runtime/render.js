/*
 * Frame runtime — render. Keeps the frame's DOM in sync with the editor's
 * model: the page arrives already rendered (with data-fe-id on elements),
 * then only changed nodes are patched, exactly like the old in-app renderer.
 */
;(function (fe) {
  var SVG_NS = 'http://www.w3.org/2000/svg'
  /** Nodes built during the current sync are already up to date. */
  var builtNow = new Set()

  /** Links one element's text children (by position) to their model nodes. */
  function linkTexts(node, element) {
    var texts = Array.prototype.filter.call(element.childNodes, function (child) { return child.nodeType === 3 })
    var textIndex = 0
    node.children.forEach(function (childId) {
      var child = fe.nodes[childId]
      if (!child || child.kind !== 'text') return
      var text = texts[textIndex++]
      if (text) fe.dom.set(childId, text)
    })
  }

  /** Links model nodes to the DOM the browser built from the page source (one pass). */
  function index() {
    fe.dom.set(fe.rootId, document.body)
    document.querySelectorAll('[data-fe-id]').forEach(function (element) {
      fe.dom.set(element.getAttribute('data-fe-id'), element)
    })
    fe.dom.forEach(function (element, id) {
      var node = fe.nodes[id]
      if (node && node.kind === 'element') linkTexts(node, element)
    })
  }

  fe.start = function () {
    var model = JSON.parse(document.getElementById('fe-model').textContent)
    fe.rootId = model.rootId
    fe.nodes = model.nodes
    document.body.setAttribute('data-fe-id', fe.rootId)
    index()
  }

  function setAttributes(element, oldAttrs, newAttrs) {
    Object.keys(oldAttrs).forEach(function (name) { if (!(name in newAttrs)) element.removeAttribute(name) })
    Object.keys(newAttrs).forEach(function (name) {
      if (oldAttrs[name] === newAttrs[name] && element.hasAttribute(name)) return
      try { element.setAttribute(name, newAttrs[name]) } catch (e) { /* invalid name from broken HTML */ }
    })
  }

  function create(id, parentElement) {
    var node = fe.nodes[id]
    if (!node) return null
    if (node.kind === 'text') {
      var text = document.createTextNode(node.text)
      fe.dom.set(id, text)
      builtNow.add(id)
      return text
    }
    var inSvg = parentElement.namespaceURI === SVG_NS && parentElement.localName !== 'foreignObject'
    var element = node.tag === 'svg' || inSvg ? document.createElementNS(SVG_NS, node.tag) : document.createElement(node.tag)
    element.setAttribute('data-fe-id', id)
    fe.dom.set(id, element)
    builtNow.add(id)
    patchElement(node, element, null)
    return element
  }

  function syncChildren(node, element) {
    var wanted = node.children.map(function (id) { return fe.dom.get(id) || create(id, element) }).filter(Boolean)
    var current = element.childNodes
    var same = current.length === wanted.length && wanted.every(function (dom, i) { return current[i] === dom })
    if (!same) element.replaceChildren.apply(element, wanted)
  }

  function patchElement(node, element, old) {
    if (!old || old.attrs !== node.attrs) setAttributes(element, old ? old.attrs : {}, node.attrs)
    if (Boolean(old && old.hidden) !== Boolean(node.hidden)) element.toggleAttribute('data-fe-hidden', Boolean(node.hidden))
    if (!old || old.children !== node.children) syncChildren(node, element)
  }

  function patch(id, old) {
    var node = fe.nodes[id]
    var dom = fe.dom.get(id)
    if (!node || !dom) return // not on screen yet: its parent will create it
    if (node.kind === 'text') {
      if (dom.data !== node.text) dom.data = node.text
    } else if (old && old.kind === 'element' && old.tag !== node.tag) {
      fe.dom.delete(id)
      var fresh = create(id, dom.parentElement || document.body)
      if (fresh) dom.replaceWith(fresh)
    } else {
      patchElement(node, dom, old && old.kind === 'element' ? old : null)
    }
  }

  /** { changed: {id: node}, removed: [id] } from the editor after every edit. */
  fe.handlers.sync = function (payload) {
    var changed = payload.changed || {}
    var previous = {}
    Object.keys(changed).forEach(function (id) { previous[id] = fe.nodes[id]; fe.nodes[id] = changed[id] })
    Object.keys(changed).forEach(function (id) { if (!builtNow.has(id)) patch(id, previous[id]) })
    builtNow.clear()
    ;(payload.removed || []).forEach(function (id) {
      var dom = fe.dom.get(id)
      if (dom && id !== fe.rootId && dom.parentNode) dom.parentNode.removeChild(dom)
      fe.dom.delete(id)
      delete fe.nodes[id]
    })
  }

  /** New page CSS and/or new "your edits" CSS. */
  fe.handlers.css = function (payload) {
    if (typeof payload.page === 'string') document.getElementById('fe-page-css').textContent = payload.page
    if (typeof payload.edits === 'string') document.getElementById('fe-edits-css').textContent = payload.edits
  }
})(window.__fe)
