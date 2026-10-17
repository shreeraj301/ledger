import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme";

function Section({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-hairline pt-10">
      <p className="text-sm text-muted">{kicker}</p>
      <h2 className="mt-2 font-display text-title font-medium tracking-tight">{title}</h2>
      <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-body">{children}</div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md bg-surface px-5 py-4">
      <p className="font-display text-3xl font-medium tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

export function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 md:px-0">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-hairline font-display text-lg leading-none">
              L
            </span>
            <span className="font-display text-xl leading-none tracking-tight">Ledger</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted hover:text-ink">
              Open the prototype
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-12 md:px-0 md:py-16">
        <p className="text-sm text-muted">Case study · October 2026</p>
        <h1 className="mt-4 font-display text-display font-medium tracking-tight">
          A shared record of what was agreed
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">
          Architects and their homeowner clients were agreeing things in WhatsApp, then arguing about them later. Ledger is a working prototype of the missing record: phases, drawings, changes, and the reason an invoice exists.
        </p>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-md bg-hairline sm:grid-cols-3">
          {[
            ["Role", "Sole designer and builder"],
            ["Time", "Two weeks, October 2026"],
            ["Type", "Concept prototype, sample data"],
          ].map(([term, detail]) => (
            <div key={term} className="bg-canvas px-5 py-4">
              <dt className="text-sm text-muted">{term}</dt>
              <dd className="mt-1 text-base text-ink">{detail}</dd>
            </div>
          ))}
        </dl>

        <Section kicker="01" title="The problem">
          <p>
            During an internship at Anagram Architects, client changes, consultant notes, and working-drawing releases lived in WhatsApp, email, and a Drive folder with three files named final. There was no place both sides could point to and say: this is what we agreed, this is still open, this is a scope change.
          </p>
          <p>
            A room swap sat in a contractor group for two weeks. The revised sheet went out, and the fee was argued after the work had started. A working-drawing release was held because nobody could say which elevation the client had signed.
          </p>
        </Section>

        <Section kicker="02" title="Who it hits">
          <p>
            The project architect, chasing a yes and defending scope. The homeowner, unsure what they have agreed to and what it costs. Consultants, working from a drawing that is already out of date.
          </p>
          <p>
            In the interviews, architects put about 40 minutes on reconstructing “what was agreed” before a change invoice. 5 of 6 said a client had later denied something that only lived in chat.
          </p>
        </Section>

        <Section kicker="03" title="Research">
          <p>
            First-hand observation at Anagram, then two rounds in October 2026. Round 1: 6 architects in solo and small firms, Pune, Bengaluru, Mumbai. A 45-minute interview and a 20-minute walkthrough. Round 2: the same 6, plus 4 homeowners who had built or renovated in the last three years. Architects on a laptop, clients on a phone.
          </p>
          <p>The journey they described was the same:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Client messages a change on WhatsApp.</li>
            <li>Architect replies in the thread, often with no fee.</li>
            <li>The consultant is copied later, or not at all.</li>
            <li>A revised PDF lands in Drive with a new name.</li>
            <li>Nobody can point to the message that counts as a yes.</li>
            <li>The invoice arrives. The client says they did not agree.</li>
          </ol>
          <p>Three things held across both rounds.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>WhatsApp is the real record. The spreadsheet is a reconstruction.</li>
            <li>Clients will not make an account for one project. 4 of 4 said they would abandon a link that asked them to sign up.</li>
            <li>Scope and fee have to be visible before the yes, not after the invoice. 3 of 4 clients would have agreed without reading a fee that sat under the photo.</li>
          </ul>
        </Section>

        <Section kicker="04" title="Options considered">
          <p>
            A full practice suite. Dropped. None of the six architects used one for client approvals. Two had tried and stopped, because clients would not log in, and the studio did not want another system next to WhatsApp.
          </p>
          <p>
            A passive activity log, with no gate. Dropped. Architects said a log without a yes would become another stale sheet. The point was a decision someone could stand on.
          </p>
          <p>
            A chat inside the product. Dropped. 5 of 6 already keep the real conversation in WhatsApp. Replacing it would fail. Pasting a message into the record, attributed, sits next to the tool they already use.
          </p>
          <p>
            A client account, for stronger proof of who signed. Dropped for this version. A link is weaker than a login, and good enough to settle “did we agree.” It is a record, not a contract.
          </p>
        </Section>

        <Section kicker="05" title="What shipped, and why">
          <p>
            One shared record, organised by phase. Concept, design development, working drawings, site, handover. The header says whose turn it is, in a sentence: “2 things are with Meera.” Both sides asked “where are we,” not for a dashboard of counts.
          </p>
          <p>
            Drawings keep earlier versions. The one that counts is marked latest approved. Changes that sit outside the agreed scope show the fee and the time before anyone says yes. Invoices point back to the approvals that support them.
          </p>
          <p>
            The client opens a link. No account. One primary action, a large photo, and the fee above the button on an out-of-scope change. That came from round 2: clients were treating the page like a gallery.
          </p>
        </Section>

        <Section kicker="06" title="What was left out">
          <p>
            Real accounts, file upload of CAD and PDF, payments, notifications, a consultant role, and an internal note the client never sees. Each was a real need. Each would have made the prototype a different product.
          </p>
          <p>
            The internal note was the hardest cut. Architects want a place for consultant fees and flags. Leaving it out keeps the record honest: if it is in Ledger, the client can see it. An internal layer is a later question, not a default.
          </p>
          <p>
            No reminders yet. An open item can stall if the client does not open the link. The timeline keeps it visible as “waiting on,” which is the honest state, not a nudge.
          </p>
        </Section>

        <Section kicker="07" title="What testing changed">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat value="6/6" label="Architects found what was open, median 18s" />
            <Stat value="4/4" label="Clients approved from a link, no account, median 42s" />
            <Stat value="4.5" label="Client confidence they knew what they were signing" />
          </div>
          <p>
            Clients could not tell the latest drawing from an older one. Versions are now labelled latest approved, and older ones stay as rows. Invoices felt detached from the work. Each amount now has a reason and the approvals behind it. 5 of 6 architects then found the link. One still looked for a separate invoice page.
          </p>
          <p>
            The first phone menu was a sideways scroll of pills. 3 of 4 clients and 2 of 6 architects lost the active item. It is now a five-part bar that fits the screen. Early coral on every approved item read as “something is wrong.” Accent is now only for what needs a person: waiting, the current phase, and due.
          </p>
        </Section>

        <Section kicker="08" title="Where it stands">
          <p>
            A live prototype on sample data. Northlight, two projects: the Mehta residence in Pune, the Iyer apartment in Bengaluru. Names are fictional.
          </p>
          <p>
            Validated in the test round: a client can approve from a link (4/4), an architect can see what is open (6/6), a change shows its fee before yes (4/4), and a WhatsApp message can enter the record without becoming a chat (6/6). Architect confidence that the record would hold up in a fee dispute: 4.3 of 5.
          </p>
          <p>
            Not validated: whether a studio would keep the record current over a real project. No pilot yet, including at Anagram. That is the next question, not a claim this prototype can make.
          </p>
          <p>
            <Link to="/" className="font-medium text-ink underline-offset-4 hover:underline">
              Open the prototype
            </Link>
          </p>
        </Section>
      </article>
    </div>
  );
}
