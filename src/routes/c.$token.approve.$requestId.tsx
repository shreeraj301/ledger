import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ApprovalPage } from "@/components/ledger/client-pages";
import { BootMark } from "@/components/ledger/ready";
import { hydrateClient } from "@/lib/ledger/store";

export const Route = createFileRoute("/c/$token/approve/$requestId")({
  component: ApproveRoute,
});

function ApproveRoute() {
  const { token, requestId } = Route.useParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop = false;
    void hydrateClient(token).then(() => {
      if (!stop) setReady(true);
    });
    return () => {
      stop = true;
    };
  }, [token]);

  if (!ready) return <BootMark />;
  return <ApprovalPage key={requestId} requestId={requestId} />;
}
