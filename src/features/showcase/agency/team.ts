import { photo } from './photos'

/** The Team page: the grid is filled by components.ts, which turns a "Team member" card into a reusable component. */
export function teamHtml(): string {
  return `<section class="ag-section" style="padding-bottom: 40px"><div class="ag-wrap" data-fe-animate="fade-up" data-fe-trigger="load"><p class="ag-eyebrow">Team</p><h1 style="font-size: clamp(44px, 7vw, 88px)">Twelve people, one table</h1><p class="ag-lead" style="margin-top: 24px">Designers, developers and storytellers who like small teams and long relationships. Here are some of the people you will meet.</p></div></section>
<section class="ag-section" style="padding-top: 24px"><div class="ag-wrap">
<div class="ag-grid ag-grid--4 ag-team-grid" data-fe-animate="fade-up" data-fe-trigger="scroll" data-fe-stagger="0.1">
<article class="ag-member" style="display: grid; gap: 14px; background: #fff; border: 1px solid #e2ddd4; border-radius: 20px; padding: 14px 14px 22px; align-content: start"><img src="${photo('woman', 600, 600)}" alt="Team member portrait" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 12px"><div style="padding: 0 8px"><h3 style="font-size: 22px">Name</h3><p style="color: #6b6a66; margin-top: 4px">Role</p></div></article>
</div></div></section>
<section class="ag-section ag-dark"><div class="ag-wrap" style="text-align: center; display: grid; gap: 24px; justify-items: center" data-fe-animate="fade-up" data-fe-trigger="scroll"><h2>Come and work with us</h2><p class="ag-lead ag-muted">We hire a few people a year, and always read a good note from someone who has not applied yet.</p><a class="ag-btn" href="/contact">Say hello</a></div></section>`
}
