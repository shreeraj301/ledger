import { createFileRoute } from "@tanstack/react-router";
import { DecisionsPage } from "@/components/ledger/decisions";
import { useLedger } from "@/lib/ledger/store";

export const Route = createFileRoute("/decisions")({
  component: DecisionsRoute,
});

function DecisionsRoute() {
  const id = useLedger((s) => s.activeProjectId);
  return <DecisionsPage key={id} />;
}
