import { useMemo } from "react";
import { useLedger } from "./store";

export function useProjectData(projectId?: string) {
  const activeProjectId = useLedger((s) => s.activeProjectId);
  const id = projectId ?? activeProjectId;
  const projects = useLedger((s) => s.projects);
  const phases = useLedger((s) => s.phases);
  const drawings = useLedger((s) => s.drawings);
  const requests = useLedger((s) => s.requests);
  const decisions = useLedger((s) => s.decisions);
  const invoices = useLedger((s) => s.invoices);

  return useMemo(() => {
    return {
      id,
      project: projects.find((p) => p.id === id),
      phases: phases.filter((p) => p.projectId === id).sort((a, b) => a.order - b.order),
      drawings: drawings.filter((d) => d.projectId === id),
      requests: requests.filter((r) => r.projectId === id),
      decisions: decisions.filter((d) => d.projectId === id),
      invoices: invoices.filter((inv) => inv.projectId === id),
    };
  }, [id, projects, phases, drawings, requests, decisions, invoices]);
}
