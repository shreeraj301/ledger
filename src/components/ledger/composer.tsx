import { useMemo, useState } from "react";
import { useLedger } from "@/lib/ledger/store";
import type { RequestKind } from "@/lib/ledger/types";
import { Field, PrimaryButton, QuietButton, areaClass, fieldClass } from "./primitives";
import { CopyLink, OpenClient } from "./primitives";

export function RequestComposer({
  projectId,
  kind,
  phaseId,
  drawingId,
  versionId,
  image,
  initialTitle = "",
  initialPrompt = "",
  onDone,
  onCancel,
}: {
  projectId: string;
  kind: RequestKind;
  phaseId?: string;
  drawingId?: string;
  versionId?: string;
  image?: string;
  initialTitle?: string;
  initialPrompt?: string;
  onDone: (id: string) => void;
  onCancel?: () => void;
}) {
  const allPhases = useLedger((s) => s.phases);
  const phases = useMemo(
    () => allPhases.filter((p) => p.projectId === projectId),
    [allPhases, projectId],
  );
  const createRequest = useLedger((s) => s.createRequest);
  const [title, setTitle] = useState(initialTitle);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [phase, setPhase] = useState(phaseId ?? phases.find((p) => p.status === "current")?.id ?? phases[0]?.id ?? "");
  const [fee, setFee] = useState("");
  const [timeImpact, setTimeImpact] = useState("");
  const [error, setError] = useState("");

  const lockedPhase = phases.find((p) => p.id === phaseId);

  return (
    <form
      className="mt-4 space-y-4 rounded-lg border border-hairline bg-surface p-4 md:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const amount = Number(fee.replace(/,/g, ""));
        if (!title.trim() || !prompt.trim()) {
          setError("Add a title and a note the client can read.");
          return;
        }
        if (kind === "change" && (!Number.isFinite(amount) || amount <= 0)) {
          setError("Add the fee in rupees, so they can see it before they agree.");
          return;
        }
        if (!phase) {
          setError("Choose a phase.");
          return;
        }
        setError("");
        const id = createRequest({
          projectId,
          phaseId: phase,
          title,
          prompt,
          kind,
          drawingId,
          versionId,
          image,
          outOfScope: kind === "change",
          feeImpact: kind === "change" ? amount : undefined,
          timeImpact: kind === "change" ? timeImpact : undefined,
        });
        onDone(id);
      }}
    >
      <Field label="Title">
        <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      {lockedPhase ? (
        <p className="text-sm text-muted">Phase · {lockedPhase.name}</p>
      ) : (
        <Field label="Phase">
          <select className={fieldClass} value={phase} onChange={(e) => setPhase(e.target.value)}>
            {phases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label={kind === "change" ? "What changed, in plain words" : "Note to the client"}>
        <textarea className={areaClass} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </Field>
      {kind === "change" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fee, in rupees">
            <input
              className={fieldClass}
              inputMode="numeric"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="185000"
            />
          </Field>
          <Field label="Time">
            <input
              className={fieldClass}
              value={timeImpact}
              onChange={(e) => setTimeImpact(e.target.value)}
              placeholder="About three extra weeks"
            />
          </Field>
        </div>
      ) : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <PrimaryButton type="submit">{kind === "change" ? "Send the change" : "Send for approval"}</PrimaryButton>
        {onCancel ? <QuietButton onClick={onCancel}>Cancel</QuietButton> : null}
      </div>
    </form>
  );
}

export function SentNote({ requestId }: { requestId: string }) {
  return (
    <div className="mt-4 rounded-md bg-surface px-4 py-4">
      <p className="text-base font-medium text-ink">Sent. This is the link they open. No account.</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <CopyLink requestId={requestId} />
        <OpenClient requestId={requestId} />
      </div>
    </div>
  );
}
