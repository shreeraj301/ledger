import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LedgerData } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const remoteEnabled = Boolean(url && key);

let client: SupabaseClient | null = null;

export function supabase() {
  if (!remoteEnabled) return null;
  if (!client) client = createClient(url!, key!);
  return client;
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

export async function loadRemote(): Promise<LedgerData | null> {
  const db = supabase();
  if (!db) return null;
  const { data, error } = await db.from("ledger").select("data").eq("id", "main").maybeSingle();
  if (error) throw error;
  return (data?.data as LedgerData | undefined) ?? null;
}

export async function saveRemote(data: LedgerData) {
  const db = supabase();
  if (!db) return;
  const { error } = await db.from("ledger").upsert({
    id: "main",
    data: snapshot(data),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export function watchRemote(onChange: (data: LedgerData) => void) {
  const db = supabase();
  if (!db) return () => {};
  const channel = db
    .channel("ledger-main")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "ledger", filter: "id=eq.main" },
      (payload) => {
        const next = (payload.new as { data?: LedgerData } | null)?.data;
        if (next) onChange(next);
      },
    )
    .subscribe();
  return () => {
    void db.removeChannel(channel);
  };
}
