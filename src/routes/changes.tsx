import { createFileRoute } from "@tanstack/react-router";
import { ChangesPage } from "@/components/ledger/changes";
import { useLedger } from "@/lib/ledger/store";

export const Route = createFileRoute("/changes")({
  component: ChangesRoute,
});

function ChangesRoute() {
  const id = useLedger((s) => s.activeProjectId);
  return <ChangesPage key={id} />;
}
