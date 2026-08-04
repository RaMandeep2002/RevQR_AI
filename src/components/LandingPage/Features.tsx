
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Instant Sentiment Analysis",
    desc: "Understand customer satisfaction levels instantly with AI-powered sentiment tracking and deep analytics.",
  },
  {
    title: "Automated Smart Replies",
    desc: "Use AI to automate business review replies, saving time while maintaining a personal touch with every customer.",
  },
  {
    title: "Contactless Feedback",
    desc: "Safe, fast, and modern feedback collection via beautifully customized QR codes tailored for your brand.",
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-28 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          AI-Driven Insights
        </p>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
          Everything you need to grow.
        </h2>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group flex flex-col rounded-3xl border border-border bg-card/60 p-8 backdrop-blur-md transition-all duration-500 hover:border-primary/30"
          >
            <h3 className="text-xl font-bold tracking-tight text-foreground">{feature.title}</h3>
            <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-muted-foreground">
              {feature.desc}
            </p>
            {/* <Link
              href="pricing"
              // hash="pricing"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Learn more
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link> */}
          </article>
        ))}
      </div>
    </section>
  );
}
