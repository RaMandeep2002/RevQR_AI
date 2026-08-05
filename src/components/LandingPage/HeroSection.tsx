import { ArrowRight, Shield, Sparkles, Star, Zap, ChevronDown, Globe, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const pillars = [
  {
    icon: Zap,
    title: "QR Code System",
    desc: "Create dynamic QR codes for any location instantly to start collecting contactless feedback.",
    gradient: "from-yellow-500/20 to-orange-500/20",
    iconColor: "text-yellow-500",
    delay: 0
  },
  {
    icon: Shield,
    title: "Review Automation",
    desc: "Automate your feedback loop and boost your Google Maps ranking with verified reviews.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
    delay: 0.1
  },
  {
    icon: Star,
    title: "AI Reputation",
    desc: "Our AI helps users craft detailed reviews while you manage everything from a smart dashboard.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
    delay: 0.2
  },
];

const stats = [
  { icon: Users, value: "10K+", label: "Active Businesses" },
  { icon: Globe, value: "50K+", label: "QR Codes Generated" },
  { icon: TrendingUp, value: "4.8★", label: "Average Rating" },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      containerRef.current.style.setProperty('--mouse-x', `${x * 20}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y * 20}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative mx-auto max-w-7xl px-6 pt-12 mt-16 text-center lg:px-8 overflow-hidden"
      style={{
        '--gradient-brand': 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
      } as React.CSSProperties}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 animate-float-slow rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 animate-float-slower rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-3xl" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      </div>

      {/* Animated Badge */}
      <div 
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md animate-float"
        style={{ animationDelay: '0.2s' }}
      >
        <Sparkles className="h-4 w-4 animate-sparkle" />
        <span>AI-Powered Review Management for 2026</span>
      </div>

      {/* Main Heading with Typewriter Effect */}
      <h1 className="text-5xl font-extrabold tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
        The Smartest Way to <br className="hidden sm:block" /> Collect &{" "}
        <span
          className="relative inline-block bg-clip-text text-transparent animate-gradient-x"
          style={{ 
            backgroundImage: "var(--gradient-brand)",
            backgroundSize: "200% 200%",
          }}
        >
          Manage Reviews.
          <span className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse-width" />
        </span>
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl animate-fade-in-up">
        Boost your reputation with QReview. Use AI-powered QR code feedback
        systems to collect reviews, automate smart replies, and analyze customer
        sentiment in real-time.
      </p>

      {/* Animated Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className="flex flex-col items-center p-4 rounded-2xl border border-zinc-600/30 bg-card/40 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
          >
            <stat.icon className="h-5 w-5 text-primary mb-1" />
            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Buttons with Hover Effects */}
      <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
        <Link
          href="/auth"
          className="group relative flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-background transition-all duration-300 hover:-translate-y-1 sm:w-auto overflow-hidden"
          style={{ 
            backgroundImage: "var(--gradient-brand)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Start Free Trial
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110" />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="absolute inset-0 animate-shimmer" style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transform: 'skewX(-20deg)',
            animation: 'shimmer 2s infinite',
          }} />
        </Link>
        <Link
          href="/dashboard"
          className="group flex w-full items-center justify-center rounded-full border border-border bg-card/60 px-8 py-4 text-lg font-bold text-muted-foreground backdrop-blur-md transition-all duration-300 hover:text-foreground hover:border-primary/50 hover:-translate-y-1 sm:w-auto relative overflow-hidden"
        >
          <span className="relative z-10">View Demo Dashboard</span>
          <span aria-hidden="true" className="ml-2 transition-transform duration-300 group-hover:translate-x-2">→</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </div>

      {/* Animated Scroll Indicator */}
      <div className="mt-16 flex justify-center animate-bounce-slow">
        <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
      </div>

      {/* Features Cards with Staggered Animation */}
      <div
        id="how-it-works"
        className="relative mt-28 scroll-mt-28 overflow-hidden rounded-[2.5rem] border border-zinc-600/30 bg-card/40 p-2 shadow-2xl backdrop-blur-xl lg:mt-20"
      >
        <div className="rounded-[2rem] bg-card/80 p-8 shadow-inner sm:p-12">
          <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-3 lg:gap-12">
            {pillars.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-zinc-600/30 bg-foreground/[0.04] p-8 transition-all duration-500 hover:border-primary/30 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15 + 0.5}s` }}
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
                
                {/* Animated Top Bar */}
                <div
                  className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ backgroundImage: "var(--gradient-brand)" }}
                />
                
                {/* Icon with Rotating Animation */}
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-600/30 bg-gradient-to-br ${feature.gradient} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className={`h-7 w-7 ${feature.iconColor} transition-all duration-500 group-hover:scale-110`} />
                </div>
                
                <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  {feature.desc}
                </p>

                {/* Animated Particle Effect */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />
              </div>
            ))}
          </div>
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
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
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
        
        @keyframes pulse-width {
          0% { transform: scaleX(0); opacity: 0; }
          50% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(0); opacity: 0; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(10px); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
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
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 4s ease-in-out infinite;
        }
        
        .animate-pulse-width {
          animation: pulse-width 3s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
}