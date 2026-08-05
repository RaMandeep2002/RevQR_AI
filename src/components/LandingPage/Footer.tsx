import { QrCode, Heart, Github, Twitter, Linkedin, Youtube, Mail, ArrowUp, Sparkles, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
    // { label: "Integrations", href: "/integrations" },
  ],
  company: [
    { label: "About", href: "/about" },
    // { label: "Blog", href: "/blog" },
    // { label: "Careers", href: "/careers" },
    // { label: "Press", href: "/press" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Documentation", href: "/docs" },
    // { label: "API Status", href: "/status" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-polices" },
    // { label: "Terms of Service", href: "/terms" },
    // { label: "Cookie Policy", href: "/cookies" },
    // { label: "GDPR", href: "/gdpr" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-auto w-full shrink-0 border-t border-border/50 bg-gradient-to-b from-surface to-background/80 px-6 py-12 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[300px] w-[300px] animate-float-slow rounded-full bg-gradient-to-r from-primary/5 to-purple-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[250px] w-[250px] animate-float-slower rounded-full bg-gradient-to-l from-blue-500/5 to-cyan-500/5 blur-3xl" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/10 animate-particle"
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

      <div className="relative mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 pb-12 md:grid-cols-5">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 text-foreground/80 hover:text-foreground transition-all duration-300"
            >
              <div className="relative">
                <QrCode className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute -inset-2 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                QReview
              </span>
            </Link>
            
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              AI-powered review management platform helping businesses collect, analyze, and respond to customer feedback.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="col-span-2 md:col-span-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="group relative inline-block text-sm text-muted-foreground transition-all duration-300 hover:text-foreground"
                        >
                          {link.label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 group-hover:w-full" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider with Animation */}
        <div className="relative flex items-center gap-4 py-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary/50 animate-sparkle" />
            <Shield className="h-4 w-4 text-primary/30" />
            <Star className="h-4 w-4 text-primary/30" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              © {year} QReview System. All rights reserved.
            </p>
            <span className="hidden h-4 w-px bg-border/50 md:block" />
            <Link
              href="/privacy-polices"
              className="group text-sm font-semibold text-muted-foreground transition-all duration-300 hover:text-primary"
            >
              Privacy Policy
              <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <span>Made with</span>
              <Heart className="h-3 w-3 animate-pulse text-red-500" />
              <span>by QReview Team</span>
            </div>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-500 ${
                showScrollTop
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10 pointer-events-none"
              } hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg`}
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
              <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            SSL Secure
          </span>
          <span className="hidden h-3 w-px bg-border/30 md:block" />
          <span>GDPR Compliant</span>
          <span className="hidden h-3 w-px bg-border/30 md:block" />
          <span>24/7 Support</span>
          <span className="hidden h-3 w-px bg-border/30 md:block" />
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            All Systems Operational
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.15); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.5; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle 10s ease-in-out infinite;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </footer>
  );
}