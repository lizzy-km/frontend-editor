/**
 * Part 3 of the prompt, added only for "A website with several pages". It describes
 * the document shape the editor understands (see editor/model/pages.ts): one file,
 * a shared header and footer, and one `data-fe-page` wrapper per page whose
 * `data-fe-path` matches the plain `href="/about"` links.
 */
export const SITE_RULES = `PART 3 — SEVERAL PAGES (this is a website with several pages: these rules replace rule 3 above and extend the others)

1. ONE FILE, MANY PAGES
- Still ONE html code block. Every page lives in the same file. Do not write separate files, and do not use JavaScript, CSS or the URL hash to switch between pages: the editor shows one page at a time by itself.

2. SHARED HEADER AND FOOTER
- Write <header> (logo + nav) as the first child of <body> and <footer> as the last child, ONCE each. They appear on every page, so never repeat them inside a page.

3. THE PAGES
- Between the header and the footer, put one wrapper per page as a direct child of <body>, with exactly these three attributes and nothing else (no class, no id):
  <div data-fe-page="about" data-fe-path="/about" data-fe-title="About us"> …that page's sections… </div>
- data-fe-page: a short, unique, lowercase key. data-fe-path: starts with "/", lowercase, words joined by hyphens (/about, /our-menu); the home page is "/". data-fe-title: the page name as people read it.
- The first page is Home (path "/"). Use the pages and their order from Part 1; if none are given, choose 3 to 5 that suit the subject (for example Home, About, Services, Contact).
- Each page holds its own <section> elements. Every id in the file is unique across ALL pages, and each page has exactly one h1 (rule 4's single h1 applies per page).
- Give every page real, different content that feels complete: Home gets the big hero, highlights and a clear next step; every other page starts with a smaller page-title band and then 3 to 5 meaningful sections. Never repeat one page's copy on another.

4. LINKS BETWEEN PAGES
- Menu links, buttons, cards and footer links that open another page are plain <a href="/about"> using the exact data-fe-path of that page. The logo links to "/".
- A link to a part of the SAME page is href="#section-id". Never use about.html, ./about, index.html or a full https:// address for the site's own pages.
- The nav lists the same pages in the same order, written once in the shared header. Do not mark the "current page" with JavaScript.

5. CSS AND JAVASCRIPT
- All CSS stays in ONE <style> and all JavaScript in ONE <script>, shared by every page. Style page-specific parts with their own class names (.about-team, .menu-list) so pages do not affect each other.
- Scripts must look for elements defensively (they may not be on the page being shown), and must not hide or show pages or use location, history or hashchange.`
