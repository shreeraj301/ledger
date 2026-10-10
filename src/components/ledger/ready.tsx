import { useEffect, useState } from "react";
import { useLedger } from "@/lib/ledger/store";

export function useLedgerReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const done = () => setReady(true);
    const unsub = useLedger.persist.onFinishHydration(done);
    void useLedger.persist.rehydrate();
    if (useLedger.persist.hasHydrated()) done();

    const onStorage = (event: StorageEvent) => {
      if (event.key === "ledger-mvp-v1") void useLedger.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
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
