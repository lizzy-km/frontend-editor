import { BIND_ATTR, BIND_PREFIX } from '../dataLists'

/**
 * The browser-side half of data binding, shared by the record player (`?id` pages) and the pop-up
 * player: `fill(box, row)` puts a row's values into every `data-fe-bind` / `data-fe-bind-<attr>` inside the box.
 * A binding that starts with "/" is an address template ("/product/:id") filled from the row.
 * Keep in step with `resolveBinding` (dataLists.ts) and `frame/runtime/lists.js`.
 */
export const FILL_JS = `
  function show(value) { return value === true ? 'Yes' : value === false ? 'No' : value == null ? '' : String(value) }
  function value(spec, row) {
    if (spec.charAt(0) !== '/') return show(row[spec])
    return spec.replace(/:([A-Za-z_]\w*)/g, function (_, name) { return encodeURIComponent(show(row[name])) })
  }
  function fill(box, row) {
    [box].concat(Array.prototype.slice.call(box.querySelectorAll('*'))).forEach(function (element) {
      Array.prototype.slice.call(element.attributes).forEach(function (attr) {
        if (attr.name === '${BIND_ATTR}') element.textContent = value(attr.value, row)
        else if (attr.name.indexOf('${BIND_PREFIX}') === 0) element.setAttribute(attr.name.slice(${BIND_PREFIX.length}), value(attr.value, row))
      })
    })
  }`
