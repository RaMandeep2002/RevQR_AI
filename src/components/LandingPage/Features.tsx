import { ArrowRight, Sparkles, Zap, Brain, QrCode, MessageSquare, BarChart3, Clock, Users, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: Brain,
    title: "Instant Sentiment Analysis",
    desc: "Understand customer satisfaction levels instantly with AI-powered sentiment tracking and deep analytics.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-purple-500",
    stat: "98% Accuracy",
    statIcon: BarChart3,
    delay: 0
  },
  {
    icon: MessageSquare,
    title: "Automated Smart Replies",
    desc: "Use AI to automate business review replies, saving time while maintaining a personal touch with every customer.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
    stat: "10x Faster",
    statIcon: Clock,
    delay: 0.1
  },
  {
    icon: QrCode,
    title: "Contactless Feedback",
    desc: "Safe, fast, and modern feedback collection via beautifully customized QR codes tailored for your brand.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    stat: "95% Response Rate",
    statIcon: Users,
    delay: 0.2
  },
];

const additionalFeatures = [
  {
    icon: Zap,
    title: "Real-time Analytics",
    desc: "Track review performance and customer sentiment with live dashboards.",
    gradient: "from-yellow-500/20 to-orange-500/20",
    iconColor: "text-yellow-500",
  },
  {
    icon: Shield,
    title: "Review Verification",
    desc: "Ensure authenticity with AI-powered review verification and fraud detection.",
    gradient: "from-red-500/20 to-pink-500/20",
    iconColor: "text-red-500",
  },
  {
    icon: Sparkles,
    title: "AI Review Generation",
    desc: "Generate detailed, personalized review drafts with AI assistance.",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-500",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className="relative mx-auto max-w-7xl scroll-mt-28 px-6 py-28 lg:px-8 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-float-slow rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] animate-float-slower rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 blur-3xl" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/20 animate-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header with Animation */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md animate-float">
          <Sparkles className="h-3 w-3 animate-sparkle" />
          <span>AI-Driven Insights</span>
        </div>
        
        <h2 className="mt-4 text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl animate-fade-in-up">
          Everything you need to{" "}
          <span
            className="bg-clip-text text-transparent animate-gradient-x"
            style={{ 
              backgroundImage: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)",
              backgroundSize: "200% 200%",
            }}
          >
            grow.
          </span>
        </h2>
        
        <p className="mt-4 text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Powerful AI tools to collect, manage, and analyze customer reviews at scale.
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className="feature-card group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl opacity-0"
            style={{ 
              animationDelay: `${index * 0.15 + 0.3}s`,
              transitionDelay: `${feature.delay}s`
            }}
          >
            {/* Animated Gradient Border */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
              style={{ 
                background: `linear-gradient(135deg, ${feature.gradient})`,
                padding: '1px',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
              }}
            />

            {/* Animated Glow Effect */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />

            {/* Icon with Animation */}
            <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-gradient-to-br ${feature.gradient} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
              <feature.icon className={`h-7 w-7 ${feature.iconColor} transition-all duration-500 group-hover:scale-110`} />
              
              {/* Pulsing Ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping-slow opacity-0 group-hover:opacity-100" />
            </div>

            <h3 className="relative text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
              {feature.title}
            </h3>
            
            <p className="relative mt-4 flex-1 text-sm font-medium leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {feature.desc}
            </p>

            {/* Feature Stat */}
            <div className="relative mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <feature.statIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{feature.stat}</span>
            </div>

            {/* Animated Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-primary to-primary/50 transition-all duration-1000 group-hover:w-full" />
            </div>
          </article>
        ))}
      </div>

      {/* Additional Features */}
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
          <span className="text-sm font-medium text-muted-foreground">Plus More Features</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {additionalFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg feature-card opacity-0"
              style={{ animationDelay: `${index * 0.1 + 0.8}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} transition-all duration-500 group-hover:scale-110`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 text-center border border-primary/20 relative overflow-hidden group">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-foreground">
            Ready to transform your review management?
          </h3>
          <p className="mt-2 text-muted-foreground">
            Join thousands of businesses already using QReview
          </p>
          <Link
            href="/auth"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3 font-semibold text-background transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.15); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.5; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 4s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-particle {
          animation: particle 10s ease-in-out infinite;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .feature-card {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .feature-card:nth-child(1) { animation-delay: 0.3s; }
        .feature-card:nth-child(2) { animation-delay: 0.45s; }
        .feature-card:nth-child(3) { animation-delay: 0.6s; }
        .feature-card:nth-child(4) { animation-delay: 0.75s; }
        .feature-card:nth-child(5) { animation-delay: 0.9s; }
        .feature-card:nth-child(6) { animation-delay: 1.05s; }
      `}</style>
    </section>
  );
}