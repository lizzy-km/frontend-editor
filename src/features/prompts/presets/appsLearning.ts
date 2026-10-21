import { appBrief } from './appBrief'
import type { PromptPreset } from './types'

/** Ideas for learning, jobs and community apps: content that people read, write, join and follow. */
export const LEARNING_APPS: PromptPreset[] = [
  {
    id: 'appCourses', label: 'Online courses', icon: '🎓',
    brief: appBrief({
      purpose: 'the learning site "Learnly". Goal: students find courses, enrol, follow lessons and track progress; teachers publish courses.',
      users: 'visitors (catalogue), students (learn, progress, certificates) and teachers (create and manage courses).',
      pages: ['Home (hero, popular courses, categories, how it works)', 'Courses (/courses: search, category, level and price filters)', 'Course (/courses/:id: outline, teacher, reviews, enrol)', 'Lesson player (/learn/:courseId/:lessonId, students only: video placeholder, notes, next and previous, mark complete)',
        'My learning (/account/learning, students only: progress bars, continue button)', 'Certificate (/account/certificates/:id: printable page)', 'Log in, Create account, Forgot password', 'Teacher studio (/teach, teachers only: my courses, create a course, add lessons)', 'Pricing, About, Not found'],
      features: ['Enrolment that unlocks lessons, with a clear locked state for visitors', 'Progress saved per lesson and shown as percentages', 'Quiz at the end of a lesson with a score', 'Teacher form to create a course and reorder lessons', 'Reviews with ratings'],
      data: ['Courses: 16 (title, category, level, price, teacher, picture, lessons)', 'Lessons: 8 per course', 'Students: 3 demo accounts with progress', 'Reviews: 40'],
      look: 'bright and encouraging: white with indigo and a warm orange accent, rounded cards, friendly illustrations drawn with inline SVG, clear progress rings.',
      fonts: 'Poppins for headings, Inter for text',
      details: 'Courses $19 to $89, certificate on completion, 7-day refund text, demo accounts: student and teacher.',
    }),
  },
  {
    id: 'appJobs', label: 'Job board', icon: '💼',
    brief: appBrief({
      purpose: 'the job board "HireLane". Goal: candidates find jobs and apply; companies post jobs and review applicants.',
      users: 'visitors, candidates (apply, saved jobs, applications) and employers (post and manage jobs, applicants).',
      pages: ['Home (search by title and location, featured jobs, top companies)', 'Jobs (/jobs: filters for type, level, location, salary; sorting)', 'Job (/jobs/:id: description, requirements, company card, apply)', 'Apply (/jobs/:id/apply, candidates only: form with cover note and CV link)',
        'My applications (/account/applications, candidates only: status steps)', 'Saved jobs (/account/saved)', 'Log in, Create account, Forgot password', 'Employer dashboard (/employer, employers only: my jobs, applicants per job, move applicants between stages)',
        'Post a job (/employer/new, employers only: form with preview)', 'Companies (/companies and /companies/:id), About, Not found'],
      features: ['Two kinds of account: candidate and employer, with different menus', 'Application form with validation and a success state', 'Applicant stages (new, interview, offer, rejected) changed by the employer', 'Saved jobs and job alerts toggle', 'Salary range filter'],
      data: ['Jobs: 30 (title, company, type, level, location, salary range, tags, posted date)', 'Companies: 10', 'Applications: 8 for the demo candidate', 'Applicants: 12 on the demo employer\'s jobs'],
      look: 'clean and confident: white and slate with a vivid green accent, compact cards with company logos drawn as coloured initials, clear tags.',
      fonts: 'Sora for headings, Inter for text',
      details: 'Salaries in USD per year, remote and on-site, demo accounts: candidate and employer.',
    }),
  },
  {
    id: 'appRecipes', label: 'Recipe community', icon: '🍳',
    brief: appBrief({
      purpose: 'the recipe site "Plate". Goal: cooks share recipes, save favourites, rate and comment; everyone can browse.',
      users: 'visitors (browse), members (save, rate, comment, share their own) and an editor (features recipes, removes bad ones).',
      pages: ['Home (hero, recipe of the week, categories, newest)', 'Recipes (/recipes: search, diet, time and difficulty filters)', 'Recipe (/recipes/:id: ingredients with servings scaler, steps, comments, rating)', 'Share a recipe (/recipes/new, members only: form with ingredients and steps lists, picture link)',
        'My recipes (/account/recipes, members only: edit, delete)', 'Cookbook (/account/saved, members only: saved recipes in collections)', 'Cooks (/cooks/:id: profile with their recipes)', 'Log in, Create account, Forgot password', 'Editor desk (/editor, editor only: feature or remove)', 'About, Not found'],
      features: ['Servings scaler that updates the ingredient amounts', 'Add and remove ingredient and step rows in the form', 'Star rating and comments with the author and time', 'Collections for saved recipes', 'Editor-only feature and remove actions'],
      data: ['Recipes: 24 (title, picture, time, difficulty, diet tags, servings, ingredients, steps)', 'Cooks: 8', 'Comments: 60', 'Collections: 3 for the demo member'],
      look: 'warm and homely: cream with tomato red and basil green, food photography first, handwritten-style accents (inline SVG), rounded buttons.',
      fonts: 'Fraunces for headings, Nunito for text',
      details: 'Metric and US units toggle, cooking time in minutes, demo accounts: member and editor.',
    }),
  },
  {
    id: 'appForum', label: 'Questions and answers forum', icon: '💬',
    brief: appBrief({
      purpose: 'the Q and A community "Questly" for home gardeners. Goal: people ask questions, get answers and mark the best one.',
      users: 'visitors (read), members (ask, answer, vote, follow tags) and a moderator.',
      pages: ['Home (hero, trending questions, popular tags)', 'Questions (/questions: search, tag filter, sorting for newest, unanswered, most voted)', 'Question (/questions/:id: question, answers, vote buttons, accept an answer, answer form)', 'Ask (/ask, members only: title, details, tags)',
        'My activity (/account/activity, members only)', 'Tags (/tags and /tags/:name)', 'Member profile (/members/:id: reputation, answers)', 'Log in, Create account, Forgot password', 'Moderation (/moderation, moderator only: reports)', 'Rules, Not found'],
      features: ['Voting that changes scores and a reputation total', 'The asker can accept one answer, which moves to the top', 'Answer form with validation and a live preview', 'Follow tags and see them first', 'Report and remove with a moderator-only page'],
      data: ['Questions: 25 (title, body, tags, author, votes, answers, date)', 'Answers: 70', 'Members: 12 with reputation', 'Tags: 15'],
      look: 'tidy and friendly: white and light sage with a leaf green accent, clear typographic hierarchy, small avatars made of coloured initials.',
      fonts: 'Lora for headings, Inter for text',
      details: 'Reputation +10 for an upvoted answer, +15 for an accepted one, demo accounts: member and moderator.',
    }),
  },
  {
    id: 'appNews', label: 'News and magazine with writers', icon: '📰',
    brief: appBrief({
      purpose: 'the online magazine "The Daily Brief". Goal: readers follow topics and save stories; writers draft and submit stories; editors publish.',
      users: 'readers (anyone), members (save, comment, follow topics), writers (draft and submit) and editors (review and publish).',
      pages: ['Home (lead story, latest, topic strips, newsletter)', 'Topic (/topics/:slug: story grid with a sort)', 'Story (/stories/:slug: article, author box, related, comments for members)', 'Search (/search)', 'Saved (/account/saved, members only)',
        'Log in, Create account, Forgot password', 'Writer desk (/write, writers only: my drafts, new story editor with title, summary, body and topic)', 'Editor desk (/editor, editors only: stories waiting for review, publish or send back with a note)', 'About, Contact, Not found'],
      features: ['Story workflow with statuses draft, in review, published', 'Rich-looking article layout built from plain text blocks', 'Comments with replies for members', 'Follow topics and a personalised home strip', 'Newsletter form with validation'],
      data: ['Stories: 24 (title, slug, summary, body blocks, topic, author, date, read time, picture)', 'Topics: 6', 'Authors: 6', 'Comments: 40'],
      look: 'editorial: off-white paper, black text and one red accent, strong grid, large serif headlines, thin rules, restrained motion.',
      fonts: 'Playfair Display for headings, Source Serif 4 for text',
      details: 'Free to read, no paywall, demo accounts: member, writer and editor.',
    }),
  },
]
