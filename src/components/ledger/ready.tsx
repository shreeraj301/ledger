import { useEffect, useState } from "react";
import { currentSession, onAuth } from "@/lib/ledger/auth";
import { hydrateLedger } from "@/lib/ledger/store";

export function useLedgerReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop = false;
    const boot = async () => {
      const session = await currentSession();
      if (session) await hydrateLedger();
      if (!stop) setReady(true);
    };
    void boot();
    const unsub = onAuth(() => {
      void boot();
    });
    return () => {
      stop = true;
      unsub();
    };
  }, []);

  return ready;
}

export function BootMark() {
  return (
    <div className="min-h-screen bg-canvas px-6 pt-8 text-ink">
      <p className="font-display text-2xl leading-none tracking-tight">Ledger</p>
    </div>
  );
}
