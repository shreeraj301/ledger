import { createFileRoute } from "@tanstack/react-router";
import { CaseStudyPage } from "@/components/ledger/case-study";

export const Route = createFileRoute("/case-study")({
  component: CaseStudyPage,
});
