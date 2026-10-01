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

  // Account
  sign_up: { method: SignInMethod }
  login: { method: SignInMethod }
  logout: Record<string, never>

  // Paste → editor
  paste_code: { elements: number; scripts: number; tailwind: boolean; where: Where }
  paste_rejected: { reason: string }

  // Editing (one event per undo step, never the content)
  edit: { action: EditAction }
  edit_code: { scope: 'part' | 'page' | 'css' | 'script' }
  undo: Record<string, never>
  redo: Record<string, never>
  switch_screen: { size: 'desktop' | 'tablet' | 'mobile' }
  preview_open: { where: Where }

  // Pages (workspaces)
  page_create: { remix: boolean }
  page_delete: Record<string, never>
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
