# Ledger — design audit

Date: 14 October 2026  
Scope: how Ledger looks, feels, and behaves as a designed experience.  
Not in scope: backend, authentication, shared persistence, database, billing logic, export, APIs, product strategy, monetisation.

Source of evidence: `src/styles.css`, `src/components/ledger/*`, `src/routes/__root.tsx`, `src/lib/ledger/format.ts`, `attachments/DESIGN-airbnb.md`, screenshots in `/workspace/screenshots/`, and text fetches of the live routes. Interactive browser testing was not available this session (`chrome not found`). Anything about in-hand feel is labelled unverified.

Preserve: warm paper, Fraunces, Source Sans 3, quiet chrome, client column, editorial character. Do not turn this into a SaaS dashboard.

---

## 1. Current visual design audit

**What works**
- Canvas `#f6f3ee` and ink `#1c1916` read as paper, not as a product template. Dark mode is a warm ink, not a generic near-black.
- Fraunces on titles and Source Sans 3 on body is a real pairing. Hierarchy is carried by type, not by boxes.
- Almost no icons. Sun and moon only. Status is a word plus a dot.
- Studio is a register (`max-w-5xl`). Client is a letter (`max-w-lg`). That split is the identity.
- Surfaces are mostly flat, with hairline dividers. Cards are used for waiting rows and the paste form, not for everything.
- One shadow token, used on hover. Focus is a 2px ink outline.

**What does not**
- Primary `#FF385C` is Airbnb’s Rausch, from `DESIGN-airbnb.md`. It fights the paper. It is the only thing that looks borrowed.
- “OUTSIDE THE AGREED SCOPE” on Changes is tracked-out uppercase. Nothing else in the product does this.
- Every control is a pill or a full radius. Filters, copy link, project switch, client primary, quiet buttons. The shape language has no rank.
- Drawings are full-bleed photographs at 3:2, presented as sheets. They are references. The fiction breaks.
- Phase thumbs and decision filters scroll sideways. The nav was already fixed for this. These were not.
- Home lede is ungrammatical: “Working drawings is underway.” Built in `timeline.tsx`.

**Inconsistencies**
- Amounts use `tabular-nums` on billing and changes, not everywhere a number appears.
- Secondary actions on the approval page are underlines. Everywhere else a secondary action is a bordered button or a text link with weight.
- Sample invoices sometimes have a supporting approval and sometimes do not. The “Supported by” block appears and disappears with no design rule.
- Waiting items on the client home repeat under “Recently on the record.”

**Worth preserving**
- The paper palette, both themes.
- Fraunces for names and titles only.
- The phase rail: a dot, a line, a sentence.
- “Waiting on Meera,” “Superseded, still here if you need it,” “You’ll see this amount before you agree.”
- Client view as a narrow column with a cover.
- No charts, no metric cards, no eyebrows except the one to remove.

---

## 2. Art direction and visual identity

**Desired aesthetic.** A paper record on a screen. Warm, specific, quiet. Closer to a drawing issue than to a dashboard.

**Personality.** Direct. Names people. Does not sell. Does not cheer.

**Principles**
- Type carries hierarchy. Borders do not.
- One accent, and only where a person must act.
- Photography is a portrait or a reference, never a fake sheet.
- The client view is a letter. The studio view is a register.
- Chrome names a project, a phase, or a person, or it is not there.

**What makes it distinctive.** The sample is a story (mango tree, court wall, stair). The language is spoken. The client page has no app chrome beyond the word Ledger and a theme toggle. That restraint is the brand. Generic AI interfaces fill the same space with cards, icons, and a gradient.

**Do not.** Purple gradients, glass, blobs, emoji, a second accent, ambient motion, three-column feature grids, uppercase eyebrows, an icon on every row.

**Accent.** Replace Rausch with a warm oxide that belongs to the paper: `#9C3B2E` on light, `#E07A68` on dark. Still the only colour for Approve, the current phase, and a waiting dot. Hypothesis, not tested on a rendered page: this will read as Ledger. Check it on the stair approval page before rolling it through.

---

## 3. Typography

**Existing.** Fraunces opsz 9–144, weights 500 and 600. Source Sans 3, 400 / 500 / 600 and italic 400. Loaded from Google Fonts in `src/routes/__root.tsx`. Display is `clamp(2rem, 1.45rem + 1.6vw, 2.75rem)` at line-height 1.12. Title is 1.5rem / 1.25. Body is 1rem. `text-wrap: balance` on headings, `pretty` on paragraphs.

**Proposed scale.** No size above display. No weight above 600.

| Role | Family | Size | Weight | Line height | Use |
|---|---|---|---|---|---|
| Display | Fraunces | clamp 2rem–2.75rem | 500 | 1.12 | Page title, client project name |
| Title | Fraunces | 1.5rem | 500 | 1.25 | Section, current phase, invoice amount |
| Section | Fraunces | 1.25rem | 500 | 1.3 | Block heading |
| Body | Source Sans 3 | 1rem | 400 | 1.55 | Prompts, notes |
| Label | Source Sans 3 | 0.875rem | 500 | 1.4 | Field labels, “Why this amount” |
| Meta | Source Sans 3 | 0.875rem | 400 | 1.4 | Dates, sheet numbers, phase span |
| Amount | Fraunces | 1.5rem | 500 | 1.2 | Fees and invoice totals, `tabular-nums` |

**Spacing.** Title sits 4px under its meta line. Body sits 8px under a title, 12px under a display. Meta never above a title except the sheet number on Drawings, which is correct: the number is the index, the name is the thing.

**Labels.** Sentence case. No tracking. No uppercase.

**Numbers.** Fees, invoice totals, and “2 open items” use tabular figures. Dates stay proportional.

**Responsive.** Display clamps. Everything else is fixed. On a 390px screen the display should not wrap a project name into four lines; `text-wrap: balance` already helps. Do not shrink body below 1rem.

**Verify.** Billing amounts align in a column. A long project name on the client page stays two lines or fewer at 390px.

---

## 4. Colour system

**Existing light.** Canvas `#f6f3ee`, ink `#1c1916`, body `#3f3a34`, muted `#6f675e`, muted-soft `#a39a90`, hairline `#e3dbd1`, surface `#efeae3`, primary `#FF385C`, error `#C13515`.

**Existing dark.** Canvas `#12110f`, ink `#f3eee6`, body `#d4cdc3`, muted `#a89f94`, hairline `#2e2924`, surface `#1c1916`, primary `#ff4d6d`, error `#ff8f78`.

**Proposed.** Keep every token except primary. Primary becomes `#9C3B2E` / `#E07A68`. Primary-active `#7C2E24`. Primary-soft a 12% wash of the oxide, not the current pink `#ffd6de`.

**Semantic use**
- Oxide: Approve, current-phase dot, waiting dot, due dot. Nowhere else.
- Ink: approved, paid, closed, headings.
- Muted: noted, superseded, draft, dates.
- Error: change requested, form error. Word always present.
- No success green. “Approved” in ink is the success state.

**Contrast.** Calculated, not measured on screen. Ink on canvas is strong. Muted `#6f675e` on `#f6f3ee` is about 5.3:1 — above 4.5, close enough to re-check with a tool. Oxide on white must keep white label text. Oxide on canvas as a large fill should not happen; it is a button and a dot.

**Dark.** Oxide `#E07A68` on `#12110f` needs a contrast check before it is used as button text. Button text stays white. Dot can be the oxide.

**Verify.** Stair approval in light and dark. Waiting dot distinguishable from ink without relying on colour alone — the word is already there.

---

## 5. Layout and composition

**Widths.** Studio `max-w-5xl` (64rem). Client `max-w-lg` (32rem). Keep both.

**Gutters.** `px-5` (20px), `md:px-8` (32px). Keep.

**Density.** Studio can be a register: list rows, dividers, meta on the same line as a title. Client should stay sparse: one image, one title, one action. Do not densify the client. Do not sparse the studio into cards.

**Whitespace.** Section gaps of 40–56px. Inside a block, 8 / 12 / 16. Do not add more air to “make it premium.”

**Alignment.** Titles and amounts share a baseline row on billing and changes. Keep that. Meta is right-aligned on wide, wraps under on narrow.

**Dividers.** 1px hairline between list rows and between drawing sheets. Prefer a divider to a card.

**Surfaces.** `bg-surface` only for a waiting row, a fee band, and an open form. Not for every section.

**Borders.** 1px hairline on fields and on secondary buttons. No ornamental borders.

**Shadows.** The existing lift, on hover of a linked row only. No resting shadow.

**Radii.** 8px fields and studio buttons. 14px photos and rows. 20px cover only. Full radius on the client primary, the theme toggle, and filter chips. Nothing else.

**Hierarchy.** On every studio page: display title, one lede, then the work. On the client page: wordmark, cover, name, one status, then the thing to do.

**Verify.** At 1280px the studio text column does not stretch edge to edge. At 390px the client column has 20px of air on each side and no horizontal scroll.

---

## 6. Screen-by-screen visual and UX audit

### `/` Timeline
- **Wrong.** Lede grammar. Phase thumbs scroll sideways. Waiting list and “2 open items” say the same thing twice.
- **Change.** “Working drawings are underway. 2 things are with Meera.” Or drop the verb. Thumbs: two, then “+N sheets.” No overflow-x.
- **Looks like.** Cover full width, 16:9, radius 20px. Waiting rows stay surface, image left, text right from `sm`. Phase rail unchanged.
- **Why.** The first sentence is the product. A sideways scroll here is the failure already fixed in the nav.
- **Verify.** Read the lede. At 390px the phase block does not scroll sideways.

### `/drawings`
- **Wrong.** Every version is a hero photograph. “Ask them to approve” is a primary button on old versions too.
- **Change.** Latest version large. Older versions as a row: thumb 96px, label, date, note. Primary button only on the newest unapproved version. Caption under images: “Reference photo, not the sheet.”
- **Looks like.** A register of sheets, not a gallery.
- **Why.** The version that counts should be obvious. Sending an old sheet should be harder than sending the current one.
- **Verify.** Superseded versions are not full-bleed. Only one primary button per sheet.

### `/decisions`
- **Wrong.** The paste form leads the page. Filter chips scroll sideways. “Added to the record” does not show where.
- **Change.** List first. “Add from WhatsApp” expands the existing form. Filters wrap, or become one select below `sm`. After save, the new row is in view.
- **Looks like.** A log. The form is a tool, not the page.
- **Why.** Return visits are about reading, not pasting.
- **Verify.** First paint is the list. No sideways scroll on the filters at 390px.

### `/changes`
- **Wrong.** Tracked uppercase eyebrow. Otherwise this page is right.
- **Change.** Remove the eyebrow. Keep the lede, the fee in Fraunces, the time, the prompt.
- **Looks like.** Title, amount, sentence. Same as billing.
- **Why.** The lede already says it is outside scope. The eyebrow is the one template gesture in the product.
- **Verify.** No uppercase tracking on the page. Fee still sits above the prompt.

### `/billing`
- **Wrong.** Visually it is the best studio page. The only design gap is a Due row with no next step on the surface, and Paid looking identical to Due except for the word.
- **Change.** Due rows keep the amount in Fraunces. Paid rows: amount in muted, word “Paid.” Draft rows stay as they are. Do not add a pay button style that looks like a checkout.
- **Looks like.** A ledger. Numbers in a column. “Why this amount” as a label, then the sentence.
- **Why.** Status should be readable at a glance without a new colour.
- **Verify.** Three invoices, three visual weights, one column of amounts.

### `/client/$projectId`
- **Wrong.** Open items repeat in “Recently on the record.” No line that the answer will be seen.
- **Change.** “For you” is only open items. Recent record is decided and noted only. Under the phase: “Ananya will see your answer on this record.”
- **Looks like.** Cover, name, one phase, then the things to do, then the past. Narrow column.
- **Why.** One list, one job. The repeated items make the page feel unfinished.
- **Verify.** A pending stair does not appear twice.

### `/approve/$requestId`
- **Wrong.** Approve is one tap. Comment and Request a change are underlines and easy to miss. Success is a status mark and a sentence, with no sense of arrival.
- **Change.** Approve opens a confirm sheet: title, name field, “Approve” and “Back.” Comment and Request a change become secondary buttons, 48px tall, side by side under the primary. Success replaces the buttons: “Saved. Ananya can see this.” and the timestamp.
- **Looks like.** One photograph, one prompt, a fee band if it is a change, then one full-width primary. Secondary actions visible, not quiet.
- **Why.** A yes that costs money should feel considered. Secondary actions should be findable with a thumb.
- **Verify.** Comment is visible without reading the page twice. Approve does not fire on the first tap.

Unverified: exact thumb reach on a real phone. The sticky action note in section 9 is a recommendation, not an observed failure.

---

## 7. Component-level design improvements

**Navigation.** Keep the 5-column grid below `sm` and the row from `sm`. Active is ink on canvas. Do not add icons. Labels stay one line; if a translation wraps, that is a later problem.

**Buttons.**
- Primary: 48px, radius 8px in the studio, full radius on the client. Oxide fill, white text.
- Secondary: 48px, 1px hairline, canvas fill, ink text. Use for Comment, Request a change, Copy link.
- Quiet: text, underline on hover. Use for “Back to the project” and “Open what they see” only.

**Inputs.** 56px, radius 8px, hairline border, ink on focus. Placeholder in muted-soft. Keep.

**Status.** Dot 6px plus the word. Oxide waiting/due/current, ink approved/paid, muted noted/draft/superseded, error change requested. Never the dot alone.

**Filters.** Wrap. Active is ink fill. Inactive is hairline. Height 48px. No overflow-x.

**Forms.** Paste form and change composer collapse until opened. Open state is the same fields as now. Error sentence under the field, `role="alert"`.

**Images.** Cover 16:9, radius 20px. Sheet reference 3:2, radius 14px, with the caption. Row thumb 96px, radius 8px. `alt` is the drawing title, not empty, on timeline thumbs.

**Approval controls.** See section 6. Confirm sheet is a panel, not a new page: surface background, 20px padding, name field, two buttons.

**Empty.** Keep “Nothing open. The record is quiet.” and “No changes outside scope on this project.” Do not add illustrations.

**Loading.** One line, “Loading the record.” No skeleton grid. Data is sync today; this is for later.

**Error.** One sentence, error colour, under the control. No toast.

**Feedback.** “Link copied” replaces the button label. “Added to the record” is not enough; the new row must be in view.

---

## 8. Motion design system

No animation library is used by Ledger. Do not add one. CSS only.

| Token | Duration | Easing |
|---|---|---|
| instant | 120ms | cubic-bezier(0.2, 0, 0, 1) |
| state | 200ms | cubic-bezier(0.22, 1, 0.36, 1) |

| What | Trigger | From | To | Duration | Properties | Purpose | Reduced motion |
|---|---|---|---|---|---|---|---|
| Theme | Toggle | current | other | 200ms | background, color, border | Continuity | Instant |
| Primary | Hover, press | rest | darker, scale 0.98 | 120ms | background, transform | Press | Colour only |
| Confirm sheet | Approve | absent, y 8px | in, y 0 | 200ms | opacity, transform | Show the yes | Instant |
| Composer | Open | closed | open | 200ms | opacity | Reveal | Instant |
| Filter | Press | off | on | 120ms | background, color | State | Instant |
| Copy link | Success | label | “Link copied” | 0 | text | Confirm | Same |
| New row | After paste | — | in view | 200ms | opacity | Place it | Instant |

No spring. No overshoot. No stagger. No route transition. Theme already transitions in `styles.css`; keep that curve.

---

## 9. Scroll and page behaviour

**Keep.** Document scroll on every route. Sticky studio header (`sticky top-0` in `shell.tsx`). It is one line of mark plus one line of nav. It earns its place.

**Add.** On the approval page, once the prompt is long, the action group (fee band if present, Approve, Comment, Request a change) sticks to the bottom of the viewport until the footer. 12px gap above the safe area. Unverified whether current prompts are long enough to need this; specify it so a long note does not hide the yes.

**Do not add.**
- Scroll-triggered reveals. Content should be there.
- Parallax. It fights reading.
- Scroll snap. These are registers, not stories.
- A progress bar. There is no long essay.
- Collapsing nav. The header is already short.
- Horizontal scroll. Remove it from phase thumbs and decision filters.

**Lists.** Normal overflow. No animated reordering.

---

## 10. Responsive design

Breakpoints in use: default, `sm` 640, `md` 768. Do not add new ones.

| Viewport | Behaviour |
|---|---|
| 390px | Client is the product. Studio nav is the 5-column grid. Forms stack. Amounts wrap under titles. No sideways scroll. Gutters 20px. |
| 768px | Studio nav becomes a row. Waiting rows go image-left. Filters sit on one line if they fit, wrap if not. |
| 1280px | Studio content caps at 64rem, centered. Client stays 32rem even on a desktop, so a client link opened on a laptop still feels like a letter. |
| Wide | Same cap. Do not stretch the register. |

**Nav.** Five labels, one line, 44px tall. Verified in source as `min-h-11` and a 5-column grid. An earlier screenshot (`screenshots/nav-mobile.png`) still shows the old pill scroll; the source has since changed. Trust the source.

**Images.** Cover uses `aspect-[16/9]`. Approval uses `aspect-[3/2]`. Both are set in class, so the box exists before the image. Good.

**Overlays.** Confirm sheet is full width of the client column, not a centered modal on mobile. On a laptop it stays inside the 32rem column.

**Verify.** 390, 768, 1280, light and dark, on `/`, `/decisions`, `/approve/req-m-stair`.

---

## 11. Accessibility as part of design

Not tested with a screen reader or a keyboard-only pass. From source:

- Focus ring is 2px ink, offset 2, on buttons, links, inputs. Keep it. Do not replace it with a glow.
- Theme toggle has an sr-only name that changes with the theme. Keep.
- Status dot is `aria-hidden`; the word is the name. Keep.
- Touch targets on actions are 44–48px. Keep. Quiet underlines on the approval page are the exception to fix.
- Errors need `role="alert"` so they are announced.
- Timeline thumbs use `alt=""`. Use the drawing title.
- Reduced motion is already global in `styles.css`. New motion must respect it.
- Zoom to 200% was not tested. The rule: no horizontal scroll at 200% on the client column.
- Do not communicate waiting, due, or error by colour alone. The word is already there. Keep the word.

**Verify.** Tab from the wordmark to the footer on `/` and on an approval page. Turn on reduced motion and toggle theme. Measure muted and oxide with a contrast tool.

---

## 12. Performance-conscious design

- Fonts load from Google in `__root.tsx`. That is a layout-shift and a privacy cost. Self-host Fraunces 500/600 and Source Sans 3 400/500, `font-display: swap`. Perceived quality, not infrastructure.
- `Photo` sets aspect ratio but not width/height attributes. The class is enough to hold the box. Keep the aspect. Do not add blur-up placeholders; they are decoration here.
- One shadow, no blur, no filter. Do not add any.
- Theme transition on `body *` is the only broad animation. Do not extend it.
- No scroll listeners. Do not add them for reveals.

**Verify.** Cold load of `/`. Cover should not jump. Fonts should not swap so late that the title reflows twice.

---

## 13. Anti-AI-slop audit

| Pattern | In Ledger? | Action |
|---|---|---|
| Purple gradient, glass, blobs | No | Do not add |
| Metric cards, fake charts | No | Do not add |
| Icon on every row | No | Do not add |
| Huge unbounded headings | No | Cap stays |
| Emoji as icons | No | Do not add |
| Pill on every control | Yes | Refine. Full radius only on client primary, theme, filters |
| Uppercase tracked eyebrow | Yes, Changes | Remove |
| Horizontal scroll as navigation | Fixed in nav, remains on thumbs and filters | Remove |
| Borrowed brand colour | Yes, Rausch | Replace |
| Nested cards | No | Do not add |
| Decorative motion | No | Do not add |
| Generic empty-state illustration | No | Do not add |

The product is already on the right side of this line. The work is to remove the three leftovers, not to add craft.

---

## 14. Design-system specification

Existing values are from `src/styles.css` unless marked proposed.

**Colour**

| Token | Existing | Proposed |
|---|---|---|
| canvas | `#f6f3ee` / `#12110f` | keep |
| ink | `#1c1916` / `#f3eee6` | keep |
| body | `#3f3a34` / `#d4cdc3` | keep |
| muted | `#6f675e` / `#a89f94` | keep |
| hairline | `#e3dbd1` / `#2e2924` | keep |
| surface | `#efeae3` / `#1c1916` | keep |
| primary | `#FF385C` / `#ff4d6d` | `#9C3B2E` / `#E07A68` |
| primary-active | `#E00B41` | `#7C2E24` |
| error | `#C13515` / `#ff8f78` | keep |
| focus | 2px ink | keep |

**Type.** As section 3.

**Space.** Gutter 20/32. Content 64rem / 32rem. Section 40–56. Stack 8/12/16.

**Radius.** 8 field and studio button. 14 photo and row. 20 cover. Full on client primary, theme, filters.

**Shadow.** Existing lift, hover only.

**Motion.** instant 120ms, state 200ms. Curve `cubic-bezier(0.22, 1, 0.36, 1)` for state, `cubic-bezier(0.2, 0, 0, 1)` for instant.

**States.** Hover darkens primary. Press scales to 0.98. Disabled is primary-soft, not clickable. Focus is the ink ring.

---

## 15. Visual implementation checklist

| Priority | Where | Change | Benefit | Done when |
|---|---|---|---|---|
| P0 | `/` | Grammatical lede | First sentence is trustworthy | “are underway” or no verb |
| P0 | `/approve` | Secondary actions are buttons | Comment is findable | Two 48px buttons under Approve |
| P0 | `/approve` | Confirm sheet with name | A yes feels considered | First tap does not approve |
| P1 | Timeline, Decisions | No sideways scroll | Same fix as the nav | 390px, no overflow-x |
| P1 | `/client` | Open items not repeated | One job, one list | Pending appears once |
| P1 | `/changes` | Remove uppercase eyebrow | One voice | No tracking-widest |
| P1 | `/drawings` | Latest large, older as rows | Version that counts is obvious | One hero per sheet |
| P2 | Tokens | Oxide primary | Colour belongs to the paper | No `#FF385C` in UI |
| P2 | Photos | “Reference photo, not the sheet” | Honest | Caption on drawings |
| P2 | Billing | Paid is quieter than Due | Status at a glance | Muted amount on paid |
| P2 | Decisions | List first, form collapsed | Return visit is reading | List is first paint |
| P2 | Fonts | Self-host | No late reflow | No Google CSS |
| P3 | Approval | Sticky actions if prompt is long | Thumb reach | Actions visible on a long note |
| P3 | Motion | Press and confirm as specified | Felt, not decorated | Reduced motion is instant |

---

## 16. Visual QA checklist

- [ ] `/`, `/drawings`, `/decisions`, `/changes`, `/billing`, `/client/mehta`, `/approve/req-m-stair` in light and dark.
- [ ] 390, 768, 1280. No horizontal scroll on any of them.
- [ ] Home lede is grammatical.
- [ ] Approve does not fire on first tap. Confirm sheet traps focus. Esc closes it.
- [ ] Comment and Request a change are visible without scrolling past the fold on a short prompt.
- [ ] Pending item appears once on the client home.
- [ ] No uppercase tracked label anywhere.
- [ ] No `#FF385C` in a screenshot.
- [ ] Tab order reaches every control. Focus ring is visible on canvas and on surface.
- [ ] Reduced motion: theme toggle and confirm appear without travel.
- [ ] Cover and approval image do not shift when they load.
- [ ] Amounts on billing share a column.
- [ ] A superseded drawing is not a hero.

---

Done looks like the same product, quieter and more certain. Paper, serif, one accent, one action, no sideways scroll, no borrowed colour, no template eyebrow.
