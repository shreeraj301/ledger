import { createFileRoute } from "@tanstack/react-router";
import { DrawingsPage } from "@/components/ledger/drawings";
import { useLedger } from "@/lib/ledger/store";

export const Route = createFileRoute("/drawings")({
  component: DrawingsRoute,
});

function DrawingsRoute() {
  const id = useLedger((s) => s.activeProjectId);
  return <DrawingsPage key={id} />;
}
