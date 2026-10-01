import capture from './capture.js?raw'
import core from './core.js?raw'
import drop from './drop.js?raw'
import measure from './measure.js?raw'
import ready from './ready.js?raw'
import render from './render.js?raw'

/**
 * The code that runs inside the editor frame, in order. Plain JS kept as
 * text: it is inlined into the frame's page, never run in the app.
 */
export const RUNTIME_SCRIPTS = [core, render, measure, drop, capture, ready]
