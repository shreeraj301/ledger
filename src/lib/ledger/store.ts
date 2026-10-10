import { create } from "zustand";
import { persist } from "zustand/middleware";
import { inr } from "./format";
import { SEED } from "./seed";
import type {
  ActorRole,
  ApprovalRequest,
  Decision,
  Drawing,
  Invoice,
  LedgerData,
  RequestKind,
} from "./types";

export interface CreateRequestInput {
  projectId: string;
  phaseId: string;
  title: string;
  prompt: string;
  kind: RequestKind;
  drawingId?: string;
  versionId?: string;
  image?: string;
  outOfScope?: boolean;
  feeImpact?: number;
  timeImpact?: string;
}

interface Actions {
  setActiveProject: (id: string) => void;
  approveRequest: (id: string, opts?: { comment?: string; optionId?: string }) => void;
  requestChange: (id: string, note: string) => void;
  addComment: (id: string, comment: string) => void;
  addWhatsApp: (input: {
    projectId: string;
    phaseId: string;
    message: string;
    actor: string;
    actorRole: ActorRole;
  }) => void;
  createRequest: (input: CreateRequestInput) => string;
  reset: () => void;
}

export type LedgerState = LedgerData & Actions;

function fresh(): LedgerData {
  return structuredClone(SEED);
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function requestImage(
  req: ApprovalRequest,
  drawings: Drawing[],
  optionId?: string,
) {
  const chosen = req.options?.find((o) => o.id === (optionId ?? req.selectedOptionId));
  if (chosen) return chosen.image;
  if (req.image) return req.image;
  const drawing = drawings.find((d) => d.id === req.drawingId);
  const version =
    drawing?.versions.find((v) => v.id === req.versionId) ?? drawing?.versions[0];
  return version?.image;
}

function settleDecision(
  decisions: Decision[],
  requestId: string,
  next: Omit<Decision, "id" | "projectId" | "phaseId" | "title" | "image" | "drawingId" | "requestId"> & {
    title?: string;
  },
  fallback: Decision,
) {
  let updated = false;
  const mapped = decisions.map((d) => {
    if (updated) return d;
    if (d.requestId !== requestId) return d;
    if (d.status !== "pending" && d.status !== "change_requested") return d;
    updated = true;
    return {
      ...d,
      ...next,
      title: next.title ?? d.title,
      sentAt: d.sentAt ?? d.createdAt,
      image: d.image,
      drawingId: d.drawingId,
      requestId,
    };
  });
  if (!updated) mapped.unshift(fallback);
  return mapped;
}

export const useLedger = create<LedgerState>()(
  persist(
    (set, get) => ({
      ...fresh(),
      setActiveProject: (id) => set({ activeProjectId: id }),
      approveRequest: (id, opts) => {
        const state = get();
        const req = state.requests.find((r) => r.id === id);
        if (!req || req.status === "approved") return;
        const project = state.projects.find((p) => p.id === req.projectId);
        if (!project) return;
        const now = new Date().toISOString();
        const optionId = opts?.optionId ?? req.selectedOptionId;
        const option = req.options?.find((o) => o.id === optionId);
        const client = project.clientName;

        const outcome = option
          ? `Chose “${option.label}”.${opts?.comment ? ` ${opts.comment}` : ""}`
          : req.kind === "change"
            ? `Agreed to the change.${req.feeImpact ? ` ${inr(req.feeImpact)} is now due.` : ""}${opts?.comment ? ` ${opts.comment}` : ""}`
            : opts?.comment
              ? opts.comment
              : "Approved, with no comments.";

        const requests = state.requests.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "approved" as const,
                decidedAt: now,
                decidedBy: client,
                selectedOptionId: optionId,
                comment: opts?.comment || r.comment,
                image: option?.image ?? r.image,
              }
            : r,
        );

        const drawings = state.drawings.map((d) => {
          if (d.id !== req.drawingId) return d;
          return {
            ...d,
            versions: d.versions.map((v) => {
              if (v.id === req.versionId) return { ...v, status: "latest_approved" as const };
              if (v.status === "latest_approved") return { ...v, status: "superseded" as const };
              return v;
            }),
          };
        });

        const invoices = state.invoices.map((inv) =>
          inv.status === "draft" && inv.approvalIds.includes(id)
            ? {
                ...inv,
                status: "due" as const,
                why: `Agreed on the record. ${inr(inv.amount)} is now due, and it stays separate from the original fee.`,
              }
            : inv,
        );

        const image = requestImage(req, state.drawings, optionId);
        const decisions = settleDecision(
          state.decisions,
          id,
          {
            body: outcome,
            status: "approved",
            actor: client,
            actorRole: "client",
            source: "approval_request",
            createdAt: now,
          },
          {
            id: uid("dec"),
            projectId: req.projectId,
            phaseId: req.phaseId,
            title: option ? `${req.title} — ${option.label}` : req.title,
            body: outcome,
            status: "approved",
            actor: client,
            actorRole: "client",
            source: "approval_request",
            createdAt: now,
            image,
            drawingId: req.drawingId,
            requestId: id,
          },
        );

        set({ requests, drawings, invoices, decisions });
      },
      requestChange: (id, note) => {
        const state = get();
        const req = state.requests.find((r) => r.id === id);
        if (!req || req.status === "approved") return;
        const project = state.projects.find((p) => p.id === req.projectId);
        if (!project) return;
        const now = new Date().toISOString();
        const trimmed = note.trim();
        const requests = state.requests.map((r) =>
          r.id === id
            ? { ...r, status: "change_requested" as const, changeNote: trimmed, decidedAt: now, decidedBy: project.clientName }
            : r,
        );
        const image = requestImage(req, state.drawings);
        const decisions = settleDecision(
          state.decisions,
          id,
          {
            body: trimmed,
            status: "change_requested",
            actor: project.clientName,
            actorRole: "client",
            source: "approval_request",
            createdAt: now,
          },
          {
            id: uid("dec"),
            projectId: req.projectId,
            phaseId: req.phaseId,
            title: req.title,
            body: trimmed,
            status: "change_requested",
            actor: project.clientName,
            actorRole: "client",
            source: "approval_request",
            createdAt: now,
            image,
            drawingId: req.drawingId,
            requestId: id,
          },
        );
        set({ requests, decisions });
      },
      addComment: (id, comment) => {
        const state = get();
        const req = state.requests.find((r) => r.id === id);
        if (!req) return;
        const project = state.projects.find((p) => p.id === req.projectId);
        if (!project) return;
        const now = new Date().toISOString();
        const trimmed = comment.trim();
        const decision: Decision = {
          id: uid("dec"),
          projectId: req.projectId,
          phaseId: req.phaseId,
          title: `Comment on ${req.title}`,
          body: trimmed,
          status: "noted",
          actor: project.clientName,
          actorRole: "client",
          source: "approval_request",
          createdAt: now,
          image: requestImage(req, state.drawings),
          drawingId: req.drawingId,
          requestId: id,
        };
        set({
          requests: state.requests.map((r) => (r.id === id ? { ...r, comment: trimmed } : r)),
          decisions: [decision, ...state.decisions],
        });
      },
      addWhatsApp: ({ projectId, phaseId, message, actor, actorRole }) => {
        const trimmed = message.trim();
        const first = trimmed.split("\n")[0]?.trim() ?? "Note from WhatsApp";
        const title = first.length > 88 ? `${first.slice(0, 85)}…` : first;
        const decision: Decision = {
          id: uid("dec"),
          projectId,
          phaseId,
          title,
          body: trimmed,
          status: "noted",
          actor: actor.trim() || "Client",
          actorRole,
          source: "whatsapp",
          createdAt: new Date().toISOString(),
        };
        set({ decisions: [decision, ...get().decisions] });
      },
      createRequest: (input) => {
        const state = get();
        if (input.versionId) {
          const existing = state.requests.find(
            (r) => r.versionId === input.versionId && r.status === "pending",
          );
          if (existing) return existing.id;
        }
        const project = state.projects.find((p) => p.id === input.projectId);
        if (!project) return "";
        const id = uid("req");
        const now = new Date().toISOString();
        const drawing = state.drawings.find((d) => d.id === input.drawingId);
        const version = drawing?.versions.find((v) => v.id === input.versionId);
        const image = input.image ?? version?.image;
        const req: ApprovalRequest = {
          id,
          projectId: input.projectId,
          phaseId: input.phaseId,
          drawingId: input.drawingId,
          versionId: input.versionId,
          title: input.title.trim(),
          kind: input.kind,
          prompt: input.prompt.trim(),
          image,
          status: "pending",
          createdAt: now,
          outOfScope: input.kind === "change" ? input.outOfScope !== false : undefined,
          feeImpact: input.kind === "change" ? input.feeImpact : undefined,
          timeImpact: input.kind === "change" ? input.timeImpact?.trim() : undefined,
        };
        const decision: Decision = {
          id: uid("dec"),
          projectId: input.projectId,
          phaseId: input.phaseId,
          title: req.title,
          body:
            input.kind === "change" && input.feeImpact
              ? `${req.prompt} Fee ${inr(input.feeImpact)}${req.timeImpact ? `. ${req.timeImpact}` : ""}`
              : req.prompt,
          status: "pending",
          actor: project.architect,
          actorRole: "architect",
          source: "approval_request",
          createdAt: now,
          image,
          drawingId: input.drawingId,
          requestId: id,
        };
        const drawings = state.drawings.map((d) => {
          if (d.id !== input.drawingId) return d;
          return {
            ...d,
            versions: d.versions.map((v) =>
              v.id === input.versionId && v.status !== "latest_approved"
                ? { ...v, status: "pending" as const }
                : v,
            ),
          };
        });
        const invoices = [...state.invoices];
        if (input.kind === "change" && input.feeImpact && input.feeImpact > 0) {
          const n = invoices.filter((inv) => inv.projectId === input.projectId).length + 1;
          const invoice: Invoice = {
            id: uid("inv"),
            projectId: input.projectId,
            phaseId: input.phaseId,
            number: `INV-${String(n).padStart(3, "0")}`,
            title: `Variation · ${req.title}`,
            amount: input.feeImpact,
            issuedAt: now,
            status: "draft",
            why: `This stays a draft until ${project.clientName} agrees. It is not part of the original fee.`,
            approvalIds: [id],
          };
          invoices.unshift(invoice);
        }
        set({
          requests: [req, ...state.requests],
          decisions: [decision, ...state.decisions],
          drawings,
          invoices,
        });
        return id;
      },
      reset: () => set(fresh()),
    }),
    {
      name: "ledger-mvp-v1",
      skipHydration: true,
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        projects: state.projects,
        phases: state.phases,
        drawings: state.drawings,
        requests: state.requests,
        decisions: state.decisions,
        invoices: state.invoices,
      }),
    },
  ),
);
