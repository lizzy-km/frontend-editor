import { appBrief } from './appBrief'
import type { PromptPreset } from './types'

/** Ideas for booking and service apps: pick a time, a place or a seat, and manage what you booked. */
export const BOOKING_APPS: PromptPreset[] = [
  {
    id: 'appClinic', label: 'Clinic appointments', icon: '🩺',
    brief: appBrief({
      purpose: 'the appointment app of "CareNest Clinic", a family clinic. Goal: patients find a doctor, book, change or cancel appointments; doctors see their day.',
      users: 'visitors (doctors and services), patients (book, history, profile) and doctors (their schedule); reception is optional.',
      pages: ['Home (hero, services, how booking works, opening hours)', 'Doctors (/doctors: search, speciality filter)', 'Doctor (/doctors/:id: profile, reviews, available times)', 'Book (/book/:doctorId, patients only: pick a day and a time slot, reason, confirm)',
        'My appointments (/account/appointments, patients only: upcoming and past, reschedule, cancel)', 'Profile and family members (/account/profile)', 'Log in, Create account, Forgot password',
        'Doctor schedule (/doctor/schedule, doctors only: day and week view, mark completed)', 'Services, About, Contact, Not found'],
      features: ['A calendar with real-looking free and taken slots per doctor', 'Booking flow in steps with a confirmation screen and a reference number', 'Reschedule and cancel with a clear confirmation and a rule (24 hours)', 'Family members on one account', 'Doctor-only schedule page', 'Form validation for phone and date of birth'],
      data: ['Doctors: 9 (name, speciality, years, languages, picture, rating, weekly hours)', 'Services: 8', 'Appointments: 10 for the demo patient and doctor', 'Reviews: 25'],
      look: 'calm and trustworthy: white, soft teal and a warm yellow accent, rounded shapes, friendly photos of staff, large readable text and clear status badges.',
      fonts: 'Nunito for headings, Inter for text',
      details: 'Open Monday to Saturday 8:00 to 18:00, 20-minute slots, free cancellation up to 24 hours before, demo accounts: patient and doctor.',
    }),
  },
  {
    id: 'appHotel', label: 'Hotel and stays booking', icon: '🏨',
    brief: appBrief({
      purpose: 'the booking site of "Harbor Stays", a small group of boutique hotels. Goal: guests search dates, compare rooms, book and manage trips; staff manage rooms.',
      users: 'visitors (search), guests (book, trips, favourites) and managers (rooms and bookings).',
      pages: ['Home (search by dates and guests, featured stays, destinations)', 'Search results (/stays: cards with price per night, filters for price, rating, amenities, sorting)', 'Hotel (/stays/:id: gallery, rooms, amenities, reviews, map placeholder)',
        'Booking (/book/:roomId, guests only: dates, guests, extras, price breakdown, confirm)', 'My trips (/account/trips, guests only: upcoming, past, cancel)', 'Favourites (/account/favourites)', 'Log in, Create account, Forgot password',
        'Manager (/manager, managers only: bookings table and room availability)', 'Destinations, About, Contact, Not found'],
      features: ['Date range picker with nights counted and price breakdown with taxes', 'Availability that changes with the chosen dates', 'Booking confirmation with a code, cancel with a policy message', 'Favourite stays', 'Manager-only table with search and status filter'],
      data: ['Hotels: 8 in 5 cities (name, city, stars, amenities, pictures, rating)', 'Rooms: 28 (type, price, beds, size)', 'Bookings: 12', 'Reviews: 40'],
      look: 'elegant and relaxed: deep navy, sand and a brass accent, large landscape photos, subtle shadows and thin lines.',
      fonts: 'Cormorant Garamond for headings, Inter for text',
      details: 'Prices in USD per night, 12% tax, free cancellation up to 3 days before, breakfast add-on $14, demo accounts: guest and manager.',
    }),
  },
  {
    id: 'appGym', label: 'Gym classes and memberships', icon: '🏋️',
    brief: appBrief({
      purpose: 'the app of "Pulse Studio", a gym with group classes. Goal: members book classes and manage their membership; trainers see who is coming.',
      users: 'visitors (timetable, plans), members (book, passes, profile) and trainers (class lists).',
      pages: ['Home (hero, class types, trainers, plans)', 'Timetable (/classes: week view, filters for type, trainer and level)', 'Class (/classes/:id: details, spots left, book or join the waiting list)', 'Plans (/plans: three memberships with a comparison)',
        'My bookings (/account/bookings, members only)', 'My membership (/account/membership, members only: plan, renewal date, pause)', 'Log in, Create account, Forgot password', 'Trainer view (/trainer, trainers only: today\'s classes and attendee lists)', 'Trainers, Contact, Not found'],
      features: ['Booking with spots left and a waiting list', 'Cancel up to 2 hours before without losing a credit', 'Credits shown in the header', 'Membership change and pause flow', 'Trainer-only attendee list with check-in toggles'],
      data: ['Classes: 36 across the week (type, trainer, time, level, capacity, booked)', 'Trainers: 6', 'Plans: 3', 'Bookings: 8 for the demo member'],
      look: 'energetic: near-black background with electric lime and white text, bold condensed headings, diagonal cuts, big action photos, high contrast buttons.',
      fonts: 'Barlow Condensed for headings, Inter for text',
      details: 'Plans $39 (8 classes), $59 (unlimited) and $79 (unlimited plus personal session), open 6:00 to 22:00, demo accounts: member and trainer.',
    }),
  },
  {
    id: 'appTickets', label: 'Event ticketing', icon: '🎟️',
    brief: appBrief({
      purpose: 'the ticket site "Stagelight" for concerts and shows in one city. Goal: fans find events, choose seats or ticket types and keep their tickets; organisers create events.',
      users: 'visitors, fans (buy and keep tickets), organisers (create and manage events) and an admin.',
      pages: ['Home (hero, this week, genres, venues)', 'Events (/events: search, genre, date and price filters)', 'Event (/events/:id: details, lineup, venue, ticket types with quantity)', 'Checkout (/checkout, fans only: summary, details, confirmation with ticket codes)',
        'My tickets (/account/tickets, fans only: ticket cards with a code block)', 'Log in, Create account, Forgot password', 'Organiser dashboard (/organiser, organisers only: my events, sales, create and edit event)', 'Admin (/admin, admin only: approve events)', 'Venues, Help, Not found'],
      features: ['Ticket quantity limits per type and a sold-out state', 'Order summary with fees and a countdown to hold tickets (10 minutes)', 'Tickets shown as cards with a QR-style code drawn in inline SVG', 'Organiser event form with ticket types and a preview', 'Admin approve and reject'],
      data: ['Events: 24 (title, genre, date, venue, price range, picture, status)', 'Ticket types: 3 per event', 'Venues: 6', 'Orders: 5 for the demo fan'],
      look: 'dramatic: deep purple and black with a hot pink accent, glowing gradients, large poster-style images, bold date badges.',
      fonts: 'Space Grotesk for headings, Inter for text',
      details: 'A $2.50 fee per ticket, tickets are mock only, demo accounts: fan, organiser and admin.',
    }),
  },
  {
    id: 'appRental', label: 'Car or bike rental', icon: '🚲',
    brief: appBrief({
      purpose: 'the rental app of "Roadly" for city bikes and scooters. Goal: riders choose a vehicle, a pick-up point and a time, and manage rentals; staff manage the fleet.',
      users: 'visitors, riders (rent, history, payment methods) and staff (fleet and returns).',
      pages: ['Home (hero, how it works, prices)', 'Find a vehicle (/vehicles: map placeholder with a list, filters for type, battery and price)', 'Vehicle (/vehicles/:id: details, pick-up point, price per hour and day)', 'Rent (/rent/:id, riders only: time, duration, summary, confirm)',
        'Active rental (/account/active, riders only: timer, end rental)', 'History (/account/history)', 'Log in, Create account, Forgot password', 'Fleet (/staff/fleet, staff only: vehicles table, status, add and edit)', 'Prices, Help, Not found'],
      features: ['Rental timer that keeps running while the app is open', 'Price that updates with duration and a deposit line', 'End rental with a summary and a rating', 'Fleet table with status filter and a change-status action', 'Saved payment method form (mock, no real card)'],
      data: ['Vehicles: 20 (type, name, battery, price, point, status, picture)', 'Pick-up points: 6', 'Rentals: 10', 'Riders: 3 demo accounts'],
      look: 'urban and fresh: white and slate with a bright cyan accent, rounded cards, bold icons, big range and battery indicators.',
      fonts: 'Manrope for headings, Inter for text',
      details: 'From $2 per hour or $15 per day, $50 deposit, open 24 hours, demo accounts: rider and staff.',
    }),
  },
]
