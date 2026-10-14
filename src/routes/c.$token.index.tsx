import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClientHome } from "@/components/ledger/client-pages";
import { BootMark } from "@/components/ledger/ready";
import { hydrateClient, useLedger } from "@/lib/ledger/store";

export const Route = createFileRoute("/c/$token/")({
  component: ClientRoute,
});

function ClientRoute() {
  const { token } = Route.useParams();
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const projectId = useLedger((s) => s.projects[0]?.id);

  useEffect(() => {
    let stop = false;
    void hydrateClient(token).then((ok) => {
      if (stop) return;
      setMissing(!ok);
      setReady(true);
    });
    return () => {
      stop = true;
    };
  }, [token]);

  if (!ready) return <BootMark />;
  if (missing || !projectId) {
    return (
      <div className="min-h-screen bg-canvas px-6 pt-8 text-ink">
        <p className="font-display text-2xl">Ledger</p>
        <p className="mt-6 text-base text-body">This link doesn’t match a project.</p>
      </div>
    );
  }
  return <ClientHome projectId={projectId} />;
}
