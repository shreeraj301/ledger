import { useState } from "react";
import { formatDay, statusLabel } from "@/lib/ledger/format";
import { useProjectData } from "@/lib/ledger/use-project";
import { RequestComposer, SentNote } from "./composer";
import { Photo, PrimaryButton, StatusMark } from "./primitives";
import { StudioShell } from "./shell";

export function DrawingsPage() {
  const { project, phases, drawings, requests } = useProjectData();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  if (!project) return null;

  return (
    <StudioShell
      title="Drawings"
      lede="Every sheet keeps its earlier versions. The one that counts is marked Latest approved."
    >
      <div className="space-y-14">
        {drawings.map((drawing) => {
          const phase = phases.find((p) => p.id === drawing.phaseId);
          const versions = [...drawing.versions].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
          return (
            <section key={drawing.id} className="border-t border-hairline pt-8">
              <p className="text-sm text-muted">
                {drawing.sheet}
                {phase ? ` · ${phase.name}` : ""}
              </p>
              <h2 className="mt-1 font-display text-title font-medium">{drawing.title}</h2>
              <div className="mt-6 space-y-10">
                {versions.map((version) => {
                  const pending = requests.find(
                    (r) => r.versionId === version.id && r.status === "pending",
                  );
                  const composing = openKey === version.id;
                  return (
                    <article key={version.id}>
                      <Photo
                        src={version.image}
                        alt={`${drawing.title}, ${version.label}`}
                        className="aspect-[3/2] w-full rounded-md"
                      />
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <p className="text-base font-medium text-ink">
                          {version.label}
                          <span className="font-normal text-muted"> · {formatDay(version.uploadedAt)}</span>
                        </p>
                        <StatusMark status={version.status} />
                      </div>
                      <p className="mt-2 max-w-2xl text-base text-body">{version.note}</p>
                      {version.status === "superseded" ? (
                        <p className="mt-2 text-sm text-muted">Superseded, still here if you need it.</p>
                      ) : null}
                      {pending ? (
                        <p className="mt-3 text-sm text-ink">
                          With {project.clientName.split(" ")[0]} · {statusLabel(pending.status).toLowerCase()}
                        </p>
                      ) : version.status !== "latest_approved" ? (
                        <PrimaryButton
                          className="mt-4"
                          onClick={() => {
                            setSentId(null);
                            setOpenKey(composing ? null : version.id);
                          }}
                        >
                          {composing ? "Close" : "Ask them to approve"}
                        </PrimaryButton>
                      ) : null}
                      {composing ? (
                        <RequestComposer
                          projectId={project.id}
                          kind="drawing"
                          phaseId={drawing.phaseId}
                          drawingId={drawing.id}
                          versionId={version.id}
                          image={version.image}
                          initialTitle={`${drawing.title}, ${version.label}`}
                          initialPrompt={version.note}
                          onCancel={() => setOpenKey(null)}
                          onDone={(id) => {
                            setOpenKey(null);
                            setSentId(id);
                          }}
                        />
                      ) : null}
                      {sentId && requests.some((r) => r.id === sentId && r.versionId === version.id) ? (
                        <SentNote requestId={sentId} />
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </StudioShell>
  );
}
