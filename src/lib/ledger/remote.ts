import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LedgerData, Project } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const remoteEnabled = Boolean(url && key);

let client: SupabaseClient | null = null;
let firmId: string | null = null;

export function supabase() {
  if (!remoteEnabled) return null;
  if (!client) client = createClient(url!, key!);
  return client;
}

export function currentFirmId() {
  return firmId;
}

function snapshot(data: LedgerData): LedgerData {
  return {
    activeProjectId: data.activeProjectId,
    projects: data.projects,
    phases: data.phases,
    drawings: data.drawings,
    requests: data.requests,
    decisions: data.decisions,
    invoices: data.invoices,
  };
}

function withTokens(data: LedgerData): LedgerData {
  return {
    ...data,
    projects: data.projects.map((project) => ({
      ...project,
      clientToken: project.clientToken || crypto.randomUUID().replace(/-/g, ""),
    })),
  };
}

async function syncTokens(projects: Project[]) {
  const db = supabase();
  if (!db || !firmId) return;
  const rows = projects
    .filter((project) => project.clientToken)
    .map((project) => ({
      token: project.clientToken as string,
      firm_id: firmId,
      project_id: project.id,
    }));
  if (rows.length === 0) return;
  await db.from("client_tokens").upsert(rows);
}

export async function ensureFirm() {
  const db = supabase();
  if (!db) return null;
  const { data, error } = await db.rpc("ensure_firm");
  if (error) throw error;
  firmId = data as string;
  return firmId;
}

export async function loadRemote(): Promise<LedgerData | null> {
  const db = supabase();
  if (!db || !firmId) return null;
  const { data, error } = await db.from("studios").select("data").eq("firm_id", firmId).maybeSingle();
  if (error) throw error;
  if (!data?.data) return null;
  return withTokens(data.data as LedgerData);
}

export async function saveRemote(data: LedgerData) {
  const db = supabase();
  if (!db || !firmId) return;
  const next = withTokens(snapshot(data));
  const { error } = await db.from("studios").upsert({
    firm_id: firmId,
    data: next,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  await syncTokens(next.projects);
}

let watchingFirm: string | null = null;

export function watchRemote(onChange: (data: LedgerData) => void) {
  const db = supabase();
  if (!db || !firmId) return () => {};
  if (watchingFirm === firmId) return () => {};
  watchingFirm = firmId;
  const id = firmId;
  const channel = db
    .channel(`studio-${id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "studios", filter: `firm_id=eq.${id}` },
      (payload) => {
        const next = (payload.new as { data?: LedgerData } | null)?.data;
        if (next) onChange(withTokens(next));
      },
    )
    .subscribe();
  return () => {
    if (watchingFirm === id) watchingFirm = null;
    void db.removeChannel(channel);
  };
}

export async function loadClient(token: string): Promise<LedgerData | null> {
  const db = supabase();
  if (!db) return null;
  const { data, error } = await db.rpc("client_load", { p_token: token });
  if (error) throw error;
  if (!data?.project) return null;
  const project = data.project as Project;
  return {
    activeProjectId: project.id,
    projects: [project],
    phases: data.phases ?? [],
    drawings: data.drawings ?? [],
    requests: data.requests ?? [],
    decisions: data.decisions ?? [],
    invoices: data.invoices ?? [],
  };
}

export async function saveClient(token: string, data: LedgerData) {
  const db = supabase();
  if (!db) return;
  const project = data.projects.find((item) => item.clientToken === token) ?? data.projects[0];
  if (!project) return;
  const { error } = await db.rpc("client_apply", {
    p_token: token,
    p_slice: {
      project,
      phases: data.phases.filter((item) => item.projectId === project.id),
      drawings: data.drawings.filter((item) => item.projectId === project.id),
      requests: data.requests.filter((item) => item.projectId === project.id),
      decisions: data.decisions.filter((item) => item.projectId === project.id),
      invoices: data.invoices.filter((item) => item.projectId === project.id),
    },
  });
  if (error) throw error;
}
