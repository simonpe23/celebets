import Link from "next/link";
import ConnectAccounts from "@/components/ConnectAccounts";
import TabBar from "@/components/TabBar";
import {
  COLUMN,
  PAGE,
  PAGE_TITLE,
} from "@/lib/ui";

// Connected accounts, reached from Settings (and later from the Track
// tile once syncing exists). Same shell as Settings: back arrow,
// title, the tab bar with Track lit because that is where you came
// from.
export default function ConnectPage() {
  return (
    <main className={PAGE}>
      <div className={COLUMN}>
        <header className="flex items-center gap-3">
          <Link
            href="/settings"
            aria-label="Back to Settings"
            className="text-neutral-600 dark:text-neutral-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className={PAGE_TITLE}>
            Connected accounts
          </h1>
        </header>

        <ConnectAccounts />
      </div>
      <TabBar activeHref="/app" />
    </main>
  );
}
