import { supabase } from "./remote";

export async function currentSession() {
  const db = supabase();
  if (!db) return null;
  const { data } = await db.auth.getSession();
  return data.session;
}

export async function signIn(email: string, password: string) {
  const db = supabase();
  if (!db) throw new Error("Supabase is not configured.");
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string) {
  const db = supabase();
  if (!db) throw new Error("Supabase is not configured.");
  const { data, error } = await db.auth.signUp({ email, password });
  if (error) throw error;
  return Boolean(data.session);
}

export async function sendMagicLink(email: string) {
  const db = supabase();
  if (!db) throw new Error("Supabase is not configured.");
  const { error } = await db.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  const db = supabase();
  if (!db) return;
  await db.auth.signOut();
}

export function onAuth(listener: () => void) {
  const db = supabase();
  if (!db) return () => {};
  const { data } = db.auth.onAuthStateChange(() => listener());
  return () => data.subscription.unsubscribe();
}
