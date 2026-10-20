# DEAD POETS CLUB — Product Requirements Document (PRD)

**Document version:** 1.0  
**Status:** Product specification for implementation  
**Product type:** Responsive, full-stack literary community web application  
**Working tagline:** *A little world for people who feel a little too much about books.*

---

## 1. Product overview

Dead Poets Club (DPC) is a literary community website that combines book discovery and reviews, personal reading shelves, an atmospheric virtual café for quiet co-presence and focus sessions, a daily book-title crossword, customisable illustrated avatars, and personal reading/study logs.

It should feel like entering a small fictional world—not a generic bookstore, productivity dashboard, or conventional social network. The interface is editorial and readable; its personality comes from handmade details, hand-drawn characters, paper textures, imperfect doodles, and subtle Y2K indie-grunge touches.

### Product principles

1. **Books first:** book discovery, reading, and thoughtful reviews are the core.
2. **Quiet togetherness:** community should be available without forcing conversation.
3. **Handmade, not templated:** use original visual details and intentional imperfections.
4. **Functional, not fake:** real accounts and persistent data; no fake review counts, fabricated online users, or buttons that do nothing.
5. **Privacy by design:** users control profile visibility and personal activity sharing.
6. **Build in phases:** deliver a reliable MVP before adding elaborate animations or complex social features.

---

## 2. Goals and success criteria

### Goals

- Let members discover books and save them to personal shelves.
- Support meaningful, structured book reviews and expressive journal-style reflections.
- Create an inviting virtual café with real member presence, focus timers, and ambient audio.
- Provide a daily crossword about a book title with a reliable completion record and streak.
- Let members customise an avatar and log reading/study sessions.
- Make the experience responsive, accessible, secure, and maintainable.

### MVP acceptance criteria

- A user can sign up, sign in, sign out, reset a password, and edit their profile.
- Data persists across reloads and devices when a user is authenticated.
- Members can search the available book catalogue, view a book page, manage shelves, and create/edit/delete their own reviews.
- Unauthenticated visitors can browse public pages but must authenticate to write reviews or save personal data.
- Row-level permissions prevent a member from modifying another member's private records or reviews.
- A member can start and complete a focus session, with the saved duration appearing in their journal.
- A daily puzzle can be played, validated, and completed; duplicate submissions cannot award duplicate completion rewards.
- Avatar selections persist and only eligible/unlocked items can be equipped.
- Café presence reflects connected real users, not a permanently fabricated member count.
- Core flows work on desktop and mobile and include loading, empty, and error states.

---

## 3. Target users

- Readers who enjoy literary fiction, classics, poetry, romance, coming-of-age stories, and mood-based book discovery.
- Students and independent workers who like quiet virtual study spaces.
- People who want to share thoughtful reactions to books rather than only star ratings.
- Members who enjoy small daily rituals, collecting cosmetic items, and tracking personal progress.

Do not assume a member's gender, reading ability, schedule, or identity. Avatar choice must not require a male/female declaration.

---

## 4. Brand, theme, and visual direction

### Aesthetic

A deliberate combination of:
- **Dark academia:** old books, annotations, literary atmosphere.
- **Editorial magazine:** strong typography, clear hierarchy, generous whitespace, thoughtful cover layouts.
- **Indie grunge / Y2K:** hand-drawn doodles, sticker-like UI details, photocopied textures, playful micro-interactions.
- **Cottagecore warmth:** plants, warm lamps, wood, tea-stained paper, lived-in comfort.

Avoid a generic AI-generated luxury bookstore look, excessive beige, overly polished gradients, or making every surface visually noisy. The structure should stay clear and usable; expressive details should be accents.

### Suggested palette

- Paper: `#E9E0CE`
- Ink: `#39362F`
- Wine: `#784743`
- Moss: `#75816A`
- Amber: `#D3A66D`

Use colour tokens so the palette can be revised globally. Ensure readable contrast and never communicate status through colour alone.

### Typography

- Editorial serif for large headings and book-focused moments.
- Clean sans-serif for body text, controls, labels, and navigation.
- Handwritten accent font only for occasional annotations, notes, and doodles.

### Motion and sound

- Short, skippable page/room transitions.
- Subtle hover states and character animations.
- Respect reduced-motion preferences.
- Never autoplay audio. Ambient sound must require user action, have visible volume/mute controls, and stop when requested.

---

## 5. Information architecture and routes

### Public routes

- `/` — Landing page
- `/library` — Book discovery and search
- `/books/:bookId` — Book detail and reviews
- `/profile/:username` — Public member profile, subject to privacy settings
- `/login` — Login
- `/signup` — Registration
- `/forgot-password` — Password reset flow

### Authenticated routes

- `/clubhouse` — Personal dashboard
- `/cafe` — Virtual café
- `/crossword` — Daily crossword
- `/shelves` — Personal shelves
- `/reviews` — Member's reviews and drafts
- `/journal` — Reading/study sessions and history
- `/profile/edit` — Profile and avatar editor
- `/settings` — Account, security, notification, and privacy settings

### Optional later routes

- `/society` — Member directory and community discovery
- `/lists/:listId` — Public curated reading list
- `/admin` — Restricted moderation and content-management interface

Use route guards for member-only pages. Deep links should work after refresh. Redirect unauthenticated members to login with a safe return path.

### Navigation

Desktop: persistent left navigation with Clubhouse, Library, Café, Daily Crossword, Society (if implemented), and Profile. Include a compact “currently reading” card and clear active-route indication.

Mobile: compact bottom navigation or a collapsible menu. Keep key actions reachable and avoid squeezing the desktop sidebar onto small screens.

---

## 6. User flows and permissions

### Registration

1. Visitor chooses Join the Club.
2. Registers with email/password or a configured supported OAuth provider.
3. Verifies email if enabled.
4. Profile record is created by a trusted process.
5. Chooses username, display name, avatar base, and optional interests.
6. May skip optional interests and reading goals.
7. Lands on the Clubhouse.

### Login and account management

- Login, logout, session restoration, password reset, and account deletion.
- Unique username validation.
- User can update bio, avatar, genres, reading goal, and privacy settings.
- Do not expose email addresses or auth provider identifiers on public profiles.
- Use managed authentication; never store raw passwords in application tables.

### Guest vs member

Guests may browse public book pages and public reviews. Authentication is required to create reviews, manage shelves, save progress, play for a persistent streak, customise a saved avatar, and use persistent focus logs.

### Profile privacy

Members can choose whether their profile, shelves, reading statistics, and activity are public. Private journal entries and private reading sessions must never be exposed on public pages. Provide a report/block mechanism if social interactions are enabled.

---

## 7. Functional requirements

### 7.1 Landing page

- Present the club identity and a clear Join / Explore action.
- Preview the Library, Café, recent public reviews, featured book, and daily crossword.
- Use editorial layouts and original art assets.
- Include a responsive layout and clear navigation.
- Avoid fabricated metrics or fake “members online” counters.

### 7.2 Clubhouse dashboard

Display a personalised greeting, currently reading book, recent community reviews (if followed-member feed exists), café entry point, daily crossword status, recent activity, and reading/study statistics.

- Dashboard cards navigate to their dedicated routes.
- Show meaningful empty states for new users.
- Do not duplicate full feature interfaces on the dashboard.
- Fetch only the data needed for the dashboard.

### 7.3 Library and book catalogue

Book records should support:
- Title, author(s), description, ISBN when available, publication metadata, cover URL or stored image, language, and genres/tags.
- Search by title and author.
- Filter by genre, tag, and other available metadata.
- Sort by title, recently added, or rating when sufficient real review data exists.
- Pagination or incremental loading.
- Curated editorial collections and mood-based shelves.
- Related-book suggestions based on stored tags or explicit curated data.

Use a curated seed catalogue initially. An external metadata API may supplement it, subject to its terms, rate limits, attribution requirements, and caching rules. Normalise records to avoid duplicates. Do not invent bibliographic data or present fabricated community ratings.

### 7.4 Book detail page

Display cover, title, author, available metadata, description, genres/tags, real aggregate rating and review count, related books, and member reviews.

Authenticated members can:
- Add/remove a book from a shelf.
- Update reading status.
- Start a reading session associated with the book.
- Write, edit, and delete their own review.
- Mark a review helpful or react, subject to one reaction per user/review.
- Report inappropriate content.

### 7.5 Shelves

Provide default statuses:
- Want to Read
- Currently Reading
- Read
- Abandoned

Members can move a book between statuses and optionally create custom named lists. Prevent duplicate entries where the product rules require uniqueness. Public/private visibility must be respected in all queries.

### 7.6 Reviews and literary journal entries

A review can contain:
- Star rating (optional only if product rules explicitly allow unrated reflections; decide consistently in implementation).
- Headline.
- Review text.
- Optional favourite quote and attribution.
- Mood tags.
- Spoiler flag.
- Publication status: draft or published.
- Created/updated timestamps.

The UI should offer two presentation modes:
- **The Shelf:** structured reviews with rating and metadata.
- **The Margins:** expressive journal-style reflections.

Requirements:
- Validate lengths and input.
- Escape/render user content safely; do not allow arbitrary executable HTML.
- Support pagination and sorting.
- Use a spoiler warning before revealing spoiler-marked content.
- Users can modify/delete only their own reviews.
- Recalculate aggregate ratings from real published ratings; protect against duplicate votes.
- Add reporting/moderation workflows before a public launch.

### 7.7 The Café

The café is a hand-drawn, illustrated 2D room, not a 3D world in the MVP. It should feel like a separate space with a brief, skippable entrance transition.

Areas:
- Window Seats — quiet solo reading.
- Common Table — co-working and focus.
- Reading Corner — relaxed reading.
- Noticeboard — daily prompts and announcements.

Interactions:
- Enter/leave a room.
- Select an available seat.
- Show a member's avatar and optional activity state.
- Switch between reading, studying, journaling, and break poses.
- Start/stop a focus session.
- Enable/disable ambient audio and control volume.
- View real connected-member presence.
- Optionally leave a short noticeboard note if community posting is implemented.

Presence and persistent data are separate:
- Use Realtime Presence/Broadcast or equivalent for transient online state.
- Store completed sessions and other durable history in PostgreSQL.
- Ensure a seat cannot be claimed concurrently by two members.
- Remove stale presence after disconnect/timeout.
- Restrict room events to authorised room members and validate payloads.
- Never show fabricated active users as real members.

### 7.8 Focus timer and session logs

- Presets: 25/5, 50/10, and custom duration.
- Session types: reading, studying, writing, other.
- Optional association with a book and a note.
- Clear pause, resume, cancel, and finish behaviours.
- Save completed sessions to the user's journal.
- Handle browser closure or interruption without assuming the full planned duration was completed.
- Manual entries may be allowed but must be distinguishable from timer-verified sessions.
- Prevent duplicate completion and implausible durations.
- Profile totals must be calculated from authorised session records.

### 7.9 Daily crossword

Each scheduled puzzle focuses on a single book title.

Store:
- Puzzle ID and scheduled date.
- Grid dimensions and validated cell layout.
- Across/down clues and solution mapping.
- Book reference and reveal information.
- Optional hints.
- Publication/status metadata.

User experience:
- Keyboard and mobile-friendly grid.
- Clear current cell and direction.
- Clue navigation.
- Check/reveal/hint behaviour as defined by the puzzle rules.
- Completion screen revealing the featured book.
- Daily streak and completion history.
- Accessible controls and understandable error feedback.

Backend rules:
- Curate and validate puzzles before publication; do not generate a new inconsistent puzzle on each client load.
- Validate completion on a trusted server against the authoritative puzzle.
- Do not send the full solution to the client before the game rules permit it.
- One completion record per user/puzzle.
- Calculate streaks consistently using a configured timezone/day boundary.
- Define whether missed puzzles can be replayed and whether catch-up counts toward streaks.
- Avoid awarding duplicate rewards for retries or repeated requests.

### 7.10 Avatars and wardrobe

Use handcrafted base characters with mix-and-match cosmetic layers.

- Provide a diverse selection of base characters, body types, skin tones, facial features, and gender expressions.
- Do not require gender selection.
- Cosmetic categories may include hair, tops, bottoms, shoes, accessories, handheld props, and expressions/poses.
- Store item IDs and configuration rather than generating a new image for each outfit.
- Assets should use consistent dimensions, anchor points, and layering order.
- The server verifies that equipped items are owned/unlocked and compatible.
- Initial wardrobe may be free and predefined; cosmetic rewards can be added later.
- Do not implement paid loot boxes or randomised monetisation in the MVP.

### 7.11 Profile and journal

Public profile may show:
- Avatar, display name, username, bio, and interests.
- Public shelves, reviews, and curated lists.
- Reading/study totals and achievements, only when visibility permits.

Private journal may show:
- Session date, duration, activity type, optional book, and note.
- Weekly/monthly totals and history.

Users must control public visibility. Reading and study time should be tracked separately. Never reveal private notes or exact session history to other users without explicit permission.

### 7.12 Community and moderation

If Society/following is enabled:
- Members can follow/unfollow other members.
- Public profiles and reviews are discoverable.
- Avoid direct messaging in MVP to limit moderation scope.
- Provide report, block, and moderation tools.
- Admin/moderator operations require server-side role checks.
- Keep an audit trail for sensitive moderation actions.

---

## 8. Technical architecture

### Recommended stack

- **Frontend:** React + TypeScript.
- **Build tooling:** Vite or an equivalent supported React setup.
- **Routing:** React Router or equivalent.
- **Styling:** Tailwind CSS with a custom token system; reusable accessible components.
- **Backend platform:** Supabase.
- **Database:** PostgreSQL.
- **Authentication:** Supabase Auth.
- **Realtime:** Supabase Realtime Presence/Broadcast for café presence and room activity.
- **Storage:** Supabase Storage for approved uploads, or version-controlled static assets for original artwork.
- **Server-side operations:** Supabase Edge Functions and/or PostgreSQL functions for trusted validation and transactional actions.
- **Testing:** unit tests, integration tests, and browser-level end-to-end tests.
- **Source control:** Git.

Do not introduce microservices or a separate Node.js server unless a concrete requirement justifies it. The application must remain modular so a dedicated server can be added later if needed.

### Suggested source structure

```text
src/
  app/
  components/
    navigation/
    books/
    reviews/
    avatar/
    cafe/
    crossword/
  pages/
  services/
  hooks/
  types/
  lib/
  styles/
supabase/
  migrations/
  functions/
  seed.sql
public/
  avatars/
  textures/
  sounds/
tests/
```

Use typed service functions instead of scattering raw database calls throughout components. Keep business rules out of presentation components.

---

## 9. Initial database model

Implement a normalised schema with UUID primary keys, foreign keys, timestamps, appropriate indexes, constraints, and migrations.

Suggested tables:

1. `profiles` — one profile per auth user; display name, unique username, bio, preferences, privacy, avatar configuration.
2. `books` — canonical book metadata and cover references.
3. `book_genres` / `genres` — normalised genres and tags, if needed.
4. `shelves` — user-owned named shelves and visibility.
5. `shelf_books` — membership of a book in a shelf, with status/ordering where appropriate.
6. `reviews` — user/book association, rating, headline, body, quote, tags, spoiler flag, status.
7. `review_reactions` — unique user/review reaction records.
8. `review_reports` — reports with restricted access and moderation status.
9. `reading_sessions` — user, activity type, start/end, duration, optional book, note, source, timestamps.
10. `crossword_puzzles` — date, grid, clues, solution mapping, book reference, publication status.
11. `crossword_completions` — user, puzzle, completion time, attempt/status fields; unique `(user_id, puzzle_id)`.
12. `avatar_items` — catalogue of cosmetic assets and compatibility metadata.
13. `user_avatar_items` — unlocked/owned cosmetic items.
14. `cafe_rooms` — configured room definitions.
15. `cafe_seats` — stable seat definitions and room association; transient occupancy must be managed safely.
16. `cafe_sessions` — durable focus/session history where needed; do not use this as the sole source of live presence.
17. `follows` — follower/followed user pair with uniqueness and self-follow prevention.
18. `reading_lists` / `reading_list_books` — optional public curated lists.
19. `moderation_actions` — restricted audit log for administrative actions.

Use `auth.users.id` as the identity source. Avoid duplicating password/authentication data. Add `created_at` and `updated_at` where useful.

Important constraints and indexes:
- Unique username (case-insensitive handling must be defined).
- Foreign keys and deliberate deletion behaviour.
- Unique reaction per user/review.
- Unique completion per user/puzzle.
- Unique follow pair; prohibit self-follow.
- Unique or otherwise well-defined shelf membership.
- Index common lookups by book, author/title search, user, status, date, and published review.
- Use transactions or atomic database functions for operations that must not race, such as claiming a seat or awarding a crossword completion.

Store a canonical UTC timestamp for events and define a consistent timezone for daily puzzles and streak boundaries.

---

## 10. Security and data protection

Security is a release requirement, not a future enhancement.

- Enable RLS on every exposed user-data table.
- Define explicit read/insert/update/delete policies; deny by default when appropriate.
- Users may modify only their own profile, shelves, reviews, sessions, avatar configuration, and completion records through permitted operations.
- Public reads must respect profile/shelf/review visibility and publication state.
- Do not trust a client-provided `user_id`; derive identity from the authenticated request.
- Never expose Supabase service-role keys, database passwords, or privileged secrets in frontend code.
- Use server-side functions for crossword validation, rewards, sensitive moderation, and other privileged operations.
- Validate all inputs and restrict file types, sizes, and storage paths.
- Prevent XSS, SQL injection, spam, duplicate actions, and unauthorised realtime subscriptions.
- Rate-limit or otherwise protect abuse-prone endpoints.
- Keep admin privileges separate from normal user roles and verify them server-side.
- Provide a safe account deletion process and document what happens to public reviews after deletion.
- Set up backups and test restoration according to the selected hosting plan.
- Use separate development and production environments and credentials.
- Avoid collecting unnecessary personal information.

---

## 11. Non-functional requirements

### Performance
- Paginate review feeds and large lists.
- Use appropriate indexes and avoid fetching full tables.
- Optimise cover images and avatar assets.
- Lazy-load non-critical images and routes where appropriate.
- Keep animation lightweight and avoid unnecessary realtime events.

### Accessibility
- Semantic HTML and keyboard navigation.
- Visible focus indicators.
- Labels and accessible error messages for inputs.
- Accessible crossword navigation and cell announcements.
- Sufficient text contrast.
- Respect reduced-motion settings.
- Do not rely on colour alone for feedback.

### Responsiveness
- Support desktop, tablet, and mobile layouts.
- Test narrow screens, touch targets, orientation changes, and slow networks.
- Ensure the café remains usable on mobile; provide a simplified layout if the full room is too dense.

### Reliability
- Handle network errors and retry-safe operations.
- Prevent duplicate review reactions, puzzle completions, session completions, and seat claims.
- Provide loading, empty, success, and error states.
- Track server-side errors without logging passwords, tokens, or private journal content.

### Maintainability
- TypeScript types for core models and service responses.
- Version-controlled database migrations.
- Reusable components and design tokens.
- Seed data clearly separated from production data.
- Automated tests for access policies and critical business logic.

---

## 12. Analytics and product measurement

Track only what is necessary and disclose analytics appropriately. Suggested aggregate metrics:
- Registration completion rate.
- Weekly active members.
- Books added to shelves.
- Reviews published.
- Crossword completion rate and returning streak participants.
- Focus sessions completed.
- Café join/leave and session completion rates.

Do not expose individual private reading behaviour to other members through analytics. Avoid collecting sensitive data unnecessarily.

---

## 13. Out of scope for MVP

- Full 3D or physics-based café.
- Voice/video calls or direct messaging.
- Paid subscriptions, paid cosmetics, loot boxes, or in-app purchases.
- User-uploaded arbitrary executable content.
- AI-generated crossword grids without validation.
- Complex recommendation models.
- Mobile native apps.
- Large-scale moderation automation.

These can be evaluated after the MVP is stable and actual usage provides evidence that they are needed.

---

## 14. Implementation phases

### Phase 1 — Foundation
- Create repository and app structure.
- Configure Supabase environments.
- Add migrations, auth, profiles, RLS, seed catalogue, and basic tests.
- Implement shared design tokens and navigation.

### Phase 2 — Library and reviews
- Search, book detail pages, shelves, review CRUD, reactions, moderation/report flow.
- Connect all screens to persisted data.
- Add loading/error/empty states.

### Phase 3 — Profiles, avatars, journal
- Profile editing and privacy.
- Layered avatar renderer and saved outfit configuration.
- Session timer, manual log rules, journal and stats.

### Phase 4 — Crossword
- Curated, validated daily puzzle data.
- Grid interaction and accessibility.
- Server-side completion validation, unique completion records, streak logic.

### Phase 5 — Café
- Illustrated 2D room.
- Seat claims and realtime presence.
- Avatar activity states, ambient audio, focus sessions, disconnect cleanup.

### Phase 6 — QA and release
- Test desktop/mobile layouts.
- Test RLS using separate accounts and unauthenticated sessions.
- Test concurrent seat claims and duplicate requests.
- Test crossword date boundaries and session interruptions.
- Verify secrets and production configuration.
- Configure backups, monitoring, domain, and deployment.

---

## 15. Required tests

At minimum, automate or document tests for:

1. User A cannot edit or delete User B's review.
2. User A cannot read User B's private journal or private shelves.
3. Guests cannot create reviews or write private records.
4. Duplicate reactions are rejected.
5. Two members cannot claim the same exclusive seat simultaneously.
6. Disconnected members do not remain indefinitely in live presence.
7. A user cannot submit a fake crossword solution or award their own streak from the client.
8. Repeated completion requests do not duplicate a daily reward.
9. A user cannot equip an item they do not own.
10. Focus session completion cannot create duplicated or implausible logged time.
11. Private profile settings are respected in public queries.
12. Core routes and interactions remain usable on mobile and with keyboard navigation.

---

## 16. Definition of done

A feature is not complete merely because its screen looks correct. It is done when:
- The UI is implemented and responsive.
- The real data model and persistence work.
- Access policies are tested.
- Validation and error states exist.
- The key user flow works from start to finish.
- Duplicate and unauthorised actions are handled.
- Automated tests or a repeatable manual test plan pass.
- Setup instructions and relevant environment variables are documented.

**Final product direction:** Build Dead Poets Club as a secure, modular full-stack web application with a distinctive editorial/grunge literary identity. Prioritise a genuinely working library and review system, then connect the café, crossword, avatars, and reading journal through one consistent account and data model.
