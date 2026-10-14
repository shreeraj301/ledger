export type PhaseStatus = "completed" | "current" | "upcoming";
export type VersionStatus = "latest_approved" | "pending" | "superseded" | "draft";
export type RequestKind = "drawing" | "options" | "change";
export type RequestStatus = "pending" | "approved" | "change_requested";
export type DecisionStatus = "approved" | "pending" | "change_requested" | "noted";
export type DecisionSource = "whatsapp" | "approval_request" | "meeting" | "note";
export type InvoiceStatus = "paid" | "due" | "draft";
export type ActorRole = "architect" | "client";

export interface Project {
  id: string;
  name: string;
  shortName: string;
  clientName: string;
  household: string;
  location: string;
  typology: string;
  architect: string;
  firm: string;
  cover: string;
  clientToken?: string;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  order: number;
  status: PhaseStatus;
  clientRole: string;
  span: string;
}

export interface DrawingVersion {
  id: string;
  label: string;
  image: string;
  note: string;
  uploadedAt: string;
  status: VersionStatus;
}

export interface Drawing {
  id: string;
  projectId: string;
  phaseId: string;
  title: string;
  sheet: string;
  versions: DrawingVersion[];
}

export interface RequestOption {
  id: string;
  label: string;
  image: string;
  note: string;
}

export interface ApprovalRequest {
  id: string;
  projectId: string;
  phaseId: string;
  drawingId?: string;
  versionId?: string;
  title: string;
  kind: RequestKind;
  prompt: string;
  image?: string;
  options?: RequestOption[];
  selectedOptionId?: string;
  status: RequestStatus;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  comment?: string;
  changeNote?: string;
  outOfScope?: boolean;
  feeImpact?: number;
  timeImpact?: string;
}

export interface Decision {
  id: string;
  projectId: string;
  phaseId: string;
  title: string;
  body: string;
  status: DecisionStatus;
  actor: string;
  actorRole: ActorRole;
  source: DecisionSource;
  createdAt: string;
  sentAt?: string;
  image?: string;
  drawingId?: string;
  requestId?: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  phaseId: string;
  number: string;
  title: string;
  amount: number;
  issuedAt: string;
  status: InvoiceStatus;
  why: string;
  approvalIds: string[];
}

export interface LedgerData {
  activeProjectId: string;
  projects: Project[];
  phases: Phase[];
  drawings: Drawing[];
  requests: ApprovalRequest[];
  decisions: Decision[];
  invoices: Invoice[];
}
