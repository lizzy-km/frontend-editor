import { appBrief } from './appBrief'
import type { PromptPreset } from './types'

/** Ideas for dashboards and work tools: lists, forms, charts and roles. */
export const TOOL_APPS: PromptPreset[] = [
  {
    id: 'appTasks', label: 'Team task manager (SaaS)', icon: '✅',
    brief: appBrief({
      purpose: 'the product "Tasklane", a task planner for small teams, with a marketing site and a members-only app. Goal: visitors learn and sign up; members organise projects and tasks.',
      users: 'visitors, members (their projects and tasks) and admins (manage the team and plan).',
      pages: ['Home (hero, features, pricing teaser, testimonials, FAQ)', 'Pricing (/pricing: monthly and yearly toggle, three plans)', 'Log in, Create account, Forgot password', 'Dashboard (/app, members only: today, overdue, my projects, activity)',
        'Project board (/app/projects/:id, members only: columns To do, Doing, Done, add and move tasks)', 'Task (/app/tasks/:id: details, comments, due date, assignee)', 'Tasks table (/app/tasks: search, filters, sorting)', 'Team (/app/team, admins only: invite, change role)',
        'Settings (/app/settings: profile, notifications, plan)', 'Not found'],
      features: ['Move tasks between columns with buttons (and drag if you can keep it clean)', 'Create and edit tasks in a side panel with validation', 'Search and filters kept in the address', 'Role-based menu and an admin-only Team page', 'Optimistic updates in mock mode with a small toast message'],
      data: ['Projects: 5', 'Tasks: 40 (title, status, priority, assignee, due date, tags, comments)', 'Team: 6 people with roles', 'Plans: 3'],
      look: 'modern SaaS: white and light grey with a violet accent, crisp cards, small status pills, a persistent sidebar on desktop and a bottom bar on phones.',
      fonts: 'Inter Tight for headings, Inter for text',
      details: 'Plans Free, Team $8 per seat and Business $15 per seat, demo accounts: member and admin.',
    }),
  },
  {
    id: 'appFinance', label: 'Personal finance tracker', icon: '💰',
    brief: appBrief({
      purpose: 'the budgeting app "Pocketwise". Goal: people record income and spending, set monthly budgets and see where their money goes.',
      users: 'visitors (marketing page) and members (their own finances).',
      pages: ['Home (hero, features, a sample chart, call to action)', 'Log in, Create account, Forgot password', 'Overview (/app, members only: balance, this month, spending by category, recent transactions)', 'Transactions (/app/transactions: search, category, date and type filters, add and edit)',
        'Budgets (/app/budgets: monthly limit per category with progress bars)', 'Goals (/app/goals: savings goals with a progress ring)', 'Reports (/app/reports: month picker and charts)', 'Settings (/app/settings: currency, categories)', 'Not found'],
      features: ['Add, edit and delete transactions with validation (amount, date, category)', 'Charts drawn with plain SVG or CSS (no chart library)', 'Budget warnings when a category passes 80 percent', 'Month picker that changes every number', 'CSV export of the visible transactions'],
      data: ['Transactions: 80 over 3 months', 'Categories: 10 with colours', 'Budgets: 8', 'Goals: 3'],
      look: 'calm and precise: off-white with deep teal and a soft green for income and coral for spending, large numbers, clean tables, plenty of space.',
      fonts: 'DM Sans for headings, Inter for text',
      details: 'Currency USD (switchable), amounts with two decimals and thousands separators, demo account: one member.',
    }),
  },
  {
    id: 'appCrm', label: 'Customer CRM', icon: '🤝',
    brief: appBrief({
      purpose: 'the small-business CRM "Clientloop". Goal: a sales team tracks contacts, companies and deals through a pipeline.',
      users: 'sales reps (their contacts and deals) and managers (the whole team and reports).',
      pages: ['Home (marketing: hero, features, pricing teaser)', 'Log in, Create account, Forgot password', 'Dashboard (/app, signed-in only: deals won, pipeline value, tasks due, activity)', 'Contacts (/app/contacts: search, tag filter; /app/contacts/:id: details, notes, timeline)',
        'Companies (/app/companies and /app/companies/:id)', 'Deals pipeline (/app/deals: columns Lead, Contacted, Proposal, Won, Lost; add and move deals)', 'Tasks (/app/tasks: due today, upcoming, done)', 'Reports (/app/reports, managers only: wins by rep and month)', 'Settings, Not found'],
      features: ['Pipeline with move buttons and totals per column', 'Contact timeline that adds notes, calls and emails', 'Create and edit forms in a side panel with validation', 'Rep sees own data, manager sees the team and the reports page', 'Search across contacts and companies'],
      data: ['Contacts: 40', 'Companies: 15', 'Deals: 24 (title, value, stage, owner, close date)', 'Activities: 80', 'Users: a rep and a manager'],
      look: 'professional and light: white and cool grey, a blue accent, dense but readable tables, coloured stage pills and avatars made of initials.',
      fonts: 'Inter for everything, with a heavier weight for headings',
      details: 'Currency USD, dates as day month year, demo accounts: rep and manager.',
    }),
  },
  {
    id: 'appRealty', label: 'Real estate listings', icon: '🏡',
    brief: appBrief({
      purpose: 'the property site "Homeward". Goal: buyers and renters search listings and contact agents; agents publish and manage listings.',
      users: 'visitors (search), members (save, enquire, saved searches) and agents (manage listings and enquiries).',
      pages: ['Home (search box for buy or rent, featured homes, neighbourhoods)', 'Search (/homes: list and grid, filters for price, beds, baths, type, sorting; map placeholder)', 'Listing (/homes/:id: gallery, facts, description, agent card, enquiry form, mortgage calculator)',
        'Saved homes and searches (/account/saved, members only)', 'My enquiries (/account/enquiries, members only)', 'Log in, Create account, Forgot password', 'Agent dashboard (/agent, agents only: my listings, enquiries, add and edit a listing)', 'Agents (/agents and /agents/:id), About, Contact, Not found'],
      features: ['Mortgage calculator that updates as you type', 'Save a search with its filters and re-run it', 'Enquiry form that creates an enquiry the agent sees', 'Agent-only listing form with a live preview', 'Gallery with thumbnails and keyboard navigation'],
      data: ['Homes: 30 (title, price, type, beds, baths, area, address, pictures, agent, status)', 'Agents: 6', 'Enquiries: 12', 'Neighbourhoods: 6'],
      look: 'bright and upmarket: white, deep blue and a gold accent, big property photos, clear price badges, soft shadows.',
      fonts: 'Libre Baskerville for headings, Inter for text',
      details: 'Prices in USD, rent per month, demo accounts: member and agent.',
    }),
  },
  {
    id: 'appFitness', label: 'Workout tracker', icon: '🏃',
    brief: appBrief({
      purpose: 'the training app "Stride". Goal: people log workouts, follow plans and see progress over time.',
      users: 'visitors (marketing) and members (their training); a coach role can see a few members.',
      pages: ['Home (hero, features, plans, testimonials)', 'Log in, Create account, Forgot password', 'Today (/app, members only: today\'s workout, streak, weekly goal ring)', 'Workout log (/app/log: add a workout with exercises, sets, reps and weight; history list)', 'Plans (/app/plans: browse and start a plan; /app/plans/:id)',
        'Progress (/app/progress: charts for weight, volume and personal bests)', 'Exercises (/exercises and /exercises/:id: how-to, muscles, search and filters)', 'Coach (/coach, coaches only: my members and their weekly summary)', 'Profile, Not found'],
      features: ['Workout form with adding and removing exercise and set rows', 'Streak and weekly goal calculated from the log', 'Charts drawn with plain SVG', 'Start a plan which schedules its workouts on the calendar', 'Coach-only page with member summaries'],
      data: ['Exercises: 40', 'Plans: 6', 'Workouts logged: 30 for the demo member', 'Members: 5 for the coach'],
      look: 'sporty and clean: white and deep charcoal with an electric orange accent, bold numbers, rounded progress rings, motivating photos.',
      fonts: 'Oswald for headings, Inter for text',
      details: 'Kilograms and pounds toggle, weekly goal of 4 workouts, demo accounts: member and coach.',
    }),
  },
  {
    id: 'appHelpdesk', label: 'Support helpdesk', icon: '🎧',
    brief: appBrief({
      purpose: 'the helpdesk "Ticketly". Goal: customers send support requests and follow them; agents answer and close tickets.',
      users: 'customers (their tickets), agents (the queue) and an admin (settings and reports).',
      pages: ['Home (help centre: search, popular articles, contact button)', 'Help articles (/help and /help/:slug)', 'Log in, Create account, Forgot password', 'New ticket (/tickets/new, customers only: subject, category, priority, message)', 'My tickets (/tickets: status filter; /tickets/:id: conversation, reply, close)',
        'Agent queue (/agent, agents only: unassigned, mine, all; filters and sorting)', 'Ticket view for agents (/agent/tickets/:id: reply, internal note, change status and assignee)', 'Reports (/admin/reports, admin only: tickets per day, first response time)', 'Not found'],
      features: ['Ticket statuses open, pending, solved with coloured pills', 'Conversation thread with replies and internal notes only agents see', 'Assign a ticket to an agent', 'Search the help centre with highlighted matches', 'Reports drawn with plain SVG'],
      data: ['Tickets: 30 (subject, status, priority, category, customer, assignee, messages)', 'Help articles: 15', 'Agents: 4', 'Customers: 6'],
      look: 'friendly and organised: white and soft grey with a teal accent, clear status colours, comfortable spacing, avatar circles.',
      fonts: 'Figtree for headings, Inter for text',
      details: 'First reply target 4 hours, priorities low, normal, high and urgent, demo accounts: customer, agent and admin.',
    }),
  },
]
