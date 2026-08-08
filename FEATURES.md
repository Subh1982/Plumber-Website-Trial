# Hornsby Star Plumbers — Features

This document summarises the key features currently implemented in the Hornsby Star Plumbers website.

## Public website

- Responsive, single-page website for desktop, tablet, and mobile devices.
- Branded hero section with prominent telephone booking call-to-action.
- Sticky mobile call button for fast access to the business phone number.
- Smooth in-page navigation to services, pricing, reviews, discount membership, and contact sections.
- Accessible headings, labels, navigation landmarks, links, and form status messages.
- Reduced-motion support for visitors who prefer fewer interface animations.

## Plumbing services and pricing

- Service catalogue covering:
  - Blocked drains
  - Leaking taps
  - Burst pipes
  - Hot-water systems
  - Toilets
  - Gas fitting
  - Installations
  - Maintenance
- Indicative starting prices for each service.
- Clear pricing disclaimer covering GST, standard weekday work, parts, and after-hours call-outs.
- Direct telephone booking link from every service card.

## Business information and trust content

- Hornsby and Upper North Shore service-area messaging.
- Business hours and 24/7 emergency-help messaging.
- Licensed, insured, upfront-pricing, and workmanship-guarantee trust indicators.
- Three-step service promise covering arrival, pricing approval, and leaving the work area tidy.
- Sample customer reviews and five-star presentation.
- Telephone and email contact details.

## Plumbing enquiry form

- Customer enquiry form containing:
  - Name
  - Phone number
  - Optional email address
  - Suburb
  - Required plumbing service
  - Job description
- Required-field and email-format validation.
- Sending, success, and failure feedback without leaving the page.
- Spam honeypot field.
- Netlify Forms integration using a dedicated static form definition for Next.js compatibility.
- Enquiries are stored in Netlify Forms and are not copied into Supabase.

## Customer discount accounts

- Free customer account registration for a 5% membership discount.
- Registration fields for:
  - Full name
  - Phone number
  - Preferred username
  - Email address
  - Password
- Email and password authentication through Supabase Auth.
- Email confirmation before account login.
- Password validation requiring:
  - At least eight characters
  - One uppercase letter
  - One number
  - One special character
- Username validation and case-insensitive username uniqueness.
- Persistent authenticated sessions managed by Supabase.
- Customer login and logout.
- Private account view showing name, username, email, phone number, and discount percentage.
- Permanent account deletion with an explicit confirmation prompt.
- Automatic deletion of the related profile when the authentication account is deleted.

## Supabase data model and security

- `profiles` table containing:
  - Supabase user ID
  - Full name
  - Phone number
  - Username
  - Fixed 5% discount value
  - Creation timestamp
- Automatic profile creation after a Supabase Auth user is registered.
- Row Level Security enabled for the `profiles` table.
- Customers can read only the profile attached to their authenticated user ID.
- Passwords are handled and hashed by Supabase Auth and are never stored in the public profile table.
- Account deletion is performed through a protected server endpoint.
- Supabase's elevated server key is available only to server-side Netlify code.

## AI plumbing assistant

- Responsive customer-facing chat widget for desktop and mobile layouts.
- Floating launcher positioned alongside the existing WhatsApp and mobile call controls.
- Suggested questions covering plumbing prices, service areas, and the 5% membership discount.
- Conversation history, loading feedback, clear-chat control, keyboard support, and accessible status announcements.
- Secure Next.js `/api/chat` server endpoint; the Gemini API key is never sent to the browser.
- Google Gemini Flash-Lite integration through the official `@google/genai` SDK.
- Answers are grounded in `data/plumber-knowledge.md`, which contains the approved services, prices, contact details, service areas, policies, safety guidance, and response rules.
- Full-document context injection is used because the current knowledge base is small; a vector database is not required.
- Low-temperature, length-limited responses encourage concise and consistent answers.
- The assistant cannot confirm bookings, availability, final quotations, or service coverage beyond the approved knowledge base.
- Emergency guardrails for suspected gas leaks, burst pipes, major water leaks, and sewage overflows.
- Prompt-injection rules prevent customer messages from overriding business instructions or requesting hidden prompts and credentials.
- Request protections include:
  - Same-origin validation
  - JSON-only requests
  - Request-size and message-length limits
  - A maximum of six conversation-history messages
  - A 15-second provider timeout
  - Basic per-client rate limiting
  - Non-cached responses
  - Safe customer-facing error messages
- Human fallback directs customers to call 0492205682 when the assistant is unavailable or cannot answer reliably.
- Conversations remain in browser memory and are not stored in Supabase or another database.
- `pnpm run dev:netlify` provides local Next.js testing that matches the Netlify runtime.

## AI photo assistant

- Separate responsive Photo Assistant widget with its own floating launcher.
- Customers can select up to three JPEG, PNG, or WebP plumbing photos and choose the closest problem category.
- Browser-side resizing and JPEG compression keep the combined binary upload within Netlify's function payload allowance and remove most original image metadata.
- Secure Next.js `/api/photo-assessment` endpoint; photos and the Gemini API key are never exposed to unrelated clients.
- Google Gemini 3.6 Flash multimodal analysis through the official `@google/genai` SDK.
- JSON Schema structured output restricts the model to approved assessment fields, categories, services, urgency values, confidence levels, and safety codes.
- Server-side validation checks origin, request size, file count, processed file size, MIME type, actual file signature, problem category, model output, and business values.
- Assessments are grounded in `data/plumber-knowledge.md` and cannot confirm a diagnosis, quotation, booking, availability, or property safety.
- Fixed safety responses cover possible gas issues, water near electricity, major water leaks, and sewage hazards.
- Results show visible observations, model confidence, suggested service, recommended timing, safety guidance, and questions a plumber may ask.
- Photos are held only for the active request and are not written to Supabase, the repository, or another application database.
- Five photo-assessment requests per client per minute, a 25-second Gemini timeout, non-cached responses, and safe human fallback messaging provide basic abuse and failure protection.
- The current rate limiter is per server instance; a distributed production rate limiter is not yet implemented.

## WhatsApp contact demo

- Floating WhatsApp-style contact button on desktop and mobile layouts.
- Pre-filled plumbing enquiry message.
- Uses an ACMA-reserved fictional Australian mobile number for demonstration.
- Clearly labelled as a demo number.
- The fictional number must be replaced with the business's registered WhatsApp number before real customer use.

## Deployment and operations

- Source code stored in GitHub.
- Pull-request workflow for reviewing and merging changes into `main`.
- Automatic Netlify deployment after changes are merged into `main`.
- Next.js production build and TypeScript validation during deployment.
- Netlify environment variables connect the deployed website to Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- The protected `GEMINI_API_KEY` Netlify environment variable connects the server-side chat and photo-assessment endpoints to Gemini.
- The Supabase service key is stored as a protected production secret.
- Google Search Console ownership verification file is included in the public site.

## Current boundaries

The following are not currently implemented:

- Online appointment scheduling
- Online payments or invoicing
- Automatic application of the 5% discount to a checkout or invoice
- Staff administration dashboard for customer accounts
- Customer profile editing
- Password-reset interface within the website
- Real WhatsApp messaging until the demo number is replaced
- Stored chatbot conversation history or chat analytics
- Production-wide distributed chatbot rate limiting beyond the current per-instance protection
- Permanent photo storage or attachment of Photo Assistant images to enquiries
- Production-wide distributed Photo Assistant rate limiting beyond the current per-instance protection
- Vector-search retrieval; the current assistant sends the complete small knowledge document with each request
