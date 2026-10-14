import { Link } from "@tanstack/react-router";
import { firstName, formatDay, kindLabel } from "@/lib/ledger/format";
import { useProjectData } from "@/lib/ledger/use-project";
import { StudioShell } from "./shell";
import { CopyLink, Photo, StatusMark, cx } from "./primitives";

export function TimelinePage() {
  const { project, phases, drawings, requests } = useProjectData();

  if (!project) return null;

  const current = phases.find((p) => p.status === "current");
  const waiting = requests.filter((r) => r.status === "pending");
  const who = firstName(project.clientName);
  const underway = (name: string) => (/s$/i.test(name) ? `${name} are underway` : `${name} is underway`);
  const lede = current
    ? waiting.length === 0
      ? `${underway(current.name)}. Nothing is waiting on ${who}.`
      : waiting.length === 1
        ? `${underway(current.name)}. ${waiting[0]?.title} is with ${who}.`
        : `${underway(current.name)}. ${waiting.length} things are with ${who}.`
    : "Every phase on this project is closed.";

  return (
    <StudioShell title={project.name} lede={lede}>
      <figure>
        {project.cover ? (
          <Photo
            src={project.cover}
            alt={`${project.name} in ${project.location}`}
            className="aspect-[16/9] w-full rounded-lg"
          />
        ) : (
          <div className="aspect-[16/9] w-full rounded-lg bg-surface" />
        )}
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
          <span className="text-ink">{project.typology}</span>
          <span className="text-muted">
            {project.location} · {project.household}
          </span>
        </figcaption>
      </figure>

      <section className="mt-14">
        <h2 className="font-display text-title font-medium">Waiting on {who}</h2>
        {waiting.length === 0 ? (
          <p className="mt-3 text-base text-body">Nothing open. The record is quiet.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {waiting.map((req) => (
              <li key={req.id} className="rounded-lg bg-surface p-3 sm:p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    to="/approve/$requestId"
                    params={{ requestId: req.id }}
                    className="group grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-[11rem_1fr]"
                  >
                    {req.image ? (
                      <Photo
                        src={req.image}
                        alt={req.title}
                        className="aspect-[3/2] w-full rounded-sm transition-shadow duration-200 group-hover:shadow-lift"
                      />
                    ) : (
                      <div className="aspect-[3/2] rounded-sm bg-canvas ring-1 ring-hairline" />
                    )}
                    <div className="min-w-0">
                      <StatusMark status={req.status} />
                      <p className="mt-2 font-display text-lg font-medium text-ink">{req.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {phases.find((p) => p.id === req.phaseId)?.name} · {kindLabel(req.kind, req.outOfScope)} ·{" "}
                        {formatDay(req.createdAt)}
                      </p>
                    </div>
                  </Link>
                  <CopyLink requestId={req.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16">
        <h2 className="font-display text-title font-medium">Phases</h2>
        <ol className="mt-8">
          {phases.map((phase, index) => {
            const open = requests.filter((r) => r.phaseId === phase.id && r.status === "pending");
            const linked = drawings.filter((d) => d.phaseId === phase.id);
            const last = index === phases.length - 1;
            return (
              <li key={phase.id} className="grid grid-cols-[1.25rem_1fr] gap-4">
                <div className="relative flex justify-center">
                  <span
                    className={cx(
                      "z-10 mt-1.5 size-2.5 rounded-full",
                      phase.status === "current" && "bg-primary ring-4 ring-primary-soft",
                      phase.status === "completed" && "bg-ink",
                      phase.status === "upcoming" && "bg-canvas ring-1 ring-hairline",
                    )}
                  />
                  {last ? null : <span className="absolute top-5 bottom-0 w-px bg-hairline" />}
                </div>
                <div className="pb-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3
                      className={cx(
                        "text-ink",
                        phase.status === "current" ? "font-display text-title font-medium" : "text-base font-medium",
                      )}
                    >
                      {phase.name}
                    </h3>
                    <span className="text-sm text-muted">{phase.span}</span>
                  </div>
                  <p className="mt-1 text-sm text-body">{phase.clientRole}</p>
                  {open.length > 0 ? (
                    <p className="mt-2 text-sm text-ink">
                      {open.length === 1 ? "1 open item" : `${open.length} open items`}
                    </p>
                  ) : phase.status === "completed" ? (
                    <p className="mt-2 text-sm text-muted">Closed</p>
                  ) : null}
                  {linked.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-3">
                      {linked.slice(0, 2).map((drawing) => {
                        const shot =
                          drawing.versions.find((v) => v.status === "latest_approved") ??
                          drawing.versions.find((v) => v.status === "pending") ??
                          drawing.versions[0];
                        if (!shot) return null;
                        return (
                          <li key={drawing.id}>
                            <Link to="/drawings" className="block w-32">
                              <Photo src={shot.image} alt={drawing.title} className="aspect-[3/2] w-full rounded-sm" />
                              <span className="mt-2 block text-sm text-ink">{drawing.title}</span>
                              <span className="block text-sm text-muted">{drawing.sheet}</span>
                            </Link>
                          </li>
                        );
                      })}
                      {linked.length > 2 ? (
                        <li className="flex items-end">
                          <Link to="/drawings" className="text-sm font-medium text-ink underline-offset-4 hover:underline">
                            +{linked.length - 2} sheets
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </StudioShell>
  );
}
