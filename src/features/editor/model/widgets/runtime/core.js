/* Shared helpers: find things, send events, and set up widgets that appear later (React pages, lists). */
var $ = function (selector, root) { return (root || document).querySelector(selector) }
var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)) }
/** Elements of one widget only (a tab bar inside another tab bar's panel is not ours). */
function own(root, selector, kind) {
  return $$(selector, root).filter(function (el) { return el.closest('[data-ui="' + kind + '"]') === root })
}
/** Elements matching a selector inside the scope, and the scope itself when it matches. */
function all(scope, selector) {
  var found = $$(selector, scope)
  if (scope.matches && scope.matches(selector)) found.unshift(scope)
  return found
}
function fire(el, type) { el.dispatchEvent(new Event(type, { bubbles: true })) }
function up(target, selector) { return target && target.closest ? target.closest(selector) : null }
/** Widgets that need a first look at the page (sync a label, draw a calendar) register here. */
var starters = []
function whenReady(start) { starters.push(start) }
function startAll(scope) {
  starters.forEach(function (start) { start(scope) })
}
