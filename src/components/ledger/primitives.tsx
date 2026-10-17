import { useState, type Ref } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { clsx } from "clsx";
import { dotClass, statusLabel } from "@/lib/ledger/format";

export function cx(...parts: Array<string | false | null | undefined>) {
  return clsx(parts);
}

export function StatusMark({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink">
      <span className={cx("size-1.5 shrink-0 rounded-full", dotClass(status))} aria-hidden />
      {statusLabel(status)}
    </span>
  );
}

export function Photo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={cx("bg-surface object-cover ring-1 ring-hairline", className)} />;
}

export function Field({
  label,
  children,
  error,
  hint,
  id,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  id?: string;
}) {
  const errorId = id && error ? `${id}-error` : undefined;
  const hintId = id && hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label className="block" htmlFor={id}>
        <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
        {children}
      </label>
      {hint && !error ? (
        <p id={hintId} className="mt-2 text-sm text-body">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const fieldClass =
  "h-14 w-full rounded-sm border border-hairline bg-canvas px-3 text-base text-ink outline-none placeholder:text-muted-soft focus:border-ink aria-[invalid=true]:border-error";

export const areaClass =
  "min-h-32 w-full rounded-sm border border-hairline bg-canvas px-3 py-3 text-base text-ink outline-none placeholder:text-muted-soft focus:border-ink aria-[invalid=true]:border-error";

export function PrimaryButton({
  children,
  type = "button",
  pill = false,
  disabled,
  onClick,
  className,
  buttonRef,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  pill?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex h-12 items-center justify-center px-6 text-base font-medium text-on-primary",
        "bg-primary transition-[background-color,transform] duration-[120ms] ease-[var(--ease-instant)] hover:bg-primary-active active:scale-[0.98] disabled:bg-primary-soft disabled:active:scale-100",
        pill ? "w-full rounded-full" : "rounded-sm",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = "button",
  className,
  disabled,
  expanded,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  expanded?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-expanded={expanded}
      className={cx(
        "inline-flex h-12 items-center justify-center rounded-sm border border-hairline bg-canvas px-5 text-base text-ink hover:bg-surface disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function QuietButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex h-12 items-center justify-center rounded-sm border border-hairline bg-canvas px-5 text-base text-ink hover:bg-surface"
    >
      {children}
    </button>
  );
}

export function SkipLink() {
  return (
    <a
      className="skip-link"
      href="#content"
      onClick={(event) => {
        const target = document.getElementById("content");
        if (!target) return;
        event.preventDefault();
        target.focus();
        target.scrollIntoView();
      }}
    >
      Skip to content
    </a>
  );
}

export function CopyLink({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "copied" | "shown">("idle");
  const [url, setUrl] = useState("");

  const resolve = () => {
    const href = router.buildLocation({
      to: "/approve/$requestId",
      params: { requestId },
    }).href;
    return new URL(href, window.location.origin).toString();
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={async () => {
          const next = resolve();
          setUrl(next);
          try {
            await navigator.clipboard.writeText(next);
            setState("copied");
          } catch {
            setState("shown");
          }
        }}
        className="inline-flex h-12 items-center justify-center rounded-sm border border-hairline bg-canvas px-4 text-sm font-medium text-ink hover:bg-surface"
      >
        {state === "copied" ? "Link copied" : "Copy link"}
      </button>
      {state === "shown" ? (
        <input
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="h-12 w-full min-w-0 rounded-sm border border-hairline px-3 text-sm text-ink"
          aria-label="Approval link"
        />
      ) : null}
    </div>
  );
}

export function OpenClient({ requestId, label = "Open client view" }: { requestId: string; label?: string }) {
  return (
    <Link
      to="/approve/$requestId"
      params={{ requestId }}
      className="inline-flex h-12 items-center text-sm font-medium text-ink underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  );
}
