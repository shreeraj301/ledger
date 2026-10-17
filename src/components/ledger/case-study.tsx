import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme";
import { cx } from "./primitives";

const JOURNEY = [
  {
    where: "WhatsApp",
    title: "A change arrives in chat",
    body: "Meera asks for a puja room in place of the study. It sits in a group with the contractor.",
    lost: "No fee. No drawing. No yes that anyone can point to.",
  },
  {
    where: "The thread",
    title: "The architect replies, still in chat",
    body: "Ananya says she will look at it. The reply has no time and no cost.",
    lost: "The client reads this as a yes. The studio reads it as a maybe.",
  },
  {
    where: "Email",
    title: "The consultant hears it late",
    body: "Structural is copied a week later, or not at all. They keep working from the old plan.",
    lost: "Two versions of the house are in play.",
  },
  {
    where: "Drive",
    title: "A new PDF, a new name",
    body: "A-101_final_v3 lands in a folder that already has three finals.",
    lost: "Nobody can say which sheet the client signed.",
  },
  {
    where: "Site",
    title: "Work starts on the unagreed thing",
    body: "The contractor pours against the old stair. The revised sheet is still unsigned.",
    lost: "Rework, and a release held.",
  },
  {
    where: "The invoice",
    title: "The fee arrives after the fact",
    body: "₹1,85,000 and three weeks. The client says they never agreed to the extra.",
    lost: "40 minutes reconstructing a chat, then an argument.",
  },
];

const PEOPLE = [
  {
    who: "Architect",
    name: "Ananya, project lead",
    hit: "Chasing a yes, defending scope, reconstructing chat before an invoice.",
    number: "40 min",
    unit: "to rebuild what was agreed",
    quote: "The spreadsheet is a reconstruction. The real record is the group.",
  },
  {
    who: "Homeowner",
    name: "Meera, client",
    hit: "Unsure what she has signed, and what it costs, until the invoice.",
    number: "5 of 6",
    unit: "studios had a later denial",
    quote: "I thought we had agreed. It was just a message.",
  },
  {
    who: "Consultant",
    name: "Structural, HVAC",
    hit: "Working from a drawing that is already out of date.",
    number: "2 weeks",
    unit: "a room swap sat unread",
    quote: "Which elevation did they sign? There are three finals.",
  },
];

const OPTIONS = [
  {
    name: "A practice suite",
    verdict: "Scrapped",
    why: "None of the six used one for approvals. Two had tried. Clients would not log in, and the studio did not want another system next to WhatsApp.",
  },
  {
    name: "A passive log",
    verdict: "Scrapped",
    why: "A log without a yes becomes another stale sheet. Architects wanted a decision someone could stand on.",
  },
  {
    name: "A chat in the product",
    verdict: "Scrapped",
    why: "5 of 6 already keep the real conversation in WhatsApp. Replacing it would fail. Paste the message in, attributed.",
  },
  {
    name: "A client account",
    verdict: "Scrapped",
    why: "4 of 4 homeowners would abandon a link that asked them to sign up. A link is weaker proof, and good enough to settle “did we agree.”",
  },
  {
    name: "One shared record",
    verdict: "Shipped",
    why: "Phases, drawings, changes, and the reason an invoice exists. If it is in Ledger, both sides can see it. No internal layer in this version.",
  },
];

const SHIPPED = [
  { name: "Phase record", note: "Concept to handover. A sentence for whose turn it is." },
  { name: "Drawing versions", note: "Latest approved, older ones kept as rows." },
  { name: "Fee before yes", note: "Out-of-scope changes show cost and time above the button." },
  { name: "Invoice linkage", note: "Each amount points at the approvals behind it." },
  { name: "WhatsApp paste", note: "A message enters the log, attributed. Not a chat." },
  { name: "Link, no account", note: "The client opens a shared link on a phone." },
];

const SCRAPPED = [
  { name: "Studio login", note: "A prototype. It opens on the sample studio." },
  { name: "Client accounts", note: "4 of 4 would not sign up for one project." },
  { name: "CAD and PDF upload", note: "Image placeholders. The agreement is the product." },
  { name: "Payments", note: "The fee is shown. Money is not taken." },
  { name: "Notifications", note: "Open items stay visible. No nudge yet." },
  { name: "Internal notes", note: "If it is in Ledger, the client can see it." },
];

const TASKS = [
  { task: "Find what is open", who: "Architect", success: 6, of: 6, time: "18s" },
  { task: "Approve from a link", who: "Client", success: 4, of: 4, time: "42s" },
  { task: "Read the fee before yes", who: "Client", success: 4, of: 4, time: "55s" },
  { task: "Paste a WhatsApp message", who: "Architect", success: 6, of: 6, time: "35s" },
  { task: "Tie an invoice to an approval", who: "Architect", success: 5, of: 6, time: "28s" },
];

const CHANGES = [
  {
    broke: "Clients treated the page like a gallery",
    fix: "One primary action, a large photo, fee above the button",
  },
  {
    broke: "Could not tell latest from older",
    fix: "Latest approved, older versions as rows",
  },
  {
    broke: "Invoices felt detached from the work",
    fix: "Why this amount, plus the approvals behind it",
  },
  {
    broke: "Phone menu scrolled sideways",
    fix: "A five-part bar that fits the screen",
  },
  {
    broke: "Coral on every approved item",
    fix: "Accent only for waiting, current phase, and due",
  },
];

function Bar({ value, max = 100, oxide = false }: { value: number; max?: number; oxide?: boolean }) {
  return (
    <span className="block h-1.5 overflow-hidden rounded-full bg-hairline">
      <span
        className={cx("block h-full rounded-full", oxide ? "bg-primary" : "bg-ink")}
        style={{ width: `${Math.round((value / max) * 100)}%` }}
      />
    </span>
  );
}

export function CaseStudyPage() {
  const [step, setStep] = useState(0);
  const [person, setPerson] = useState(0);
  const [option, setOption] = useState(4);
  const [side, setSide] = useState<"shipped" | "scrapped">("shipped");
  const [change, setChange] = useState(0);
  const beat = JOURNEY[step];
  const who = PEOPLE[person];
  const choice = OPTIONS[option];
  const list = side === "shipped" ? SHIPPED : SCRAPPED;
  const changed = CHANGES[change];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-hairline bg-canvas">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-hairline font-display text-lg leading-none">
              L
            </span>
            <span className="font-display text-xl leading-none tracking-tight">Ledger</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-sm bg-primary px-4 text-sm font-medium text-white"
            >
              Open the prototype
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-sm text-muted">Case study · October 2026 · sample figures</p>
        <h1 className="mt-4 max-w-3xl font-display text-display font-medium tracking-tight">
          A shared record of what was agreed
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">
          Decisions lived in WhatsApp. Invoices arrived after the work. This is the prototype of the missing record, and the choices behind it.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-4">
          {[
            ["40 min", "to rebuild a chat before an invoice"],
            ["5 of 6", "had a client deny a chat-only yes"],
            ["4 of 4", "clients would not make an account"],
            ["18s", "to see what is still open"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-md bg-surface px-5 py-5">
              <p className="font-display text-3xl font-medium tracking-tight">{value}</p>
              <p className="mt-2 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <p className="text-sm text-muted">01 · The break</p>
          <h2 className="mt-2 font-display text-title font-medium tracking-tight">Where the agreement gets lost</h2>
          <p className="mt-3 max-w-2xl text-base text-body">
            The same path, from six studios. Click a step. The record never starts.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {JOURNEY.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setStep(index)}
                  className={cx(
                    "flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 text-left text-sm",
                    index === step ? "bg-ink text-canvas" : "bg-surface text-ink hover:bg-surface-strong",
                  )}
                >
                  <span className="font-display text-lg">{index + 1}</span>
                  {item.where}
                </button>
              ))}
            </div>
            <div className="rounded-lg bg-surface p-6 md:p-8">
              <p className="text-sm text-muted">{beat.where}</p>
              <h3 className="mt-2 font-display text-2xl font-medium tracking-tight">{beat.title}</h3>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-body">{beat.body}</p>
              <p className="mt-6 border-t border-hairline pt-4 text-sm text-primary">{beat.lost}</p>
              <div className="mt-6">
                <Bar value={step + 1} max={JOURNEY.length} oxide />
                <p className="mt-2 text-sm text-muted">
                  Step {step + 1} of {JOURNEY.length}. Still no shared yes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <p className="text-sm text-muted">02 · Who it hits</p>
          <h2 className="mt-2 font-display text-title font-medium tracking-tight">Three people, one missing record</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {PEOPLE.map((item, index) => (
              <button
                key={item.who}
                type="button"
                onClick={() => setPerson(index)}
                className={cx(
                  "h-11 rounded-full px-4 text-sm font-medium",
                  index === person ? "bg-ink text-canvas" : "bg-surface text-ink",
                )}
              >
                {item.who}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-lg border border-hairline p-6 md:p-8">
              <p className="text-sm text-muted">{who.name}</p>
              <p className="mt-3 font-display text-2xl font-medium leading-snug tracking-tight">{who.hit}</p>
              <p className="mt-6 text-base text-body">“{who.quote}”</p>
            </div>
            <div className="flex flex-col justify-between rounded-lg bg-surface p-6">
              <p className="font-display text-4xl font-medium tracking-tight">{who.number}</p>
              <p className="mt-2 text-sm text-muted">{who.unit}</p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <p className="text-sm text-muted">03 · Research</p>
          <h2 className="mt-2 font-display text-title font-medium tracking-tight">What the two rounds said</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["6", "architects, round 1 and 2"],
              ["4", "homeowners, round 2"],
              ["3 cities", "Pune, Bengaluru, Mumbai"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-hairline px-5 py-4">
                <p className="font-display text-2xl font-medium">{value}</p>
                <p className="mt-1 text-sm text-muted">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-hairline">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">What we heard</th>
                  <th className="px-5 py-3 font-medium">How often</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">What it meant</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["The real decision is in WhatsApp", "5 of 6", "Paste it in. Do not build a chat."],
                  ["Will not make an account", "4 of 4", "A shared link is the client product."],
                  ["Missed a fee under the photo", "3 of 4", "Fee above the approve button."],
                  ["Asked where we are, first", "5 of 6, 3 of 4", "A phase line and a plain sentence."],
                ].map(([heard, often, meant]) => (
                  <tr key={heard} className="border-t border-hairline">
                    <td className="px-5 py-4 text-ink">{heard}</td>
                    <td className="px-5 py-4 text-ink">{often}</td>
                    <td className="hidden px-5 py-4 text-body sm:table-cell">{meant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <p className="text-sm text-muted">04 · Choices</p>
          <h2 className="mt-2 font-display text-title font-medium tracking-tight">Five ways to solve it. One shipped.</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {OPTIONS.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setOption(index)}
                className={cx(
                  "h-11 rounded-full px-4 text-sm font-medium",
                  index === option
                    ? item.verdict === "Shipped"
                      ? "bg-primary text-white"
                      : "bg-ink text-canvas"
                    : "bg-surface text-ink",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-surface p-6 md:p-8">
            <p className={cx("text-sm", choice.verdict === "Shipped" ? "text-primary" : "text-muted")}>
              {choice.verdict}
            </p>
            <h3 className="mt-2 font-display text-2xl font-medium tracking-tight">{choice.name}</h3>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-body">{choice.why}</p>
          </div>
        </section>

        <section className="mt-16">
          <p className="text-sm text-muted">05 · The cut</p>
          <h2 className="mt-2 font-display text-title font-medium tracking-tight">What shipped, and what was left out</h2>
          <div className="mt-6 inline-flex rounded-full bg-surface p-1">
            {(["shipped", "scrapped"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSide(key)}
                className={cx(
                  "h-11 rounded-full px-5 text-sm font-medium capitalize",
                  side === key ? "bg-ink text-canvas" : "text-muted",
                )}
              >
                {key}
              </button>
            ))}
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {list.map((item) => (
              <li key={item.name} className="rounded-md border border-hairline px-5 py-4">
                <p className="text-base font-medium text-ink">{item.name}</p>
                <p className="mt-1 text-sm text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <p className="text-sm text-muted">06 · The test</p>
          <h2 className="mt-2 font-display text-title font-medium tracking-tight">Round 2, on the working prototype</h2>
          <div className="mt-6 space-y-4">
            {TASKS.map((item) => (
              <div key={item.task} className="grid items-center gap-2 sm:grid-cols-[1.4fr_80px_1fr_48px]">
                <p className="text-sm text-ink">
                  {item.task}
                  <span className="text-muted"> · {item.who}</span>
                </p>
                <p className="text-sm text-muted">
                  {item.success}/{item.of}
                </p>
                <Bar value={item.success} max={item.of} oxide={item.success < item.of} />
                <p className="text-sm text-muted">{item.time}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["4.3", "architect confidence the record holds in a fee dispute"],
              ["4.5", "client confidence they knew what they were signing"],
              ["4.8", "client confidence they did not need an account"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md bg-surface px-5 py-4">
                <p className="font-display text-3xl font-medium">{value}</p>
                <p className="mt-2 text-sm text-muted">{label}</p>
                <div className="mt-3">
                  <Bar value={Number(value)} max={5} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="text-sm text-muted">07 · What changed</p>
          <h2 className="mt-2 font-display text-title font-medium tracking-tight">Five breaks, five fixes</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {CHANGES.map((item, index) => (
              <button
                key={item.broke}
                type="button"
                onClick={() => setChange(index)}
                className={cx(
                  "h-11 rounded-full px-4 text-sm",
                  index === change ? "bg-ink text-canvas" : "bg-surface text-ink",
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-surface p-6">
              <p className="text-sm text-muted">Broke</p>
              <p className="mt-2 font-display text-xl font-medium tracking-tight">{changed.broke}</p>
            </div>
            <div className="rounded-lg border border-primary p-6">
              <p className="text-sm text-primary">Shipped</p>
              <p className="mt-2 font-display text-xl font-medium tracking-tight">{changed.fix}</p>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-lg bg-surface px-6 py-8 md:px-8">
          <p className="text-sm text-muted">Where it stands</p>
          <h2 className="mt-2 font-display text-title font-medium tracking-tight">
            A prototype. Not a pilot.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-body">
            Validated in the room: a client can approve from a link, an architect can see what is open, a change shows its fee before yes. Not validated: whether a studio keeps the record current over a real project. Sample names. Sample numbers.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-12 items-center rounded-sm bg-primary px-5 text-sm font-medium text-white"
          >
            Open the prototype
          </Link>
        </section>
      </main>
    </div>
  );
}
