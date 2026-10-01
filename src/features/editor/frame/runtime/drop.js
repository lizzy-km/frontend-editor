/*
 * Frame runtime — drag & drop. Where would a dragged element land?
 * Same rules as before: over a sibling -> reorder; over a container -> nest
 * between its children; over a leaf (text, picture, button) -> before/after it.
 */
;(function (fe) {
  var LEAF_TAGS = ['img', 'input', 'textarea', 'select', 'br', 'hr', 'video', 'iframe', 'svg',
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'span', 'strong', 'em', 'label', 'i']

  function isInside(id, ancestorId) {
    for (var current = id; current; current = fe.nodes[current] && fe.nodes[current].parentId) {
      if (current === ancestorId) return true
    }
    return false
  }

  function isHorizontal(element) {
    var style = getComputedStyle(element)
    if (style.display.indexOf('flex') !== -1) return style.flexDirection.indexOf('column') !== 0
    if (style.display.indexOf('grid') !== -1) return style.gridTemplateColumns.split(' ').length > 1
    return false
  }

  /** Is `hitId` one of the dragged element's siblings (or inside one)? */
  function overSibling(hitId, draggedId) {
    var siblingParent = fe.nodes[draggedId] && fe.nodes[draggedId].parentId
    for (var id = hitId; id; id = fe.nodes[id] && fe.nodes[id].parentId) {
      var parentId = fe.nodes[id] && fe.nodes[id].parentId
      if (parentId === siblingParent) return id !== draggedId
    }
    return false
  }

  function childBoxes(parentId, draggedId) {
    var parent = fe.nodes[parentId]
    if (!parent || parent.kind !== 'element') return []
    var list = []
    parent.children.forEach(function (id, index) {
      if (id === draggedId || !fe.nodes[id] || fe.nodes[id].kind !== 'element') return
      var box = fe.box(id)
      if (box) list.push({ index: index, box: box })
    })
    return list
  }

  function slotInside(parentId, draggedId, x, y) {
    var parentElement = fe.element(parentId)
    if (!parentElement) return null
    var horizontal = isHorizontal(parentElement)
    var children = childBoxes(parentId, draggedId)
    var parentBox = fe.box(parentId)
    if (children.length === 0) {
      var count = fe.nodes[parentId].children.length
      return { parentId: parentId, index: count, indicator: { x: parentBox.x, y: parentBox.y + parentBox.height / 2 - 1, width: parentBox.width, height: 3 } }
    }
    var pointer = horizontal ? x : y
    var before = children.find(function (child) {
      return pointer < (horizontal ? child.box.x + child.box.width / 2 : child.box.y + child.box.height / 2)
    })
    var edge = before || children[children.length - 1]
    var index = before ? before.index : edge.index + 1
    var at = before ? (horizontal ? edge.box.x : edge.box.y) : (horizontal ? edge.box.x + edge.box.width : edge.box.y + edge.box.height)
    var indicator = horizontal
      ? { x: at - 1.5, y: edge.box.y, width: 3, height: edge.box.height }
      : { x: edge.box.x, y: at - 1.5, width: edge.box.width, height: 3 }
    return { parentId: parentId, index: index, indicator: indicator }
  }

  fe.handlers.drop = function (payload) {
    var hitId = fe.handlers.hit(payload)
    if (!hitId || isInside(hitId, payload.draggedId)) return null
    var hit = fe.nodes[hitId]
    if (!hit || hit.kind !== 'element') return null
    var containerId = overSibling(hitId, payload.draggedId)
      ? fe.nodes[payload.draggedId].parentId
      : LEAF_TAGS.indexOf(hit.tag) === -1 ? hit.id : hit.parentId
    return containerId ? slotInside(containerId, payload.draggedId, payload.x, payload.y) : null
  }

  /** How an element is placed — absolute/fixed ones move freely when dragged. */
  fe.handlers.position = function (payload) {
    var element = fe.element(payload.id)
    if (!element) return null
    var style = getComputedStyle(element)
    return { position: style.position, left: parseFloat(style.left) || 0, top: parseFloat(style.top) || 0 }
  }
})(window.__fe)
