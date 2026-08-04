import { ArrowRight, Shield, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
const pillars = [
  {
    icon: Zap,
    title: "QR Code System",
    desc: "Create dynamic QR codes for any location instantly to start collecting contactless feedback.",
  },
  {
    icon: Shield,
    title: "Review Automation",
    desc: "Automate your feedback loop and boost your Google Maps ranking with verified reviews.",
  },
  {
    icon: Star,
    title: "AI Reputation",
    desc: "Our AI helps users craft detailed reviews while you manage everything from a smart dashboard.",
  },
];

export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-12 text-center lg:px-8">
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
        <Sparkles className="h-4 w-4" />
        <span>AI-Powered Review Management for 2026</span>
      </div>

      <h1 className="text-5xl font-extrabold tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
        The Smartest Way to <br className="hidden sm:block" /> Collect &{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          Manage Reviews.
        </span>
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
        Boost your reputation with QReview. Use AI-powered QR code feedback
        systems to collect reviews, automate smart replies, and analyze customer
        sentiment in real-time.
      </p>

      <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
        <Link
          href="/auth"
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-lg font-bold text-background transition-all duration-300 hover:-translate-y-1 sm:w-auto"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          Start Free Trial
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center rounded-full border border-border bg-card/60 px-8 py-4 text-lg font-bold text-muted-foreground backdrop-blur-md transition-all duration-300 hover:text-foreground sm:w-auto"
        >
          View Demo Dashboard{" "}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
      </div>

      <div
        id="how-it-works"
        className="relative mt-28 scroll-mt-28 overflow-hidden rounded-[2.5rem] border border-zinc-600 bg-card/40 p-2 shadow-2xl backdrop-blur-xl lg:mt-36"
      >
        <div className="rounded-[2rem] bg-card/80 p-8 shadow-inner sm:p-12">
          <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-3 lg:gap-12">
            {pillars.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-zinc-600 bg-foreground/[0.04] p-8 transition-all duration-500 hover:border-primary/30"
              >
                <div
                  className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ backgroundImage: "var(--gradient-brand)" }}
                />
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-600 bg-surface-elevated text-primary transition-all duration-500 group-hover:scale-110">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
