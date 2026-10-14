import { createFileRoute } from "@tanstack/react-router";
import { DeadLink } from "@/components/ledger/dead-link";

export const Route = createFileRoute("/approve/$requestId")({
  component: DeadLink,
});
