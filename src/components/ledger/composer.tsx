import { useMemo, useRef, useState } from "react";
import { parseFee } from "@/lib/ledger/format";
import { useLedger } from "@/lib/ledger/store";
import type { RequestKind } from "@/lib/ledger/types";
import { Field, PrimaryButton, QuietButton, areaClass, fieldClass } from "./primitives";
import { CopyLink, OpenClient } from "./primitives";

type FieldErrors = {
  title?: string;
  prompt?: string;
  fee?: string;
  phase?: string;
};

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const feeRef = useRef<HTMLInputElement>(null);
  const phaseRef = useRef<HTMLSelectElement>(null);

  const lockedPhase = phases.find((p) => p.id === phaseId);

  const clear = (key: keyof FieldErrors) => {
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  return (
    <form
      className="mt-4 space-y-4 rounded-lg border border-hairline bg-surface p-4 md:p-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const next: FieldErrors = {};
        if (!title.trim()) next.title = "Add a title the client can read.";
        if (!prompt.trim()) next.prompt = "Add a note the client can read.";
        if (!phase) next.phase = "Choose a phase.";
        let amount: number | undefined;
        if (kind === "change") {
          if (!fee.trim()) next.fee = "Enter the fee as a number, like 85000.";
          else {
            const parsed = parseFee(fee);
            if (parsed == null) next.fee = "Enter the fee as a number, like 85000.";
            else amount = parsed;
          }
        }
        setErrors(next);
        const first = !next.title
          ? !next.phase
            ? !next.prompt
              ? next.fee
                ? feeRef
                : null
              : promptRef
            : phaseRef
          : titleRef;
        if (first?.current) {
          first.current.focus();
          return;
        }
        if (Object.values(next).some(Boolean) || (kind === "change" && amount == null)) return;
        const id = createRequest({
          projectId,
          phaseId: phase,
          title: title.trim(),
          prompt: prompt.trim(),
          kind,
          drawingId,
          versionId,
          image,
          outOfScope: kind === "change",
          feeImpact: kind === "change" ? amount : undefined,
          timeImpact: kind === "change" && timeImpact.trim() ? timeImpact.trim() : undefined,
        });
        if (id) onDone(id);
      }}
    >
      <Field label="Title" id="change-title" error={errors.title}>
        <input
          id="change-title"
          ref={titleRef}
          className={fieldClass}
          value={title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "change-title-error" : undefined}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) clear("title");
          }}
        />
      </Field>
      {lockedPhase ? (
        <p className="text-sm text-body">Phase · {lockedPhase.name}</p>
      ) : (
        <Field label="Phase" id="change-phase" error={errors.phase}>
          <select
            id="change-phase"
            ref={phaseRef}
            className={fieldClass}
            value={phase}
            aria-invalid={Boolean(errors.phase)}
            aria-describedby={errors.phase ? "change-phase-error" : undefined}
            onChange={(e) => {
              setPhase(e.target.value);
              if (e.target.value) clear("phase");
            }}
          >
            {phases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field
        label={kind === "change" ? "What changed, in plain words" : "Note to the client"}
        id="change-note"
        error={errors.prompt}
      >
        <textarea
          id="change-note"
          ref={promptRef}
          className={areaClass}
          value={prompt}
          aria-invalid={Boolean(errors.prompt)}
          aria-describedby={errors.prompt ? "change-note-error" : undefined}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (e.target.value.trim()) clear("prompt");
          }}
        />
      </Field>
      {kind === "change" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fee, in rupees" id="change-fee" error={errors.fee} hint="A number, like 85000 or 1,85,000.">
            <input
              id="change-fee"
              ref={feeRef}
              className={fieldClass}
              inputMode="decimal"
              value={fee}
              aria-invalid={Boolean(errors.fee)}
              aria-describedby={errors.fee ? "change-fee-error" : "change-fee-hint"}
              placeholder="85000"
              onChange={(e) => {
                setFee(e.target.value);
                if (parseFee(e.target.value) != null) clear("fee");
              }}
            />
          </Field>
          <Field
            label="Extra time needed"
            id="change-time"
            hint="Optional. Say how much longer this takes, in words."
          >
            <input
              id="change-time"
              className={fieldClass}
              value={timeImpact}
              aria-describedby="change-time-hint"
              onChange={(e) => setTimeImpact(e.target.value)}
              placeholder="About three extra weeks"
            />
          </Field>
        </div>
      ) : null}
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
