import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { firstName, formatDay, formatWhen, inr, kindLabel, sourceLabel } from "@/lib/ledger/format";
import { useLedger } from "@/lib/ledger/store";
import { useProjectData } from "@/lib/ledger/use-project";
import { Photo, PrimaryButton, SecondaryButton, SkipLink, StatusMark, areaClass, cx, fieldClass } from "./primitives";
import { ThemeToggle } from "./theme";

function ClientFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SkipLink />
      <main id="content" tabIndex={-1} className="mx-auto min-h-screen w-full max-w-lg px-5 pb-28 pt-6 outline-none">
        {children}
      </main>
    </div>
  );
}

function ClientMark({ note }: { note?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none tracking-tight">Ledger</p>
        {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
      </div>
      <ThemeToggle />
    </div>
  );
}

export function ClientHome({ projectId }: { projectId: string }) {
  const { project, phases, requests, decisions: allDecisions } = useProjectData(projectId);
  const decisions = allDecisions
    .slice()
    .filter((d) => d.status !== "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  if (!project) {
    return (
      <ClientFrame>
        <ClientMark />
        <p className="mt-6 text-base text-body">This link doesn’t match a project in the studio.</p>
      </ClientFrame>
    );
  }

  const current = phases.find((p) => p.status === "current");
  const waiting = requests.filter((r) => r.status === "pending" || r.status === "change_requested");

  return (
    <ClientFrame>
      <ClientMark note="Shared with you · no account needed" />
      <Photo
        src={project.cover}
        alt={project.name}
        className="mt-6 aspect-[4/3] w-full rounded-lg"
      />
      <h1 className="mt-5 font-display text-display font-medium">{project.name}</h1>
      <p className="mt-2 text-base text-body">
        {project.location}. {project.architect} at {project.firm} is keeping this record with {project.household}.
      </p>

      {current ? (
        <section className="mt-10">
          <p className="text-sm text-muted">Where things stand</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" aria-hidden />
            <h2 className="font-display text-title font-medium">{current.name}</h2>
          </div>
          <p className="mt-2 text-base text-body">{current.clientRole}</p>
          <p className="mt-2 text-sm text-muted">
            {firstName(project.architect)} will see your answer on this record.
          </p>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium">For you</h2>
        {waiting.length === 0 ? (
          <p className="mt-3 text-base text-body">Nothing is waiting. You’re up to date.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {waiting.map((req) => (
              <li key={req.id}>
                <Link
                  to="/approve/$requestId"
                  params={{ requestId: req.id }}
                  aria-label={`${req.title}, ${req.status === "pending" ? "waiting on you" : req.status === "change_requested" ? "change requested" : "on the record"}`}
                  className="block"
                >
                  {req.image ? (
                    <Photo src={req.image} alt="" className="aspect-[3/2] w-full rounded-md" />
                  ) : null}
                  <div className="mt-3">
                    <StatusMark status={req.status} />
                    <p className="mt-2 font-display text-lg font-medium">{req.title}</p>
                    <p className="mt-1 text-sm text-muted">{kindLabel(req.kind, req.outOfScope)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-medium">Recently on the record</h2>
        <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
          {decisions.map((decision) => (
            <li key={decision.id} className="py-4">
              <p className="text-base font-medium">{decision.title}</p>
              <p className="mt-1 text-sm text-body">{decision.body}</p>
              <p className="mt-2 text-sm text-muted">
                {sourceLabel(decision.source)} · {formatDay(decision.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </ClientFrame>
  );
}

export function ApprovalPage({ requestId }: { requestId: string }) {
  const requests = useLedger((s) => s.requests);
  const projects = useLedger((s) => s.projects);
  const phases = useLedger((s) => s.phases);
  const req = requests.find((r) => r.id === requestId);
  const project = projects.find((p) => p.id === req?.projectId);
  const phase = phases.find((p) => p.id === req?.phaseId);
  const approveRequest = useLedger((s) => s.approveRequest);
  const requestChange = useLedger((s) => s.requestChange);
  const addComment = useLedger((s) => s.addComment);

  const [mode, setMode] = useState<"none" | "comment" | "change">("none");
  const [text, setText] = useState("");
  const [optionId, setOptionId] = useState(req?.selectedOptionId ?? "");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [approver, setApprover] = useState(project?.clientName ?? "");
  const [note, setNote] = useState("");
  const approveRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!confirming) return;
    nameRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirming(false);
        approveRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  if (!req || !project) {
    return (
      <ClientFrame>
        <ClientMark />
        <p className="mt-6 text-base text-body">This approval link doesn’t match anything in the studio.</p>
      </ClientFrame>
    );
  }

  const chosen = req.options?.find((o) => o.id === (req.selectedOptionId || optionId));
  const hero = chosen?.image ?? req.image;
  const needsChoice = req.kind === "options" && req.status === "pending" && !optionId;

  const approve = () => {
    if (needsChoice) {
      setError("Choose one option first.");
      return;
    }
    if (!approver.trim()) {
      setError("Add your name so the record shows who agreed.");
      return;
    }
    approveRequest(req.id, {
      optionId: optionId || undefined,
      decidedBy: approver.trim(),
    });
    setConfirming(false);
    setError("");
  };

  return (
    <ClientFrame>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/client/$projectId"
            params={{ projectId: project.id }}
            className="font-display text-2xl leading-none tracking-tight"
          >
            Ledger
          </Link>
          <p className="mt-2 text-sm text-muted">Shared with you</p>
        </div>
        <ThemeToggle />
      </header>

      <p className="mt-8 text-sm text-muted">
        {phase?.name}
        {phase?.status === "current" ? " · current phase" : ""}
      </p>
      <h1 className="mt-2 font-display text-title font-medium">{req.title}</h1>
      <p className="mt-3 text-base text-body">{req.prompt}</p>

      {req.kind === "change" && req.prompt.length <= 180 ? (
        <div className="mt-6 rounded-md bg-surface px-4 py-5">
          <p className="text-sm font-medium text-ink">This sits outside the agreed scope</p>
          {typeof req.feeImpact === "number" ? (
            <p className="mt-3 font-display text-title font-medium tabular-nums">{inr(req.feeImpact)}</p>
          ) : null}
          {req.timeImpact ? <p className="mt-2 text-base text-body">{req.timeImpact}</p> : null}
          <p className="mt-3 text-sm text-muted">You’ll see this amount before you agree. It is not in the original fee.</p>
        </div>
      ) : null}

      {req.options && req.options.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {req.options.map((option) => {
            const selected = (req.selectedOptionId || optionId) === option.id;
            const locked = req.status !== "pending";
            return (
              <li key={option.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setOptionId(option.id);
                    setError("");
                  }}
                  className={cx(
                    "w-full rounded-md border-2 p-2 text-left",
                    selected ? "border-ink" : "border-hairline",
                    locked && "cursor-default",
                  )}
                >
                  <Photo src={option.image} alt={option.label} className="aspect-[3/2] w-full rounded-sm" />
                  <span className="mt-3 block px-1 text-base font-medium">{option.label}</span>
                  <span className="mt-1 block px-1 pb-2 text-sm text-body">{option.note}</span>
                  {req.status === "approved" && req.selectedOptionId === option.id ? (
                    <span className="block px-1 pb-2 text-sm text-ink">This is the one you chose.</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : hero ? (
        <Photo src={hero} alt={req.title} className="mt-6 aspect-[3/2] w-full rounded-md" />
      ) : null}

      {req.status === "approved" ? (
        <div className="mt-8">
          <StatusMark status="approved" />
          <p className="mt-3 text-base text-ink">
            Saved. {firstName(project.architect)} can see this.
          </p>
          <p className="mt-1 text-sm text-muted">
            {req.decidedBy ?? firstName(project.clientName)} approved this
            {req.decidedAt ? ` on ${formatWhen(req.decidedAt)}` : ""}.
          </p>
        </div>
      ) : req.status === "change_requested" ? (
        <div className="mt-8">
          <StatusMark status="change_requested" />
          {req.changeNote ? <p className="mt-3 text-base text-body">{req.changeNote}</p> : null}
          <p className="mt-2 text-sm text-muted">
            {req.decidedAt ? `${formatWhen(req.decidedAt)} · ` : ""}
            {firstName(project.architect)} can revise and send it again.
          </p>
        </div>
      ) : (
        <div className={cx("mt-8", req.prompt.length > 180 && "sticky bottom-3 z-10 -mx-5 bg-canvas px-5 pb-3 pt-3")}>
          {req.kind === "change" && req.prompt.length > 180 ? (
            <div className="mb-3 rounded-md bg-surface px-4 py-5">
              <p className="text-sm font-medium text-ink">This sits outside the agreed scope</p>
              {typeof req.feeImpact === "number" ? (
                <p className="mt-3 font-display text-title font-medium tabular-nums">{inr(req.feeImpact)}</p>
              ) : null}
              {req.timeImpact ? <p className="mt-2 text-base text-body">{req.timeImpact}</p> : null}
              <p className="mt-3 text-sm text-muted">You’ll see this amount before you agree. It is not in the original fee.</p>
            </div>
          ) : null}
          {confirming ? (
            <form
              className="rounded-md bg-surface p-5 motion-safe:animate-none"
              style={{ animation: "ledger-sheet 200ms var(--ease-state)" }}
              onSubmit={(event) => {
                event.preventDefault();
                approve();
              }}
            >
              <p className="font-display text-lg font-medium text-ink">
                {req.kind === "change" ? "Agree to this change" : "Approve"} {req.title}
              </p>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-ink">Your name</span>
                <input
                  ref={nameRef}
                  className={fieldClass}
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                />
              </label>
              {error ? (
                <p className="mt-3 text-sm text-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="mt-4 flex gap-2">
                <PrimaryButton type="submit" pill className="flex-1">
                  {req.kind === "change" ? "Agree" : "Approve"}
                </PrimaryButton>
                <SecondaryButton
                  onClick={() => {
                    setConfirming(false);
                    setError("");
                    approveRef.current?.focus();
                  }}
                >
                  Back
                </SecondaryButton>
              </div>
            </form>
          ) : (
            <>
              <PrimaryButton
                pill
                buttonRef={approveRef}
                onClick={() => {
                  if (needsChoice) {
                    setError("Choose one option first.");
                    return;
                  }
                  setError("");
                  setConfirming(true);
                }}
              >
                {req.kind === "change" ? "Agree to this change" : "Approve"}
              </PrimaryButton>
              <div className="mt-2 flex gap-2">
                <SecondaryButton
                  className="flex-1"
                  onClick={() => {
                    setMode(mode === "comment" ? "none" : "comment");
                    setText("");
                    setError("");
                  }}
                >
                  Comment
                </SecondaryButton>
                <SecondaryButton
                  className="flex-1"
                  onClick={() => {
                    setMode(mode === "change" ? "none" : "change");
                    setText("");
                    setError("");
                  }}
                >
                  Request a change
                </SecondaryButton>
              </div>
              {mode !== "none" ? (
                <form
                  className="mt-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!text.trim()) {
                      setError(mode === "comment" ? "Write a short comment." : "Say what you’d like changed.");
                      return;
                    }
                    if (mode === "comment") addComment(req.id, text);
                    else requestChange(req.id, text);
                    setText("");
                    setMode("none");
                    setError("");
                    setNote(mode === "comment" ? "Comment added to the record." : "Change request saved.");
                  }}
                >
                  <label className="block">
                    <span className="sr-only">{mode === "comment" ? "Comment" : "What should change"}</span>
                    <textarea
                      className={areaClass}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={mode === "comment" ? "A note, without changing the decision." : "What should change?"}
                    />
                  </label>
                  <div className="mt-3">
                    <PrimaryButton type="submit">{mode === "comment" ? "Send comment" : "Send change request"}</PrimaryButton>
                  </div>
                </form>
              ) : null}
              {error ? (
                <p className="mt-3 text-sm text-error" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>
      )}

      {note ? <p className="mt-4 text-sm text-ink">{note}</p> : null}

      <footer className="mt-12 border-t border-hairline pt-6">
        <p className="text-sm text-body">
          Sent by {project.architect}, {project.firm}
        </p>
        <p className="mt-1 text-sm text-body">{formatDay(req.createdAt)}</p>
        <Link
          to="/client/$projectId"
          params={{ projectId: project.id }}
          className="mt-4 inline-flex h-12 items-center rounded-sm border border-hairline bg-canvas px-5 text-sm font-medium text-ink hover:bg-surface"
        >
          Everything shared with you
        </Link>
      </footer>
    </ClientFrame>
  );
}
