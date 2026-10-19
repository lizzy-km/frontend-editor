import type { DataSource } from '@/features/editor/model/types'

const task = (title: string, owner: string, status: string, due: string, points: number) => ({ title, owner, status, due, points })

/** The `tasks` data source shown on the dashboard. */
export const TASKS: Omit<DataSource, 'id'> = {
  name: 'tasks',
  fields: [{ name: 'title', type: 'text' }, { name: 'owner', type: 'text' }, { name: 'status', type: 'text' }, { name: 'due', type: 'date' }, { name: 'points', type: 'number' }],
  rows: [
    task('Draft the spring launch plan', 'Ava Martin', 'Doing', '2026-11-04', 5),
    task('Review onboarding emails', 'Noah Kim', 'To do', '2026-11-06', 3),
    task('Fix the invoice export', 'Leo Dubois', 'Doing', '2026-11-03', 8),
    task('Interview three customers', 'Mia Rossi', 'To do', '2026-11-10', 5),
    task('Update the pricing page', 'Ava Martin', 'Done', '2026-10-28', 2),
    task('Set up weekly team review', 'Sam Okafor', 'Done', '2026-10-25', 1),
    task('Translate help articles', 'Noah Kim', 'To do', '2026-11-14', 8),
    task('Clean up old projects', 'Mia Rossi', 'Done', '2026-10-30', 3),
    task('Plan the team offsite', 'Sam Okafor', 'Doing', '2026-11-12', 5),
    task('Write the October changelog', 'Leo Dubois', 'To do', '2026-11-02', 2),
  ],
}
