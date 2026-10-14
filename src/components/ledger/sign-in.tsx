import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { sendMagicLink, signIn, signUp } from "@/lib/ledger/auth";
import { Field, PrimaryButton, fieldClass } from "./primitives";
import { ThemeToggle } from "./theme";

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const go = () => navigate({ to: "/" });

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-5 pt-6">
        <div className="flex items-start justify-between">
          <p className="font-display text-2xl leading-none tracking-tight">Ledger</p>
          <ThemeToggle />
        </div>
        <h1 className="mt-16 font-display text-display font-medium">Open your studio</h1>
        <p className="mt-3 text-base text-body">
          A studio signs in. A client never does — they get a link.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              await signIn(email, password);
              go();
            } catch (err) {
              const message = err instanceof Error ? err.message : "Could not sign in.";
              setError(
                /not confirmed/i.test(message)
                  ? "Confirm the email first, then sign in. Or turn off Confirm email in Supabase."
                  : message,
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Email">
            <input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <input className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </Field>
          {error ? <p className="text-sm text-error" role="alert">{error}</p> : null}
          {note ? <p className="text-sm text-ink">{note}</p> : null}
          <PrimaryButton type="submit" disabled={busy}>Sign in</PrimaryButton>
        </form>
        <div className="mt-4 flex flex-wrap gap-4">
          <button
            type="button"
            className="h-12 text-sm font-medium text-ink underline-offset-4 hover:underline"
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const signedIn = await signUp(email, password);
                if (signedIn) go();
                else setNote("Check your email and confirm the address. Then come back and sign in.");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not create the studio.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Create a studio
          </button>
          <button
            type="button"
            className="h-12 text-sm text-muted underline-offset-4 hover:underline"
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await sendMagicLink(email);
                setNote("Check your email for a sign-in link.");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not send the link.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Email me a link
          </button>
        </div>
      </div>
    </div>
  );
}
