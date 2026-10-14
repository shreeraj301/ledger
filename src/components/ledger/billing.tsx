import { Link } from "@tanstack/react-router";
import { formatDay, inr } from "@/lib/ledger/format";
import { useProjectData } from "@/lib/ledger/use-project";
import { Photo, StatusMark, cx } from "./primitives";
import { StudioShell } from "./shell";

export function BillingPage() {
  const { project, phases, requests, invoices: projectInvoices } = useProjectData();
  const invoices = projectInvoices.slice().sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  if (!project) return null;

  const totalDue = invoices.filter((inv) => inv.status === "due").reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <StudioShell
      title="Billing"
      lede={
        totalDue > 0
          ? `${inr(totalDue)} is due. Each amount below is tied to something already agreed, or waiting to be.`
          : "Nothing is due. Each amount below is tied to a decision on the record."
      }
    >
      <ul>
        {invoices.map((invoice) => {
          const phase = phases.find((p) => p.id === invoice.phaseId);
          const support = invoice.approvalIds
            .map((id) => requests.find((r) => r.id === id))
            .filter((r) => r !== undefined);
          return (
            <li key={invoice.id} className="border-t border-hairline py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-sm text-muted">{invoice.number}</p>
                <StatusMark status={invoice.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-medium">{invoice.title}</h2>
                <p
                  className={cx(
                    "font-display text-title font-medium tabular-nums",
                    invoice.status === "paid" ? "text-muted" : "text-ink",
                  )}
                >
                  {inr(invoice.amount)}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted">
                {phase?.name} · {formatDay(invoice.issuedAt)}
              </p>
              <h3 className="mt-6 text-sm font-medium text-ink">Why this amount</h3>
              <p className="mt-2 max-w-2xl text-base text-body">{invoice.why}</p>
              {support.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-ink">Supported by</h3>
                  <ul className="mt-3 space-y-3">
                    {support.map((req) => (
                      <li key={req.id}>
                        <Link
                          to="/c/$token/approve/$requestId"
                          params={{ token: project.clientToken ?? "", requestId: req.id }}
                          className="flex items-center gap-3 rounded-md hover:shadow-lift"
                        >
                          {req.image ? (
                            <Photo src={req.image} alt="" className="size-14 shrink-0 rounded-md" />
                          ) : null}
                          <span className="min-w-0">
                            <span className="block text-base text-ink">{req.title}</span>
                            <span className="mt-1 block">
                              <StatusMark status={req.status} />
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </StudioShell>
  );
}
