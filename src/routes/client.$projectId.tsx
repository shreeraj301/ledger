import { createFileRoute } from "@tanstack/react-router";
import { ClientHome } from "@/components/ledger/client-pages";

export const Route = createFileRoute("/client/$projectId")({
  component: ClientRoute,
});

function ClientRoute() {
  const { projectId } = Route.useParams();
  return <ClientHome projectId={projectId} />;
}
