import { useMemo, useState } from "react";
import { formatWhen, sourceLabel } from "@/lib/ledger/format";
import { useLedger } from "@/lib/ledger/store";
import { useProjectData } from "@/lib/ledger/use-project";
import type { DecisionStatus } from "@/lib/ledger/types";
import { Field, Photo, PrimaryButton, StatusMark, areaClass, cx, fieldClass } from "./primitives";
import { StudioShell } from "./shell";

const FILTERS: Array<{ id: "all" | DecisionStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Waiting" },
  { id: "change_requested", label: "Changes" },
  { id: "noted", label: "Notes" },
];

export function DecisionsPage() {
  const { project, phases, decisions } = useProjectData();
  const addWhatsApp = useLedger((s) => s.addWhatsApp);

  const [query, setQuery] = useState("");
  const [phaseId, setPhaseId] = useState("all");
  const [status, setStatus] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [message, setMessage] = useState("");
  const [actor, setActor] = useState(project?.clientName ?? "");
  const [role, setRole] = useState<"client" | "architect">("client");
  const [notePhase, setNotePhase] = useState(phases.find((p) => p.status === "current")?.id ?? phases[0]?.id ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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
      <form
        className="rounded-lg border border-hairline bg-surface p-4 md:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!message.trim()) {
            setError("Paste the message first.");
            setSaved(false);
            return;
          }
          addWhatsApp({
            projectId: project.id,
            phaseId: notePhase,
            message,
            actor,
            actorRole: role,
          });
          setMessage("");
          setError("");
          setSaved(true);
        }}
      >
        <h2 className="font-display text-xl font-medium">Paste a WhatsApp message</h2>
        <p className="mt-1 text-sm text-body">It lands in the record with their name, not as a formal approval.</p>
        <div className="mt-4 space-y-4">
          <Field label="Message">
            <textarea
              className={areaClass}
              value={message}
              placeholder="Meera: Can we keep the old mango tree?"
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Who said it">
              <input className={fieldClass} value={actor} onChange={(e) => setActor(e.target.value)} />
            </Field>
            <Field label="Role">
              <select
                className={fieldClass}
                value={role}
                onChange={(e) => setRole(e.target.value === "architect" ? "architect" : "client")}
              >
                <option value="client">Client</option>
                <option value="architect">Architect</option>
              </select>
            </Field>
            <Field label="Phase">
              <select className={fieldClass} value={notePhase} onChange={(e) => setNotePhase(e.target.value)}>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          {saved ? <p className="text-sm text-ink">Added to the record.</p> : null}
          <PrimaryButton type="submit">Add to the record</PrimaryButton>
        </div>
      </form>

      <div className="mt-10 flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the record"
          aria-label="Search the record"
          className="h-12 w-full rounded-full border border-hairline bg-canvas px-4 text-base text-ink placeholder:text-muted-soft"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            aria-label="Filter by phase"
            value={phaseId}
            onChange={(e) => setPhaseId(e.target.value)}
            className="h-12 rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
          >
            <option value="all">All phases</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((item) => {
              const on = status === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setStatus(item.id)}
                  className={cx(
                    "h-12 shrink-0 rounded-full px-4 text-sm font-medium",
                    on ? "bg-ink text-canvas" : "border border-hairline bg-canvas text-ink hover:bg-surface",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-hairline border-t border-hairline">
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
