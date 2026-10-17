import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { firstName, formatDay, revisionNote, statusLabel } from "@/lib/ledger/format";
import { useProjectData } from "@/lib/ledger/use-project";
import { RequestComposer, SentNote } from "./composer";
import { Photo, PrimaryButton, SecondaryButton, StatusMark } from "./primitives";
import { StudioShell } from "./shell";

export function DrawingsPage() {
  const { project, phases, drawings, requests } = useProjectData();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const hash = useRouterState({ select: (state) => state.location.hash.replace(/^#/, "") });

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ block: "start" });
  }, [hash]);

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
          const newestUnapproved = versions.find((v) => v.status !== "latest_approved" && v.status !== "superseded");
          return (
            <section
              key={drawing.id}
              id={drawing.id}
              className={`border-t border-hairline pt-8 ${hash === drawing.id ? "rounded-md ring-1 ring-ink" : ""}`}
            >
              <p className="text-sm text-body">
                {drawing.sheet}
                {phase ? ` · ${phase.name}` : ""}
              </p>
              <h2 className="mt-1 font-display text-title font-medium">{drawing.title}</h2>
              <div className="mt-6 space-y-8">
                {versions.map((version, index) => {
                  const pending = requests.find((r) => r.versionId === version.id && r.status === "pending");
                  const composing = openKey === version.id;
                  const isLatestView = index === 0;
                  const canAsk =
                    !pending && version.status !== "latest_approved" && version.id === newestUnapproved?.id;
                  const canSendOlder =
                    !pending && version.status !== "latest_approved" && version.id !== newestUnapproved?.id;

                  if (!isLatestView) {
                    return (
                      <article key={version.id} className="flex gap-4">
                        <Photo
                          src={version.image}
                          alt={`${drawing.title}, ${version.label}, sample photo`}
                          className="size-24 shrink-0 rounded-sm"
                        />
                        <div className="min-w-0">
                          <p className="text-base font-medium text-ink">
                            {version.label}
                            <span className="font-normal text-body"> · {formatDay(version.uploadedAt)}</span>
                          </p>
                          {revisionNote(version.label) ? (
                            <p className="mt-1 text-sm text-body">{revisionNote(version.label)}</p>
                          ) : null}
                          <div className="mt-1">
                            <StatusMark status={version.status} />
                          </div>
                          <p className="mt-1 text-sm text-body">{version.note}</p>
                          {version.status === "superseded" ? (
                            <p className="mt-1 text-sm text-body">Still on the record, if you need the older drawing.</p>
                          ) : null}
                          {canSendOlder && !composing ? (
                            <SecondaryButton
                              className="mt-3"
                              onClick={() => {
                                setSentId(null);
                                setOpenKey(version.id);
                              }}
                            >
                              Send {version.label} to {firstName(project.clientName)}
                            </SecondaryButton>
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
                        </div>
                      </article>
                    );
                  }

                  return (
                    <article key={version.id}>
                      <Photo
                        src={version.image}
                        alt={`${drawing.title}, sample photo, not a drawing sheet`}
                        className="aspect-[3/2] w-full rounded-md"
                      />
                      <p className="mt-2 text-sm text-body">Sample image. Actual drawing sheets are not yet available.</p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <p className="text-base font-medium text-ink">
                          {version.label}
                          <span className="font-normal text-body"> · {formatDay(version.uploadedAt)}</span>
                        </p>
                        <StatusMark status={version.status} />
                      </div>
                      {revisionNote(version.label) ? (
                        <p className="mt-1 text-sm text-body">{revisionNote(version.label)}</p>
                      ) : null}
                      <p className="mt-2 max-w-2xl text-base text-body">{version.note}</p>
                      {pending ? (
                        <p className="mt-3 text-sm text-ink">
                          With {project.clientName.split(" ")[0]} · {statusLabel(pending.status).toLowerCase()}
                        </p>
                      ) : canAsk && !composing ? (
                        <PrimaryButton
                          className="mt-4"
                          onClick={() => {
                            setSentId(null);
                            setOpenKey(version.id);
                          }}
                        >
                          Ask them to approve
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
