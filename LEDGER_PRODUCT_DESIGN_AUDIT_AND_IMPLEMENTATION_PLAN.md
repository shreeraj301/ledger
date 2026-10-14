# Ledger — product design audit and implementation plan

Date: 14 October 2026  
Status: audit and specification only. No source was changed.  
Live prototype (observed via page fetch, not interactive): https://ledger-chi-rust.vercel.app  
Code: https://github.com/shreeraj301/ledger

---

## 1. Executive summary

Ledger is a shared approval record for architects and homeowner clients. The current build is a well-written demo of that idea: warm paper, serif titles, calm status, a client view that does not ask for an account, and a sample project that reads like a real job. It is not yet a product someone can rely on.

**Current quality.** Craft is ahead of product. The visual system has a point of view. The data model matches the thesis. The experience fails the one promise the name makes: a record both people share.

**Strongest existing elements.**
- The product sentence is clear and narrow: a record of what was agreed, not chat, not CAD, not practice management.
- Client view at `/client/$projectId` is a different product from the studio, correctly.
- “Waiting on Meera” and phase purposes (“Sign each sheet before it goes to site”) are how the users already talk.
- Fee before yes on out-of-scope changes.
- Status is a word plus a dot, not colour alone.
- Sample narrative (Mehta residence, versions, a change, invoices that point backward) is inhabited, not lorem ipsum.

**Biggest weaknesses.**
- State is Zustand persisted to localStorage (`src/lib/ledger/store.ts`). A client link is not shared.
- Approvals stamp the project’s client name. Anyone with the link is Meera.
- Studio routes are public. “Reset sample studio” is on every studio page.
- Drawings are photographs. The primary user will notice.
- Approve is one tap, with no confirm, no undo, no “they have this.”
- Phases do not move. Invoices cannot be marked paid. Nothing can be exported.
- The accent `#FF385C` is Airbnb’s Rausch, left over from the original brief. It fights the warm-paper identity.

**Highest-impact opportunities.**
1. One record on two devices.
2. A yes that is confirmed, named, and timestamped.
3. Close the studio; keep the client on a token link.
4. Let a studio start from empty with a real image.
5. Make the phase and the invoice behave, then export the record.

**Recommended direction.** Keep the editorial system. Do not restyle for novelty. Finish the record, then tighten hierarchy, motion, and the few places the interface still feels like a demo.

**Five changes that matter most.**
1. Shared persistence. Until this works, nothing else is a product.
2. Confirm + identity on Approve.
3. Hide Reset; gate the studio.
4. Replace photo-as-drawing, or label photos as references.
5. One grammar and status fix on the home lede, and a quieter primary colour that belongs to Ledger.

---

## 2. Audit methodology and limitations

**Inspected.**
- `README.md`, `package.json`, `src/styles.css`, `src/routes/*`, `src/components/ledger/*`, `src/lib/ledger/*`.
- Design reference: `/workspace/attachments/DESIGN-airbnb.md` (original brief). The shipped UI deliberately departed from it toward warm paper and Fraunces. That departure is treated as intent, not a bug.
- Screenshots in `/workspace/screenshots/` (nav-mobile, client-stair-mobile, and the set listed below). These are from an earlier session, not recaptured now.
- Live routes fetched as text on 14 October 2026: `/`, `/drawings`, `/decisions`, `/changes`, `/billing`, `/client/mehta`, `/approve/req-m-stair`, `/approve/req-m-puja`.

**Not verified.**
- Interactive browser testing. The browser tool failed (`chrome not found`). No clicks, no keyboard pass, no real mobile device.
- Contrast measured with a tool. Values below are calculated from the tokens, not from a rendered page.
- Performance profiling. No Lighthouse, no trace.
- Screen reader output.
- Cross-browser behaviour.

**Facts vs hypotheses.** Findings tied to a file path or a fetched route are facts. Anything about “how it feels on a phone in the hand” or “what an architect would pay” is a hypothesis and is labelled as such.

---

## 3. Current product and experience overview

**What it does.** A project-phase record of drawings, decisions, scope changes, and invoices. The architect writes. The client approves from a link.

**Who it serves.** Primary: solo architects and small firms, starting in India. Secondary: homeowner clients, mostly on a phone.

**Problem.** Approvals and changes live in WhatsApp, email, and Drive. There is no shared “what was agreed.”

**Value proposition.** The timestamped agreement layer next to WhatsApp. Not a replacement for chat.

**Most important journey.** Architect sends a sheet or a change → client opens a link, no account → client approves or asks for a change → architect sees it on the record, and the invoice can point at it.

**Actions that should be effortless.** See what is waiting. Approve a drawing. Agree to a change after seeing the fee. Paste a WhatsApp message into the record. Find which approval an invoice rests on.

**What is different.** Scope and fee are written before yes. Decisions have a source (WhatsApp, approval, meeting, note). Superseded versions stay. The client never makes an account.

**What it already does well.** Language, phase model, client/studio split, fee band, sample story, restraint (almost no icons, no charts, no metric cards).

**Where it feels unfinished.** It cannot be shared. It cannot be started from empty. It cannot leave the screen. The home lede has a grammar error (“Working drawings is underway”). The accent colour is borrowed.

**Monetisation.** None exists. Not in the data model, not in the UI. Commercial notes in section 14 are optional.

---

## 4. Screen and route inventory

| Route | Purpose | Status | Main issue | Priority | Confidence |
|---|---|---|---|---|---|
| `/` | Studio timeline, waiting items, phases | Working demo | Lede grammar; phases do not move; not shared | P0 | High (source + fetch) |
| `/drawings` | Sheet versions, send for approval | Working demo | Photos as drawings; no upload | P1 | High |
| `/decisions` | Record + WhatsApp paste + filters | Working demo | Paste is manual; filter row scrolls | P1 | High |
| `/changes` | Out-of-scope changes with fee | Working demo | No image on compose; fee in rupees only | P1 | High |
| `/billing` | Invoices tied to approvals | Working demo | Cannot mark paid or export | P1 | High |
| `/client/$projectId` | Client home, no account | Working demo | Guessable id; same-browser only | P0 | High |
| `/approve/$requestId` | Approve, comment, request change | Working demo | One-tap approve; quiet secondary actions | P0 | High |
| (none) | Sign-in, new project, settings, 404 | Absent | No way to start or recover | P0 | High |

There is no landing page, no onboarding, no settings, no empty-studio state. `AuthProvider` in `src/routes/__root.tsx` is scaffold; Ledger does not use it.

---

## 5. Detailed UX audit

### 5.1 Timeline — `/` — `src/components/ledger/timeline.tsx`, `shell.tsx`

**Purpose.** Orient the architect: whose turn, what is open, where the project is.

**Strengths.** Cover, typology, household. Waiting list with image, status, copy link. Phase rail with a current mark and a one-line client role. Drawing thumbs under a phase.

**Problems.**
- Lede is built in code: `` `${current.name} is underway.` `` Singular verb for every phase name. “Working drawings is underway” is wrong. Evidence: `timeline.tsx` lines 15–20; confirmed on the live fetch.
- Waiting items and phase “open items” repeat the same fact.
- Phase thumbs scroll horizontally (`overflow-x-auto`). On a phone this is the pattern already rejected for the nav.
- Approving a request does not change `phase.status`. The gate is copy.
- Cover is a photograph of a house, not a drawing. Fine as a project portrait. Do not pretend it is a sheet.

**Changes.**
- Lede: “Working drawings are underway. 2 things are with Meera.” Use “are” when the phase name is plural; or drop the verb: “Working drawings · 2 things with Meera.”
- Phase thumbs: show two, then “+N sheets” linking to `/drawings`. No horizontal scroll.
- When every pending request in the current phase is approved, offer “Close this phase.” Do not auto-close.

**Success.** A new reader can say whose turn it is in under five seconds. The lede is grammatical. No sideways scroll on the timeline.

### 5.2 Drawings — `/drawings` — `src/components/ledger/drawings.tsx`

**Purpose.** Keep every version. Mark the one that counts. Send one for approval.

**Strengths.** “The one that counts is marked Latest approved.” Superseded copy is honest. Composer is inline, not a modal maze.

**Problems.**
- Every version is a full-bleed photo at 3:2. A sheet is not a lifestyle photo. Trust drops for the primary user.
- No compare. Two versions are stacked, never side by side.
- “Ask them to approve” is a primary button on every unapproved version, including old superseded ones. Easy to send the wrong sheet.
- No upload. `RequestComposer` has no file field.

**Changes.**
- Latest approved: full width. Superseded: a smaller row (thumb, label, date, note). Expand to see it.
- “Ask them to approve” only on the newest version that is not approved. Older versions: “Send this older version” as a quiet action.
- Until real PDF upload exists, label images “Reference photo, not the sheet.”

**Success.** An architect can point at the version that counts without scrolling past three hero images.

### 5.3 Decisions — `/decisions` — `src/components/ledger/decisions.tsx`

**Purpose.** The log. WhatsApp becomes a decision when it is written down.

**Strengths.** Source labels. Search. Phase filter. Paste form says it is not a formal approval. Empty filter state: “Nothing in the record matches that.”

**Problems.**
- The paste form is the first thing on the page, above the record. On a return visit the record should lead.
- Filter chips use `overflow-x-auto`. Same failure mode as the old nav.
- Saved confirmation is a line of text that does not say where the item landed.
- No meeting-note composer. Source type `meeting` exists in the model and is unused in the UI.

**Changes.**
- Record first. Paste form collapsed under “Add from WhatsApp,” opened on demand.
- Filters: wrap, or a single select on narrow screens. No horizontal scroll.
- After save, scroll the new item into view and mark it for one second.

**Success.** A pasted message is visible in the list without hunting.

### 5.4 Changes — `/changes` — `src/components/ledger/changes.tsx`

**Purpose.** Write scope and fee before yes.

**Strengths.** The lede is the product. Fee is set in the composer. Invoice stays draft until agreement (`store.ts`). “Open what they see” is the right link.

**Problems.**
- Eyebrow “OUTSIDE THE AGREED SCOPE” is tracked-out uppercase. The rest of the product does not do this. It reads as a template.
- Composer has no image and no “what was in scope.”
- Fee field is “Fee, in rupees.” Fine for the beachhead. Say so.

**Changes.**
- Drop the uppercase eyebrow. The lede and the fee already say it.
- Composer: optional reference image, and one line “This was not in the scope agreed on [date].”

**Success.** A client can see amount, time, and what changed without opening a second page. They already can, on the approval page. Keep that.

### 5.5 Billing — `/billing` — `src/components/ledger/billing.tsx`

**Purpose.** Amounts that point at a decision.

**Strengths.** “Why this amount.” “Supported by” links to the approval. Total due in the lede. Paid / due / draft are words.

**Problems.**
- No action. Cannot mark paid, send, or download.
- Concept invoice in the seed has a supporting approval; design-development invoice has none. The pattern is inconsistent in the sample, which teaches the wrong thing.

**Changes.**
- “Mark as paid” on Due, with a confirm. Paid invoices stay on the list, quieter.
- Every sample invoice should have a supporting decision, or an explicit “No linked approval.”

**Success.** An architect can answer “why this invoice” in one tap, and close it when paid.

### 5.6 Client home — `/client/$projectId` — `src/components/ledger/client-pages.tsx`

**Purpose.** The homeowner’s only page.

**Strengths.** “Shared with you · no account needed.” Cover, who is keeping the record, current phase, “For you,” recent record. Narrow column (`max-w-lg`). This is the right shape.

**Problems.**
- Open items appear again under “Recently on the record.” Two lists, one job.
- No signal that the architect will see the answer.
- Project id is the slug (`mehta`). Guessable.
- If the project is missing: “This link doesn’t match a project in the studio.” Correct, and rare only because data is local.

**Changes.**
- “For you” is the only list of open items. Recent record shows decided and noted items only.
- Under the phase: “Ananya will see your answer on this record.”
- Client URL becomes an unguessable token. Out of visual scope; required for trust.

**Success.** A client knows what to do, and believes it will be seen.

### 5.7 Approval — `/approve/$requestId` — `src/components/ledger/client-pages.tsx`

**Purpose.** One decision.

**Strengths.** Phase, title, prompt in plain words, photo, fee band on changes (“You’ll see this amount before you agree”), Approve as the only primary, footer with who sent it.

**Problems.**
- Approve is one tap. No confirm. No undo. For a ₹1,85,000 change this is too cheap.
- Comment and Request a change are `QuietButton`: underline, easy to miss, especially on a phone.
- No “who is approving.” The store writes `project.clientName`.
- After approve, the page shows status but does not say the architect has it.
- Options UI exists (select a card, then approve) but the seed has no options request. Untested in the sample.

**Changes.**
- Approve opens a short confirm: “Approve the stair. This goes on the record as [name].” Name field, prefilled, editable once.
- Secondary actions become real buttons, secondary style, not underlines.
- Success state: “Saved. Ananya can see this.” Plus the timestamp.

**Success.** A client can approve, comment, or ask for a change without guessing which control does which. A yes is reversible for a short window, or at least confirmed.

---

## 6. Visual-design audit

**Reference.** `attachments/DESIGN-airbnb.md` specified white canvas and Rausch `#FF385C`. The shipped UI moved to warm paper `#f6f3ee`, ink `#1c1916`, Fraunces + Source Sans 3. That move is the right one for this product. Do not revert to pure white. Do retire Rausch as the brand accent.

**Typography.** Display is Fraunces 500–600, `clamp(2rem … 2.75rem)`. Titles are 1.5rem. Body is Source Sans 3. Hierarchy is carried by the serif, which is correct. Gaps: no defined label, caption, or numeric styles. Amounts use `tabular-nums` in places and not in others. Letter-spacing is untouched except the one uppercase eyebrow.

**Colour.** Tokens live in `src/styles.css`. Canvas, ink, body, muted, hairline, surface are a coherent warm set. Primary is the outlier. Error `#C13515` / `#ff8f78` is fine. No success or warning token. Status reuses primary (waiting), ink (approved), muted (noted), error (change requested). That is enough if the word is always present. It is.

**Spacing.** Page gutters `px-5 md:px-8`. Content `max-w-5xl` studio, `max-w-lg` client. Section gaps are 10–16 in Tailwind steps, not a named scale. Consistent enough. Not a system.

**Surfaces.** Mostly flat with hairline dividers. Cards appear for waiting items (`bg-surface`) and the paste form. Not everything is a card. Good. Shadow is one token, used on hover. Good.

**Icons.** Lucide, sun and moon only, in `theme.tsx`. Correct. Do not add an icon set for decoration.

**Imagery.** `public/photos/*` are architectural photographs. They work as project portraits and as client-facing references. They fail as drawing sheets.

**Divergence to keep.** Warm paper, serif titles, quiet chrome, client column.  
**Divergence to fix.** Rausch as the only accent. Uppercase tracked eyebrows. Pill on every control.

---

## 7. Proposed art direction

**Character.** A paper record that happens to be on a screen. Warm, specific, quiet. Closer to a well-set drawing issue than to a SaaS dashboard.

**Personality.** Direct. Specific. Does not sell. Does not cheer.

**Principles.**
- Type carries hierarchy. Borders do not.
- One accent, used only for “a person must act.”
- Photography is a portrait or a reference, never a fake sheet.
- The client view is a letter. The studio view is a register.
- No chrome that does not name a project, a phase, or a person.

**Avoid.** Purple gradients, glass, metric cards, three-column feature grids, emoji, decorative blobs, ambient motion, a second accent, uppercase eyebrows, icons on every row.

**Accent proposal.** Replace `#FF385C` with a warm oxide that belongs to the paper: `#9C3B2E` (light) and `#E07A68` (dark). Still the only colour that means “waiting” or “approve.” Hypothesis: this will read as Ledger, not as Airbnb. Validate on the stair approval page before rolling it through.

---

## 8. Design-system specification

Existing values are from `src/styles.css`. Proposed values are marked.

### Colour

| Token | Existing | Proposed | Role |
|---|---|---|---|
| canvas | `#f6f3ee` / `#12110f` | keep | Page |
| ink | `#1c1916` / `#f3eee6` | keep | Titles, primary text |
| body | `#3f3a34` / `#d4cdc3` | keep | Body |
| muted | `#6f675e` / `#a89f94` | keep | Meta |
| hairline | `#e3dbd1` / `#2e2924` | keep | Dividers, field borders |
| surface | `#efeae3` / `#1c1916` | keep | Waiting rows, form wells |
| primary | `#FF385C` | `#9C3B2E` / `#E07A68` | Approve, current phase, waiting dot |
| primary-active | `#E00B41` | `#7C2E24` | Pressed primary |
| error | `#C13515` | keep | Change requested, form error |
| success | none | ink + word “Approved” | Do not add a green |
| focus | ink outline 2px | keep | Focus |

Contrast, calculated, not measured on screen: ink on canvas is strong. Muted `#6f675e` on `#f6f3ee` is about 5.3:1. Body is fine. Primary text on primary button must stay white. Re-check oxide on white and on canvas before shipping.

### Type

| Role | Family | Size | Weight | Line height |
|---|---|---|---|---|
| Display | Fraunces | clamp 2rem–2.75rem | 500 | 1.12 |
| Title | Fraunces | 1.5rem | 500 | 1.25 |
| Section | Fraunces | 1.25rem | 500 | 1.3 |
| Body | Source Sans 3 | 1rem | 400 | 1.5 |
| Label | Source Sans 3 | 0.875rem | 500 | 1.4 |
| Meta | Source Sans 3 | 0.875rem | 400 | 1.4 |
| Amount | Fraunces | 1.5rem | 500 | 1.2, tabular-nums |

No size above display. No weight above 600. Width of body copy stays `max-w-2xl`.

### Space and geometry

| Token | Value | Use |
|---|---|---|
| gutter | 20px / 32px from md | Page |
| content | 64rem studio, 32rem client | Max width |
| section | 40px / 56px | Between blocks |
| stack | 8 / 12 / 16 | Inside a block |
| radius-sm | 8px | Fields, buttons that are not primary-on-client |
| radius-md | 14px | Photos, waiting rows |
| radius-lg | 20px | Cover only |
| radius-full | client primary, pills that are filters | Not every control |
| border | 1px hairline | Fields, dividers |
| shadow | existing lift, hover only | Do not add more |

### Breakpoints

Use Tailwind defaults already in the code: default, `sm` 640, `md` 768. Do not add new ones. Studio nav is a 5-column grid below `sm` and a row from `sm`. Client is a single column at all widths.

### Interaction states

- Primary: hover darkens, press darkens further, disabled is `primary-soft` and not clickable.
- Quiet: underline on hover only. Promote comment/change off this style.
- Focus: 2px ink outline, offset 2. Already in `styles.css`. Keep.
- Fields: border becomes ink on focus. Already. Keep.

---

## 9. Motion and interaction specification

**Current.** One transition: theme colour, 220ms, `cubic-bezier(0.22, 1, 0.36, 1)`, gated by `.theme-ready` (`styles.css`). Reduced motion collapses all transitions to 0.01ms. No animation library is used by Ledger. `tw-animate-css` is a dependency and is unused here. Do not add Framer Motion.

### Tokens

| Token | Duration | Easing | Use |
|---|---|---|---|
| instant | 120ms | cubic-bezier(0.2, 0, 0, 1) | Hover, press |
| state | 200ms | cubic-bezier(0.22, 1, 0.36, 1) | Panels, confirm, theme |
| enter | 280ms | cubic-bezier(0.22, 1, 0.36, 1) | Route content fade |

No spring. No overshoot. No stagger on lists.

### Specifications

| Component | Trigger | From | To | Duration | Easing | Properties | Purpose | Reduced motion |
|---|---|---|---|---|---|---|---|---|
| Theme | Toggle | current colours | other theme | 200ms | state | background, color, border | Continuity | Instant |
| Primary button | Hover / press | rest | darker / scale 0.98 | 120ms | instant | background, transform | Press feedback | Colour only |
| Confirm sheet | Approve tap | absent | in, y 8px → 0 | 200ms | state | opacity, transform | Show the yes | Instant in |
| Composer | Open | height 0 | auto | 200ms | state | grid-template-rows, opacity | Reveal form | Instant |
| Filter | Press | off | on | 120ms | instant | background, color | State | Instant |
| Copy link | Success | “Copy link” | “Link copied” | 0 | — | text | Confirm | Same |
| New decision | After paste | — | row visible | 200ms | state | opacity | Show where it landed | Instant |
| Route | Navigate | — | — | 0 | — | — | Do not animate routes | — |

**Scroll.** All routes are normal document scroll. Header is `sticky top-0` (`shell.tsx`). Keep it. Do not add scroll reveals, progress bars, snap, or parallax. Phase rail is not sticky. Client approval actions are not sticky; on a long prompt they should be, from the fee band down, so Approve stays in thumb reach. Sticky region starts at the action group and stops at the footer.

**Do not animate:** list filtering, image load, page enter beyond a 8px fade if it costs nothing, the phase dots.

---

## 10. Redesigned screen specifications

### Timeline
- Lede is one grammatical sentence.
- Waiting list unchanged in structure.
- Phase thumbs: max two, then a text link. No overflow-x.
- Current phase mark stays the only coral/oxide on the page besides waiting dots.

### Drawings
- Latest version large. Older versions as rows.
- Primary action only on the current unapproved version.
- Reference label under photos until real sheets exist.

### Decisions
- List first.
- “Add from WhatsApp” expands the existing form.
- Filters wrap. Search stays.

### Changes
- No uppercase eyebrow.
- Composer gains optional image.
- Fee and time stay as they are.

### Billing
- Same list.
- Due rows gain “Mark as paid,” confirmed.
- Paid rows drop to ink-muted.

### Client home
- “For you” only for open items.
- Recent record excludes pending.
- One line: the architect will see the answer.

### Approval
- Fee band unchanged on changes.
- Primary becomes “Approve” → confirm sheet with name.
- Comment and Request a change are secondary buttons, full height, not underlines.
- Success replaces the buttons: status, timestamp, “Ananya can see this.”

Empty, loading, error:
- Empty waiting: already good (“Nothing open. The record is quiet.”).
- Empty changes: already good.
- Loading: data is sync today. When it is not, a single line “Loading the record,” not a skeleton grid.
- Error on approve: keep the existing inline sentence. Add `role="alert"`.
- Missing project: keep the current sentence.

---

## 11. User-journey improvements

| Step | Now | Proposed | Benefit |
|---|---|---|---|
| First visit | Drops into Mehta sample | Same for the demo. A real studio starts at “New project.” | Demo stays. Product can start. |
| See what is waiting | Timeline lede + list | Same, grammatical | Faster trust |
| Send for approval | Inline composer, copy link | Same, plus a real shared id | The link works on another phone |
| Client opens link | No account | No account, token url, name once | Still no signup |
| Client approves | One tap | Confirm + name | A yes means something |
| Architect sees it | Only in the same browser | Same record | The product exists |
| Invoice | Points at approval, static | Points at approval, can be marked paid | Closes the loop |

Edge cases: client approves offline (show “Not saved — try again”); two people open the same link (last write wins, show who and when); architect resets (confirm, demo only).

---

## 12. Accessibility audit

**Not tested with a screen reader or keyboard-only pass.** Risks from source:

| Issue | Severity | Where | Fix | Test |
|---|---|---|---|---|
| Status dot is `aria-hidden` and text is present | OK | `StatusMark` | Keep | Name is the word |
| Theme toggle has sr-only | OK | `theme.tsx` | Keep | Button name changes with theme |
| Focus ring is ink, 2px | OK | `styles.css` | Keep | Tab through studio and client |
| Copy link fallback exposes a field | OK | `primitives.tsx` | Keep | Fail clipboard, field appears |
| Confirm sheet (proposed) | — | approval | Focus trap, Esc cancels, return focus to Approve | Keyboard |
| Error text | Medium | approval, paste | Add `role="alert"` | Error fires, SR announces |
| Phase thumbs `alt=""` | Low | timeline | Use drawing title | Image has a name |
| Filter chips not a tablist | Low | decisions | `aria-pressed` already set. Keep. | State announced |
| Colour-only status | OK | dots always have a word | Keep the word | — |
| Touch targets | OK | h-11 / h-12 on actions | Keep ≥44px | Phone |
| Reduced motion | OK | global media query | Keep. Do not also animate layout. | OS setting |
| Contrast of muted | Risk | `#6f675e` on `#f6f3ee` | Measure. If under 4.5, darken muted | Tool |
| Zoom to 200% | Untested | — | Content must not require sideways scroll | Browser zoom |

WCAG 2.2 AA is the target. Do not claim it until the keyboard pass and contrast check are done.

---

## 13. Performance audit

**Observed from source, not profiled.**
- Google Fonts render-blocking stylesheet in `__root.tsx`. Risk of FOUT and layout shift. Self-host Fraunces and Source Sans 3, `font-display: swap`, preload the two weights used.
- Photos in `public/photos` are served as-is. No `srcset`, no explicit width/height on `Photo`. Layout shift risk. Add width/height or aspect-ratio (aspect is already set via class, which helps).
- No virtualisation. Lists are small. Fine.
- No scroll listeners. Good.
- `tw-animate-css`, `recharts`, `cmdk`, a large Radix set, and `framer`-less stack are in `package.json`. Ledger uses almost none of it. Do not add more. Do not remove scaffold deps in this pass unless a bundle check says they ship to the client.
- Theme transition applies to `body *`. Cheap enough. Do not extend it.

**Measure before targets:** Lighthouse on `/` and `/approve/req-m-stair`, mobile, cold load. Note LCP (the cover) and CLS.

---

## 14. Commercial-readiness audit

**Clarity.** A new visitor lands inside a sample project. There is no sentence that says what Ledger is, except the footer: “A record of what was agreed.” Hypothesis: an architect understands in under a minute because the sample is specific. A stranger does not.

**Differentiation.** Real, and visible: fee before yes, WhatsApp as a source not a chat, no client account.

**Time to value.** In the demo, immediate. In a real studio, blocked, because they cannot create a project.

**Trust.** Undermined by “Saved in this browser,” public Reset, and a yes that is not a person.

**Reasons to leave.** The link does not sync. They will go back to WhatsApp.

**Reasons to return.** If the record is actually shared, the invoice question brings them back.

**Pay.** Optional. A studio would pay for a record that survives a dispute and a second device. They will not pay for a local demo. No pricing UI should be added until the shared record works.

Do not add testimonials, logos, or usage numbers.

---

## 15. Anti-pattern removal list

| Pattern | Verdict | Why |
|---|---|---|
| Pill on every control | Refine | Keep on client primary and filters. Fields and studio primary can be radius-sm. |
| Uppercase tracked eyebrow | Remove | Only on changes. Inconsistent. |
| Horizontal scroll | Remove | Phase thumbs, decision filters. |
| Letter-L mark | Keep for now | Fine for the demo. Not a launch mark. |
| Rausch coral | Replace | Borrowed. See art direction. |
| Cards everywhere | Not present | Do not introduce. |
| Metric cards, charts, gradients, glass, emoji | Not present | Do not introduce. |
| Huge headings | Not present | Display is capped. Keep the cap. |
| One-tap destructive | Fix | Approve and Reset both need a confirm. |

---

## 16. Codebase implementation map

| File | Responsibility | Change | Depends on | Risk | Verify |
|---|---|---|---|---|---|
| `src/styles.css` | Tokens, focus, reduced motion | Oxide primary, motion tokens | None | Visual regression | Stair page, dark mode |
| `src/components/ledger/timeline.tsx` | Home | Grammar, thumb limit | None | Low | `/` lede |
| `src/components/ledger/drawings.tsx` | Versions | Collapse superseded, gate the button | None | Medium | Send only latest |
| `src/components/ledger/decisions.tsx` | Log | Collapse paste, wrap filters | None | Low | Paste still saves |
| `src/components/ledger/changes.tsx` | Changes | Remove eyebrow | None | Low | Fee still visible |
| `src/components/ledger/billing.tsx` | Invoices | Mark paid | store action | Medium | Status flips |
| `src/components/ledger/client-pages.tsx` | Client + approve | Confirm, name, secondary buttons, dedupe lists | store | High | Two-device once backed |
| `src/components/ledger/primitives.tsx` | Buttons, photo, copy | Secondary button, alert role | None | Low | Keyboard |
| `src/components/ledger/shell.tsx` | Studio chrome | Reset confirm; later hide behind auth | Auth later | Medium | Reset still works in demo |
| `src/lib/ledger/store.ts` | Persistence | Shared backend replaces persist | Supabase or equivalent | High | Two devices |
| `src/lib/ledger/format.ts` | INR, Kolkata | Keep for beachhead; locale later | — | Low | Amounts unchanged |
| `src/routes/__root.tsx` | Fonts, title | Self-host fonts | None | Low | No FOUT |

Unverified: whether `AuthProvider` can be reused for studio login. It is scaffold. Do not assume it fits without reading it for this task. Marked unverified.

---

## 17. Prioritised implementation roadmap

**Priority.** P0 blocks real use. P1 is the difference between demo and product. P2 is craft. P3 is later.  
**Effort.** S under a day, M a few days, L a week, XL more.

### Phase A — Critical foundations

| ID | Priority | Impact | Effort | Depends | Files | Done when | Test |
|---|---|---|---|---|---|---|---|
| A1 | P0 | Shared record | XL | — | `store.ts`, new server | Approve on phone, see it on laptop | Two devices |
| A2 | P0 | A yes is a person | M | A1 | `client-pages.tsx` | Confirm + name + timestamp | Keyboard and tap |
| A3 | P0 | Studio is not public | L | A1 | `shell.tsx`, auth | Reset and studio need login | Logged-out visit |
| A4 | P1 | Grammar and waiting copy | S | — | `timeline.tsx` | “are underway” or no verb | Read `/` |
| A5 | P1 | No sideways scroll | S | — | `timeline.tsx`, `decisions.tsx` | No overflow-x on those blocks | 390px |
| A6 | P1 | Secondary actions visible | S | — | `client-pages.tsx`, `primitives.tsx` | Comment and change are buttons | Phone |

### Phase B — Visual identity

| ID | Priority | Impact | Effort | Depends | Files | Done when | Test |
|---|---|---|---|---|---|---|---|
| B1 | P2 | Accent belongs to Ledger | S | — | `styles.css` | Oxide in use, Rausch gone | Stair, dark |
| B2 | P2 | Type scale written down | S | — | `styles.css` | Label and amount styles exist | Billing |
| B3 | P2 | Photos labelled as references | S | — | `drawings.tsx` | Caption present | `/drawings` |
| B4 | P2 | Self-hosted fonts | M | — | `__root.tsx`, `public/fonts` | No Google CSS | Network tab |

### Phase C — Motion and craft

| ID | Priority | Impact | Effort | Depends | Files | Done when | Test |
|---|---|---|---|---|---|---|---|
| C1 | P2 | Confirm sheet motion | S | A2 | `client-pages.tsx` | 200ms, reduced = instant | OS setting |
| C2 | P2 | Press feedback on primary | S | — | `primitives.tsx` | 120ms, no bounce | Tap |
| C3 | P2 | Sticky approve on long pages | S | — | `client-pages.tsx` | Actions stay in thumb reach | Long prompt |
| C4 | P3 | Paste lands in view | S | — | `decisions.tsx` | New row focused | Paste |

### Phase D — Production refinement

| ID | Priority | Impact | Effort | Depends | Files | Done when | Test |
|---|---|---|---|---|---|---|---|
| D1 | P1 | Mark invoice paid | M | A1 | `billing.tsx`, `store.ts` | Due → Paid | Billing |
| D2 | P1 | Export PDF | L | A1 | new | One file, phase + decisions + fees | Open PDF |
| D3 | P1 | New project | L | A1, A3 | shell, store | Empty studio can start | Create |
| D4 | P2 | Contrast and keyboard pass | M | B1 | — | AA on text, full tab order | Tool + keyboard |
| D5 | P2 | Lighthouse baseline | S | B4 | — | Numbers recorded | Mobile `/` |

Do not start B or C before A1 is in progress. A4, A5, A6 can ship on the demo now.

---

## 18. Acceptance criteria

- [ ] Architect and client see the same approval on two devices.
- [ ] Approve requires a confirm and a name.
- [ ] Reset is not available to a logged-out visitor.
- [ ] Home lede is grammatical.
- [ ] No horizontal scroll on timeline or decision filters at 390px.
- [ ] Comment and Request a change are visible buttons.
- [ ] Fee is visible before agree on a change.
- [ ] Invoice can be marked paid.
- [ ] Record exports to a PDF.
- [ ] Focus ring visible on every control.
- [ ] Reduced motion removes transitions.
- [ ] No Rausch in the UI.
- [ ] Photos of houses are not presented as drawing sheets.
- [ ] Sample can still be loaded for a demo.

---

## 19. Regression and QA test plan

**Journeys.**
1. Open `/`, switch to Iyer, switch back. Data matches the project.
2. Send a drawing for approval. Copy link. Open it. Approve. See it on timeline and decisions.
3. Record a change with a fee. Client agrees. Invoice moves from draft to due.
4. Paste a WhatsApp message. It appears attributed, not as approved.
5. Reset restores the seed.

**Keyboard.** Tab from header through nav, project switch, waiting links, footer. On approval: Approve, Comment, Request a change, textarea, submit. Esc closes confirm.

**Reduced motion.** OS setting on. Theme toggle and confirm appear without travel.

**Mobile.** 390px. Nav fits. No sideways scroll. Approve reachable without hunting.

**Loading and error.** Kill the network after A1. Approve shows an error, does not claim success.

**Persistence.** Refresh keeps the decision. Second browser sees it after A1.

**Browsers.** Chrome, Safari, Firefox. Latest. Safari is the client’s likely browser.

**Visual.** Screenshot `/`, `/approve/req-m-stair`, `/client/mehta` in light and dark before and after B1.

**Performance.** Lighthouse mobile on `/` before and after font self-host.

---

## 20. Final recommendations

**Five decisions.**
1. Shared persistence is the product. Everything else waits on it.
2. Keep the warm-paper system. Change the accent, not the personality.
3. Client stays a link. Studio gets a login.
4. A yes is confirmed and named.
5. Photographs are references until real sheets exist.

**Order.** A4, A5, A6 on the demo now. A1, A2, A3 next. Then D1, D2, D3. B and C in the gaps.

**Do not.** Restyle into a generic SaaS dashboard. Add chat. Add charts. Add onboarding. Add a second accent. Animate routes. Claim research numbers the product does not have.

**Uncertainties.** Whether oxide passes contrast in dark mode. Whether the scaffold auth can be reused. What a studio will pay. All three are open.

**Done looks like.** An architect sends a link. A client approves on a phone, sees the fee first, confirms their name. The architect sees it, marks the invoice, and can hand someone a PDF. The page still feels like a paper record, not a template.
