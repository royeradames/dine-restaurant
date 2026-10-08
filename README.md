# Dine restaurant website

Royer Adames's build of the [Frontend Mentor](https://www.frontendmentor.io) Dine restaurant website challenge: a home page with accessible event tabs and a booking page with a validated reservation form.

The booking form is a demo. It checks every rule in the browser and then says so: nothing is sent and no table is reserved.

## Stack

Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Form with Zod validation, League Spartan through `next/font/google`, and Playwright tests.

## Scripts

```sh
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
npm test           # builds must exist; Playwright starts `next start` on port 4411
SCREENS=1 npx playwright test screens   # review screenshots in ./screenshots
```

## Booking rules

- Name is required.
- Email is required and must be a valid address.
- Month, day and year are required, must form a real calendar date, and cannot be before today.
- Hour (1–12) and minute (0–59) are required. A booking for today must be later than the current time.
- Party size is 1 to 20 people.

After a failed submit, focus moves to the first invalid field and each message is linked to its field with `aria-describedby`.
