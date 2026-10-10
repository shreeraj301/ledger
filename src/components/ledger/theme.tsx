import { Moon, Sun } from "lucide-react";
import { cx } from "./primitives";

const LIGHT = "#f6f3ee";
const DARK = "#12110f";

export const THEME_BOOT = `(function(){try{var t=localStorage.getItem("ledger-theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"${DARK}":"${LIGHT}");}catch(e){}})();`;

function paint(dark: boolean) {
  const root = document.documentElement;
  root.classList.add("theme-ready");
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  localStorage.setItem("ledger-theme", dark ? "dark" : "light");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? DARK : LIGHT);
}

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => paint(!document.documentElement.classList.contains("dark"))}
      className={cx(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-ink hover:bg-surface",
        className,
      )}
    >
      <Moon className="size-5 dark:hidden" strokeWidth={1.5} aria-hidden />
      <Sun className="hidden size-5 dark:block" strokeWidth={1.5} aria-hidden />
      <span className="sr-only dark:hidden">Switch to dark</span>
      <span className="sr-only hidden dark:inline">Switch to light</span>
    </button>
  );
}
