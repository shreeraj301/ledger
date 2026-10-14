import { useEffect, useState } from "react";

export function useLedgerReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
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
