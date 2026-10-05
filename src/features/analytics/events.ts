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
  paste_code: { elements: number; scripts: number; tailwind: boolean; where: Where }
  paste_rejected: { reason: string }
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
export type ExportFormat = 'html' | 'zip' | 'png' | 'copy'
export type EditAction = 'text' | 'style' | 'move' | 'delete' | 'duplicate' | 'hide' | 'insert' | 'tag' | 'attribute' | 'picture' | 'reset'
