/*
 * Frame runtime — "List from data". After the card design (the box's first
 * element, a real model node) it shows copies filled with the sample rows.
 * Copies keep the design's data-fe-id, so they get its styles and clicking a
 * copy selects the design (the only card to edit). The editor never edits a
 * copy itself. Refreshed after every sync and every data change.
 */
;(function (fe) {
  var sources = {}

  function show(value) {
    return value === true ? 'Yes' : value === false ? 'No' : value == null ? '' : String(value)
  }

  function fill(card, row) {
    var all = [card].concat(Array.prototype.slice.call(card.querySelectorAll('*')))
    all.forEach(function (element) {
      Array.prototype.slice.call(element.attributes).forEach(function (attr) {
        if (attr.name === 'data-fe-bind') element.textContent = show(row[attr.value])
        else if (attr.name.indexOf('data-fe-bind-') === 0) element.setAttribute(attr.name.slice(13), show(row[attr.value]))
      })
    })
  }

  fe.renderLists = function () {
    document.querySelectorAll('[data-fe-list]').forEach(function (box) {
      Array.prototype.slice.call(box.children).forEach(function (child) {
        if (child.hasAttribute('data-fe-clone')) child.remove()
      })
      var design = Array.prototype.find.call(box.children, function (child) { return child.hasAttribute('data-fe-id') })
      var source = sources[box.getAttribute('data-fe-list')]
      if (!design || !source) return
      var size = Number(box.getAttribute('data-fe-page-size')) || 6
      var rows = box.getAttribute('data-fe-load') === 'all' ? source.rows : source.rows.slice(0, size)
      var after = design
      rows.forEach(function (row) {
        var card = design.cloneNode(true)
        card.setAttribute('data-fe-clone', '')
        fill(card, row)
        after.after(card)
        after = card
      })
    })
  }

  /** { sources: [{ name, rows }] } from the editor whenever the data changes. */
  fe.handlers.data = function (payload) {
    sources = {}
    ;(payload.sources || []).forEach(function (source) { sources[source.name] = source })
    fe.renderLists()
  }
})(window.__fe)
