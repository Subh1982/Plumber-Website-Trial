# Hornsby Star Plumbers

A responsive, single-page website for a local plumbing business serving Hornsby
and Sydney's Upper North Shore. It combines service and pricing information,
customer enquiries, discount-member accounts, AI assistance, contact options,
and website analytics.

## Features

- Plumbing services, indicative prices, service areas, reviews, and contact details
- Click-to-call booking links and a pre-filled WhatsApp contact link
- Netlify enquiry form with validation and spam protection
- Email-and-password customer accounts with a 5% membership discount
- Gemini chatbot grounded in an approved business knowledge document
- Gemini Photo Assistant for preliminary plumbing guidance from images
- GA4 page-view, service-link, and telephone CTA tracking
- Google Search Console ownership verification
- Responsive desktop, tablet, and mobile layouts

See [FEATURES.md](./FEATURES.md) for the complete feature inventory and current
product boundaries.

## Technology stack

| Layer | Technology |
| --- | --- |
| Web application | Next.js 16, React 19, TypeScript |
| Styling | Custom CSS |
| Runtime | Node.js 22 or newer |
| Package manager | pnpm |
| Production hosting | Netlify |
| Authentication and profiles | Supabase Auth and PostgreSQL |
| Enquiry capture | Netlify Forms |
| AI | Google Gemini via `@google/genai` |
| Analytics | Google Analytics 4 |
| Source control | Git and GitHub |

## Architecture

```text
Customer browser
    |
    +-- Next.js / React website
    |     +-- services, prices, reviews, and contact links
    |     +-- customer account interface
    |     +-- chatbot and Photo Assistant widgets
    |     `-- GA4 page-view and CTA events
    |
    +-- Netlify Forms --------------------> plumbing enquiries
    |
    +-- Supabase client ------------------> authentication and profiles
    |
    `-- Next.js server routes on Netlify
          +-- /api/chat ------------------> Gemini text model
          +-- /api/photo-assessment ------> Gemini multimodal model
          `-- /api/account/delete --------> Supabase administration API
```

The AI routes read `data/plumber-knowledge.md` on the server and provide it to
Gemini as approved business context. The Gemini API key and Supabase service
role key are never sent to the browser.

## Prerequisites

- Node.js `>=22.13.0`
- pnpm
- A Supabase project for customer accounts
- A Gemini API key from Google AI Studio
- A Netlify site for deployment and enquiry submissions
- Optional: a GA4 web data stream for analytics

If pnpm is not installed globally, use `npx pnpm@11.16.0` in place of `pnpm`.

## Local setup

1. Clone the repository and enter it:

   ```bash
   git clone https://github.com/Subh1982/Plumber-Website-Trial.git
   cd Plumber-Website-Trial
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Add the required environment values to `.env.local`.

5. Start the development server matching the Netlify runtime:

   ```bash
   pnpm run dev:netlify
   ```

6. Open [http://localhost:3000](http://localhost:3000).

Do not commit `.env.local`. The repository ignores local environment files.

## Environment variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe | Supabase publishable key for authentication and authorised profile reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Server secret | Deletes authenticated customer accounts through the protected server route |
| `GEMINI_API_KEY` | Server secret | Calls Gemini from the chatbot and photo-assessment routes |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Browser-safe, optional | Enables GA4 when set to a value such as `G-XXXXXXXXXX` |

`GA4_PROPERTY_ID` may be kept in `.env.local` for a separate reporting script,
but it is not required by the deployed website.

## Supabase setup

Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. It
creates:

- The `profiles` table
- Case-insensitive username uniqueness
- Row Level Security allowing customers to read only their own profile
- A trigger that creates a profile after Supabase Auth registration

Configure the three Supabase environment variables locally and in Netlify.
Passwords are managed by Supabase Auth and are not stored in `profiles`.

## AI assistants

### Customer chatbot

- Widget: `app/AIChat.tsx`
- Server endpoint: `app/api/chat/route.ts`
- Model: `gemini-3.5-flash-lite`
- Knowledge source: `data/plumber-knowledge.md`

The browser sends the current question and limited recent conversation history
to `/api/chat`. The endpoint validates and rate-limits the request, adds the
approved knowledge and safety instructions, calls Gemini, and returns the answer.
Conversation history remains in browser memory and is not stored in Supabase.

### Photo Assistant

- Widget: `app/PhotoAssistant.tsx`
- Server endpoint: `app/api/photo-assessment/route.ts`
- Model: `gemini-3.6-flash`

Customers can submit up to three JPEG, PNG, or WebP images. The browser resizes
and compresses them before upload. The server validates the files and asks Gemini
for schema-constrained JSON containing observations, confidence, urgency, safety
guidance, and a suggested service. Images are not permanently stored by the
application.

Both assistants provide preliminary guidance only. They cannot confirm a
diagnosis, quotation, appointment, availability, or property safety.

`next.config.ts` explicitly includes the knowledge file in both deployed server
functions.

## Enquiry form

The contact form is handled by Netlify Forms. `public/__forms.html` supplies the
static form definition Netlify needs to detect it during a Next.js build.
Submissions appear in the Netlify site's Forms area and are not copied to
Supabase.

## Google Analytics 4

GA4 is enabled only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is defined at build
time. The current implementation sends:

| Event | Meaning |
| --- | --- |
| `page_view` | Automatically sent when the Google tag is enabled |
| `explore_services_click` | The hero's “Explore our services” link was selected |
| `call_click` | A tracked “Call 0492205682” link was selected |

`call_click` includes a `link_location` value of `top_bar`, `hero`, or
`photo_assistant`. Register `link_location` as an event-scoped custom dimension
in GA4 to use that breakdown conveniently in reports.

Do not send enquiry fields, account details, chat messages, photographs, or other
personally identifiable information to GA4.

## Validation

```bash
pnpm lint
pnpm run build:netlify
```

The production build performs Next.js compilation and TypeScript validation.

## Deployment

The production website is deployed from GitHub to Netlify.

- Production branch: `main`
- Build command: `pnpm run build:netlify`
- Publish directory: `.next`
- Node version: `22`

Add all required production environment variables in the Netlify site's
configuration. Public environment variables are embedded at build time, so
redeploy after adding or changing them.

The normal release flow is:

1. Create a feature branch.
2. Commit and push the intended changes.
3. Open a pull request into `main`.
4. Verify the Netlify deploy preview and checks.
5. Merge the pull request.
6. Allow Netlify to deploy the updated `main` branch.

## Important files

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Main one-page website |
| `app/ContactForm.tsx` | Netlify enquiry form |
| `app/DiscountAccount.tsx` | Supabase registration, login, profile, and deletion UI |
| `app/AIChat.tsx` | Customer chatbot widget |
| `app/PhotoAssistant.tsx` | Photo Assistant widget |
| `app/api/chat/route.ts` | Secure Gemini chatbot endpoint |
| `app/api/photo-assessment/route.ts` | Secure multimodal assessment endpoint |
| `app/api/account/delete/route.ts` | Protected account-deletion endpoint |
| `data/plumber-knowledge.md` | Approved AI knowledge and safety rules |
| `supabase/schema.sql` | Customer-profile database schema and policies |
| `public/__forms.html` | Netlify static form definition |
| `next.config.ts` | Next.js server file-tracing configuration |
| `netlify.toml` | Netlify build configuration |

## Security and privacy

- Never commit `.env.local`, Gemini keys, or Supabase service-role keys.
- Keep all elevated credentials server-side.
- AI conversations and submitted photos are not persisted by this application.
- Enquiry information is stored by Netlify Forms.
- Customer identity and profile information is stored by Supabase.
- Review the business's privacy notice and consent obligations before production
  use of analytics, authentication, or AI features.

## Legacy development tooling

The repository originated from a vinext/Cloudflare starter and still contains
optional Cloudflare, Vite, Drizzle, and example D1 files. The production plumber
website uses the Next.js and Netlify commands documented above; those starter
files are not part of the current production path.
