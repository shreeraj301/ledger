import { createFileRoute } from "@tanstack/react-router";
import { TimelinePage } from "@/components/ledger/timeline";

export const Route = createFileRoute("/")({
  component: TimelinePage,
});
