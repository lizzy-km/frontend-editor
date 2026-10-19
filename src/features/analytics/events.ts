/**
 * Every analytics event the app sends, with its parameters. One place to see
 * what is measured. Rules: never send page content, code, names, emails or
 * anything typed by the user — only counts and categories.
 * Names follow GA4's recommended events where one exists (login, sign_up,
 * page_view, exception, share). Screens such as the gallery or a public
 * page are counted by page_view (ids removed from the path).
 */
export type AnalyticsEvents = {
  page_view: { page_path: string; page_title: string }
  exception: { description: string; fatal: boolean }
  /** Core Web Vitals (speed as people feel it). CLS is sent x1000 so all values are whole numbers. */
  web_vital: { metric_name: 'CLS' | 'INP' | 'LCP' | 'FCP' | 'TTFB'; value: number; rating: 'good' | 'needs-improvement' | 'poor'; page_path: string }

  // Account
  sign_up: { method: SignInMethod }
  login: { method: SignInMethod }
  logout: Record<string, never>
  /** Firebase's error code only (e.g. auth/wrong-password), never the email. */
  auth_error: { code: string }

  // Paste → editor
  paste_code: { elements: number; scripts: number; tailwind: boolean; where: Where; kind: 'page' | 'site' }
  start_blank: { kind: 'page' | 'site'; where: Where }
  open_showcase: { id: string; where: Where }
  paste_rejected: { reason: string }
  /** A React project downloaded from Tweak was opened again (and how many of its files were changed outside Tweak). */
  react_project_open: { where: Where; changed: number }
  /** A ready-made AI prompt was copied (which one, and whether the brief was changed). */
  prompt_copy: { preset: string; edited: boolean }

  // Editing (one event per undo step, never the content)
  edit: { action: EditAction }
  edit_code: { scope: 'part' | 'page' | 'css' | 'script' }
  undo: Record<string, never>
  redo: Record<string, never>
  text_editor_open: Record<string, never>
  add_block: { block: string }
  picture_add: { method: 'upload' | 'embed' }
  switch_screen: { size: 'desktop' | 'tablet' | 'mobile' }
  preview_open: { where: Where }

  // Pages (workspaces)
  page_create: { remix: boolean }
  page_delete: Record<string, never>
  page_rename: Record<string, never>
  make_site: Record<string, never>
  /** A data source added in the Data panel (which preset). */
  data_add: { preset: string }
  /** A data source was connected to a real API (with a key or without, and how many sample items came back). */
  api_connect: { auth: boolean; rows: number }
  /** JSON was imported into a data source (replace or add, and how many rows). */
  data_import: { mode: 'replace' | 'add'; rows: number }
  /** An element got an animation (which effect). */
  animation_set: { effect: string }
  /** Who can see something was set (audience, how many roles and flags). */
  condition_set: { audience: string; roles: number; flags: number }
  /** The sign-in pages were added to a site (how many were new). */
  auth_pages_add: { added: number }
  /** An element was set to open a pop-up, or to ask first. */
  popup_set: { kind: 'open' | 'ask' | 'flag' | 'update' }
  /** A ready-made layout was put on a site (which one, and whether the old header was replaced). */
  layout_apply: { kind: 'top' | 'side' | 'both'; replaced: boolean }
  /** A project-wide color was changed (a page color or a theme variable). */
  palette_change: { kind: 'color' | 'theme' }
  /** Edited React markup of a component was applied to the page (lines of markup). */
  component_edit: { lines: number }
  /** A box was wired to a data source (every row, or one record). */
  data_wire: { mode: 'list' | 'record' }
  /** A form was set to check and send its answers. */
  form_set: { fields: number }
  /** A page added to a site (blank, from pasted code, or a copy) and how many pages it now has. */
  page_add: { from: 'blank' | 'code' | 'copy'; pages: number }
  page_limit_reached: { plan: string }
  share: { method: 'public' | 'private'; content_type: 'page' }

  // Export
  download: { format: ExportFormat; scope: 'page' | 'part'; where: Where }
  download_blocked: { reason: 'signin' | 'limit' }
}

export type AnalyticsEvent = keyof AnalyticsEvents
export type SignInMethod = 'password' | 'google' | 'github'
/** Try-it (no account) or a saved page. */
export type Where = 'try' | 'project'
export type ExportFormat = 'html' | 'zip' | 'react' | 'png' | 'copy'
export type EditAction = 'text' | 'style' | 'move' | 'delete' | 'duplicate' | 'hide' | 'insert' | 'tag' | 'attribute' | 'picture' | 'reset'
