import { createFileRoute } from "@tanstack/react-router";
import { ApprovalPage } from "@/components/ledger/client-pages";

export const Route = createFileRoute("/approve/$requestId")({
  component: ApproveRoute,
});

function ApproveRoute() {
  const { requestId } = Route.useParams();
  return <ApprovalPage key={requestId} requestId={requestId} />;
}
