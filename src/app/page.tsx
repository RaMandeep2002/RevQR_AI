import Link from "next/link";
import { QrCode, Star, ArrowRight, Shield, Zap, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/20 glass px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-brand-700">
            <QrCode className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">RevQR AI</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">How it Works</a>
            <Link href="/auth" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-32 pb-20">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-200 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Review System is Live!</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
            Transform Feedback with <br />
            <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">AI & QR Codes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            The easiest way to collect, manage, and boost your business reviews. 
            Generate custom QR codes and use AI to help your customers write perfect reviews in seconds.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth" className="rounded-full bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold leading-6 text-slate-900 hover:text-brand-600 transition-colors">
              View Demo Dashboard <span aria-hidden="true">→</span>
            </Link>
          </div>
          
          {/* Hero Image / Mockup Placeholder */}
          <div className="mt-16 rounded-2xl border border-white/40 bg-white/20 p-2 shadow-2xl backdrop-blur-sm lg:mt-24 overflow-hidden">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  { icon: Zap, title: "Instant QR Generation", desc: "Create dynamic QR codes for any business location instantly." },
                  { icon: Shield, title: "Verified Reviews", desc: "Ensure your feedback comes from real customers at your physical store." },
                  { icon: Star, title: "AI Assistance", desc: "Gemini AI helps users craft helpful, detailed reviews effortlessly." }
                ].map((feature, i) => (
                  <div key={i} className="group p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-brand-600 uppercase tracking-wider">Features</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to grow your reputation</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {[
                  { title: "Business Registration", desc: "Onboard your business in minutes. Manage multiple locations from a single, intuitive dashboard." },
                  { title: "Smart QR Codes", desc: "Download and print professional QR codes. Track scans and conversion rates in real-time." },
                  { title: "Sentiment Analysis", desc: "Understand customer satisfaction levels with AI-powered sentiment tracking and analytics." }
                ].map((feature, i) => (
                  <div key={i} className="flex flex-col border-l-4 border-brand-500 pl-6 py-2 bg-white/50 hover:bg-white transition-colors rounded-r-xl shadow-sm">
                    <dt className="text-lg font-bold leading-7 text-slate-900">{feature.title}</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">{feature.desc}</p>
                      <p className="mt-6">
                        <a href="#" className="text-sm font-semibold leading-6 text-brand-600 hover:text-brand-700">Learn more <span aria-hidden="true">→</span></a>
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative isolate overflow-hidden bg-slate-900 py-16 sm:py-24 lg:py-32 rounded-[3rem] mx-6">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Boost your business today.</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Join hundreds of businesses using RevQR AI to streamline their customer feedback loop and increase their star ratings.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/auth" className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors">
                  Get Started for Free
                </Link>
                <a href="#" className="text-sm font-semibold leading-6 text-white hover:text-brand-400 transition-colors">
                  Contact Sales <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -top-24 left-1/2 -z-10 -translate-x-1/2 blur-3xl" aria-hidden="true">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#25a05d] to-[#10b981] opacity-30" />
          </div>
        </section>
      </main>

      <footer className="bg-white/50 border-t border-slate-200 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-brand-700 opacity-80">
            <QrCode className="h-5 w-5" />
            <span className="text-lg font-bold">RevQR AI</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 RevQR AI System. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
