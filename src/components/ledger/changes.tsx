import { useState } from "react";
import { formatDay, inr } from "@/lib/ledger/format";
import { useProjectData } from "@/lib/ledger/use-project";
import { RequestComposer, SentNote } from "./composer";
import { CopyLink, OpenClient, Photo, PrimaryButton, StatusMark } from "./primitives";
import { StudioShell } from "./shell";

export function ChangesPage() {
  const { project, phases, requests, invoices } = useProjectData();
  const changes = requests.filter((r) => r.kind === "change");
  const [open, setOpen] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);

  if (!project) return null;

  return (
    <StudioShell
      title="Changes"
      lede="Work outside the agreed scope is written down with a fee, before anyone says yes."
    >
      <PrimaryButton
        onClick={() => {
          setOpen((value) => !value);
          setSentId(null);
        }}
      >
        {open ? "Close" : "Record a change"}
      </PrimaryButton>
      {open ? (
        <RequestComposer
          projectId={project.id}
          kind="change"
          onCancel={() => setOpen(false)}
          onDone={(id) => {
            setOpen(false);
            setSentId(id);
          }}
        />
      ) : null}
      {sentId ? <SentNote requestId={sentId} /> : null}

      <ul className="mt-10 space-y-10">
        {changes.length === 0 ? (
          <li className="text-base text-body">No changes outside scope on this project.</li>
        ) : (
          changes
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((req) => {
              const phase = phases.find((p) => p.id === req.phaseId);
              const invoice = invoices.find((inv) => inv.approvalIds.includes(req.id));
              return (
                <li key={req.id} className="border-t border-hairline pt-8">
                  <h2 className="font-display text-title font-medium">{req.title}</h2>
                  {typeof req.feeImpact === "number" ? (
                    <p className="mt-3 font-display text-title font-medium tabular-nums">{inr(req.feeImpact)}</p>
                  ) : null}
                  {req.timeImpact ? <p className="mt-1 text-base text-body">{req.timeImpact}</p> : null}
                  <p className="mt-4 max-w-2xl text-base text-body">{req.prompt}</p>
                  {req.image ? (
                    <Photo src={req.image} alt="" className="mt-5 aspect-[3/2] w-full max-w-xl rounded-md" />
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <StatusMark status={req.status} />
                    <span className="text-sm text-muted">
                      {phase?.name} · {formatDay(req.createdAt)}
                    </span>
                    {invoice ? (
                      <span className="text-sm text-muted">
                        {invoice.number} · {invoice.status === "draft" ? "Draft until they agree" : invoice.status === "due" ? "Now due" : "Paid"}
                      </span>
                    ) : null}
                  </div>
                  {req.changeNote ? (
                    <p className="mt-3 max-w-2xl text-sm text-body">They wrote: {req.changeNote}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <OpenClient requestId={req.id} label="Open what they see" />
                    {req.status === "pending" ? <CopyLink requestId={req.id} /> : null}
                  </div>
                </li>
              );
            })
        )}
      </ul>
    </StudioShell>
  );
}
