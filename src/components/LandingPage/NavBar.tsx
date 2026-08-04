import { ArrowRight, QrCode } from "lucide-react";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/70 backdrop-blur-2xl px-6 py-4 transition-all duration-300">
      <div className="container mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 text-zinc-100 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 text-emerald-400 shadow-lg group-hover:shadow-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 group-hover:to-zinc-400 transition-colors">
              QReview
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          <Link
            href="#features"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full"
          >
            How it Works
          </Link>
          <Link
            href="/auth"
            className="relative inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-zinc-950 shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden group"
          >
            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-100 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
