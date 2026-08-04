import { QrCode } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto w-full shrink-0 border-t border-border bg-surface px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <Link
          href="/"
          className="flex items-center gap-3 text-foreground/80 hover:text-foreground"
        >
          <QrCode className="h-6 w-6 text-primary" />
          <span className="text-xl font-extrabold tracking-tight">QReview</span>
        </Link>

        <p className="text-sm font-medium text-muted-foreground">
          © 2026 QReview System. All rights reserved.
        </p>

        <Link
          href="/privacy-polices"
          className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
