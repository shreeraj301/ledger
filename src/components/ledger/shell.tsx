import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cx, Field, PrimaryButton, SecondaryButton, SkipLink, fieldClass } from "./primitives";
import { ThemeToggle } from "./theme";
import { useLedger } from "@/lib/ledger/store";

const NAV = [
  { to: "/", label: "Timeline" },
  { to: "/drawings", label: "Drawings" },
  { to: "/decisions", label: "Decisions" },
  { to: "/changes", label: "Changes" },
  { to: "/billing", label: "Billing" },
] as const;

export function StudioShell({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const projects = useLedger((s) => s.projects);
  const activeProjectId = useLedger((s) => s.activeProjectId);
  const setActiveProject = useLedger((s) => s.setActiveProject);
  const reset = useLedger((s) => s.reset);
  const createProject = useLedger((s) => s.createProject);
  const project = projects.find((p) => p.id === activeProjectId) ?? projects[0];
  const [adding, setAdding] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [draft, setDraft] = useState({ name: "", client: "", location: "" });

  useEffect(() => {
    if (!confirmReset) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmReset(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmReset]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SkipLink />
      <header className="sticky top-0 z-20 border-b border-hairline bg-canvas">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline font-display text-lg leading-none">
                L
              </span>
              <span className="min-w-0">
                <span className="block font-display text-xl leading-none tracking-tight">Ledger</span>
                <span className="mt-1 block truncate text-sm text-muted">{project?.firm}</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <nav
              aria-label="Studio"
              className="grid grid-cols-5 overflow-hidden rounded-md bg-hairline p-px sm:flex sm:gap-1 sm:overflow-visible sm:bg-transparent sm:p-0"
            >
              {NAV.map((item) => {
                const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cx(
                      "flex min-h-11 items-center justify-center px-1 text-center text-[13px] font-medium leading-tight sm:h-11 sm:rounded-full sm:px-4 sm:text-sm",
                      active
                        ? "bg-ink text-canvas"
                        : "bg-canvas text-muted hover:text-ink sm:bg-transparent sm:hover:bg-surface",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="project-switch">
                Project
              </label>
              <select
                id="project-switch"
                value={project?.id}
                onChange={(event) => setActiveProject(event.target.value)}
                className="h-11 min-w-0 flex-1 rounded-sm border border-hairline bg-surface px-4 text-sm text-ink sm:max-w-56 sm:flex-none"
              >
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.shortName}
                  </option>
                ))}
              </select>
              {project ? (
                <Link
                  to="/client/$projectId"
                  params={{ projectId: project.id }}
                  className="inline-flex h-11 shrink-0 items-center rounded-sm border border-hairline px-4 text-sm font-medium text-ink hover:bg-surface"
                >
                  Client view
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <main id="content" tabIndex={-1} className="mx-auto max-w-5xl px-5 py-8 outline-none md:px-8 md:py-12">
        <h1 className="font-display text-display font-medium tracking-tight">{title}</h1>
        {lede ? <p className="mt-4 max-w-2xl text-base leading-relaxed text-body">{lede}</p> : null}
        <div className="mt-10">{children}</div>
        <div className="mt-16 border-t border-hairline pt-8">
          {adding ? (
            <form
              className="max-w-xl space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createProject({
                  name: draft.name,
                  clientName: draft.client,
                  location: draft.location,
                  firm: project?.firm || "Studio",
                });
                setAdding(false);
                setDraft({ name: "", client: "", location: "" });
              }}
            >
              <h2 className="font-display text-title font-medium">New project</h2>
              <Field label="Project">
                <input className={fieldClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
              </Field>
              <Field label="Client">
                <input className={fieldClass} value={draft.client} onChange={(e) => setDraft({ ...draft, client: e.target.value })} required />
              </Field>
              <Field label="Location">
                <input className={fieldClass} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
              </Field>
              <PrimaryButton type="submit">Create project</PrimaryButton>
            </form>
          ) : (
            <SecondaryButton onClick={() => setAdding(true)}>New project</SecondaryButton>
          )}
        </div>
      </main>
      <footer className="mx-auto max-w-5xl px-5 pb-28 md:px-8">
        <div className="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-body">A record of what was agreed. Sample studio, saved in this browser.</p>
          <div className="flex items-center gap-5">
            <SecondaryButton onClick={() => setConfirmReset(true)}>Reset sample studio</SecondaryButton>
          </div>
        </div>
      </footer>
      {confirmReset ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-4 sm:place-items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="w-full max-w-md rounded-lg bg-canvas p-6 text-ink"
          >
            <h2 id="reset-title" className="font-display text-xl font-medium">
              Reset the sample studio?
            </h2>
            <p className="mt-3 text-base text-body">
              This replaces the projects in this browser with the original Mehta and Iyer sample. Changes you made here are removed. It does not touch a real client.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <SecondaryButton onClick={() => setConfirmReset(false)}>Cancel</SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                }}
              >
                Reset sample data
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
