import type { DecisionSource, RequestKind } from "./types";

const day = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const when = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatDay(iso: string) {
  return day.format(new Date(iso));
}

export function formatWhen(iso: string) {
  return when.format(new Date(iso));
}

export function inr(amount: number) {
  return rupee.format(amount);
}

export function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

export function sourceLabel(source: DecisionSource) {
  switch (source) {
    case "whatsapp":
      return "WhatsApp";
    case "approval_request":
      return "Approval request";
    case "meeting":
      return "Meeting";
    case "note":
      return "Note";
  }
}

export function statusLabel(status: string) {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending":
      return "Waiting";
    case "change_requested":
      return "Change requested";
    case "noted":
      return "Noted";
    case "paid":
      return "Paid";
    case "due":
      return "Due";
    case "draft":
      return "Draft";
    case "completed":
      return "Done";
    case "current":
      return "Current";
    case "upcoming":
      return "Upcoming";
    case "latest_approved":
      return "Latest approved";
    case "superseded":
      return "Superseded";
    default:
      return status;
  }
}

export function kindLabel(kind: RequestKind, outOfScope?: boolean) {
  if (kind === "change") return outOfScope ? "Change · outside scope" : "Change";
  if (kind === "options") return "A choice";
  return "Drawing";
}

export function dotClass(status: string) {
  switch (status) {
    case "pending":
    case "due":
    case "current":
      return "bg-primary";
    case "change_requested":
      return "bg-error";
    case "upcoming":
      return "bg-canvas ring-1 ring-hairline";
    case "noted":
    case "draft":
    case "superseded":
      return "bg-muted-soft";
    default:
      return "bg-ink";
  }
}
