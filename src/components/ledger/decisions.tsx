import { useMemo, useRef, useState } from "react";
import { formatWhen, sourceLabel } from "@/lib/ledger/format";
import { useLedger } from "@/lib/ledger/store";
import { useProjectData } from "@/lib/ledger/use-project";
import type { DecisionStatus } from "@/lib/ledger/types";
import { Field, Photo, PrimaryButton, QuietButton, SecondaryButton, StatusMark, areaClass, cx, fieldClass } from "./primitives";
import { StudioShell } from "./shell";

const FILTERS: Array<{ id: "all" | DecisionStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Waiting" },
  { id: "change_requested", label: "Changes" },
  { id: "noted", label: "Noted" },
];

export function DecisionsPage() {
  const { project, phases, decisions } = useProjectData();
  const addWhatsApp = useLedger((s) => s.addWhatsApp);

  const [query, setQuery] = useState("");
  const [phaseId, setPhaseId] = useState("all");
  const [status, setStatus] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [message, setMessage] = useState("");
  const [actor, setActor] = useState("");
  const [notePhase, setNotePhase] = useState(phases.find((p) => p.status === "current")?.id ?? phases[0]?.id ?? "");
  const [openPaste, setOpenPaste] = useState(false);
  const [error, setError] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const actorRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const people = project
    ? [
        { name: project.architect, role: "architect" as const },
        { name: project.clientName, role: "client" as const },
        ...project.household
          .split(/\s*(?:&|and|,)\s*/i)
          .map((name) => name.trim())
          .filter((name) => {
            if (!name || name === project.clientName || name === project.architect) return false;
            const lower = name.toLowerCase();
            const client = project.clientName.toLowerCase();
            return !client.startsWith(lower) && !lower.startsWith(client);
          })
          .map((name) => ({ name, role: "client" as const })),
      ].filter((person, index, list) => person.name && list.findIndex((item) => item.name === person.name) === index)
    : [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...decisions]
      .filter((d) => (phaseId === "all" ? true : d.phaseId === phaseId))
      .filter((d) => (status === "all" ? true : d.status === status))
      .filter((d) => {
        if (!q) return true;
        return `${d.title} ${d.body} ${d.actor}`.toLowerCase().includes(q);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [decisions, phaseId, query, status]);

  if (!project) return null;

  return (
    <StudioShell
      title="Decisions"
      lede="What was said, who said it, and whether it changed the work. WhatsApp counts, once it is written down."
    >
      <div>
        <SecondaryButton
          expanded={openPaste}
          disabled={openPaste}
          onClick={() => {
            setOpenPaste(true);
            setDiscarding(false);
          }}
        >
          Add from WhatsApp
        </SecondaryButton>
        {openPaste ? (
          <form
            className="mt-4 rounded-lg border border-hairline bg-surface p-4 md:p-6"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const speaker = people.find((person) => person.name === actor);
              if (!message.trim()) {
                setError("Paste the message first.");
                messageRef.current?.focus();
                return;
              }
              if (!speaker) {
                setError("Choose who said it.");
                actorRef.current?.focus();
                return;
              }
              addWhatsApp({
                projectId: project.id,
                phaseId: notePhase,
                message,
                actor: speaker.name,
                actorRole: speaker.role,
              });
              setMessage("");
              setActor("");
              setError("");
              setDiscarding(false);
              setOpenPaste(false);
              requestAnimationFrame(() => {
                document.getElementById("decision-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-medium">Paste a WhatsApp message</h2>
                <p className="mt-1 text-sm text-body">It lands in the record with their name, not as a formal approval.</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Message" id="wa-message" error={error === "Paste the message first." ? error : undefined}>
                <textarea
                  id="wa-message"
                  ref={messageRef}
                  className={areaClass}
                  value={message}
                  placeholder="Can we keep the old mango tree?"
                  aria-invalid={error === "Paste the message first."}
                  aria-describedby={error === "Paste the message first." ? "wa-message-error" : undefined}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (e.target.value.trim() && error === "Paste the message first.") setError("");
                  }}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Who said it"
                  id="wa-actor"
                  error={error === "Choose who said it." ? error : undefined}
                  hint={people.length === 0 ? "Add a client or architect on the project before saving a message." : undefined}
                >
                  <select
                    id="wa-actor"
                    ref={actorRef}
                    className={fieldClass}
                    value={actor}
                    aria-invalid={error === "Choose who said it."}
                    aria-describedby={error === "Choose who said it." ? "wa-actor-error" : undefined}
                    onChange={(e) => {
                      setActor(e.target.value);
                      if (e.target.value && error === "Choose who said it.") setError("");
                    }}
                  >
                    <option value="">Choose who said it</option>
                    {people.map((person) => (
                      <option key={person.name} value={person.name}>
                        {person.name} ({person.role === "client" ? "Client" : "Architect"})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Phase" id="wa-phase">
                  <select
                    id="wa-phase"
                    className={fieldClass}
                    value={notePhase}
                    onChange={(e) => setNotePhase(e.target.value)}
                  >
                    {phases.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PrimaryButton type="submit" disabled={people.length === 0}>
                  Add to the record
                </PrimaryButton>
                <QuietButton
                  onClick={() => {
                    if (message.trim() || actor) setDiscarding(true);
                    else {
                      setOpenPaste(false);
                      setError("");
                    }
                  }}
                >
                  Cancel
                </QuietButton>
              </div>
              {discarding ? (
                <div className="rounded-md border border-hairline bg-canvas p-4" role="alert">
                  <p className="text-sm text-ink">Cancel and discard this message?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <QuietButton
                      onClick={() => {
                        setMessage("");
                        setActor("");
                        setError("");
                        setDiscarding(false);
                        setOpenPaste(false);
                      }}
                    >
                      Discard
                    </QuietButton>
                    <SecondaryButton onClick={() => setDiscarding(false)}>Keep writing</SecondaryButton>
                  </div>
                </div>
              ) : null}
            </div>
          </form>
        ) : null}
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the record"
          aria-label="Search the record"
          className="h-12 w-full rounded-sm border border-hairline bg-canvas px-4 text-base text-ink placeholder:text-muted-soft"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            aria-label="Filter by phase"
            value={phaseId}
            onChange={(e) => setPhaseId(e.target.value)}
            className="h-12 rounded-sm border border-hairline bg-canvas px-4 text-sm text-ink"
          >
            <option value="all">All phases</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.name}
              </option>
            ))}
          </select>
          <div className="hidden flex-wrap gap-2 sm:flex">
            {FILTERS.map((item) => {
              const on = status === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setStatus(item.id)}
                  className={cx(
                    "h-12 rounded-full px-4 text-sm font-medium",
                    on ? "bg-ink text-canvas" : "border border-hairline bg-canvas text-ink hover:bg-surface",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof FILTERS)[number]["id"])}
            className="h-12 rounded-sm border border-hairline bg-canvas px-4 text-sm text-ink sm:hidden"
          >
            {FILTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul id="decision-list" className="mt-6 divide-y divide-hairline border-t border-hairline">
        {visible.length === 0 ? (
          <li className="py-8 text-base text-body">Nothing in the record matches that.</li>
        ) : (
          visible.map((decision) => {
            const phase = phases.find((p) => p.id === decision.phaseId);
            return (
              <li key={decision.id} className="flex gap-4 py-6">
                {decision.image ? (
                  <Photo src={decision.image} alt="" className="size-20 shrink-0 rounded-md" />
                ) : null}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <StatusMark status={decision.status} />
                    <span className="text-sm text-muted">{sourceLabel(decision.source)}</span>
                    <time className="text-sm text-muted" dateTime={decision.createdAt}>
                      {formatWhen(decision.createdAt)}
                    </time>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-medium text-ink">{decision.title}</h2>
                  <p className="mt-1 text-sm text-body">{decision.body}</p>
                  <p className="mt-2 text-sm text-muted">
                    {decision.actor} · {decision.actorRole === "client" ? "Client" : "Architect"}
                    {phase ? ` · ${phase.name}` : ""}
                    {decision.sentAt ? ` · Sent ${formatWhen(decision.sentAt)}` : ""}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </StudioShell>
  );
}
