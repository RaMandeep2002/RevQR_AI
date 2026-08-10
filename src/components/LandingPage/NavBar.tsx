"use client";

import { ArrowRight, QrCode, Menu, X, Sparkles, Zap, Shield, Star, ChevronDown, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const navLinks = [
  { 
    label: "Features", 
    href: "#features",
    icon: Zap,
    description: "Explore our powerful features"
  },
  { 
    label: "How it Works", 
    href: "#how-it-works",
    icon: Sparkles,
    description: "See the magic in action"
  },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full px-6 py-4 transition-all duration-500 ${
          scrolled
            ? "border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group relative">
            <div className="flex items-center gap-3 text-zinc-100 cursor-pointer">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 border border-black/10 dark:border-white/10 text-emerald-500 dark:text-emerald-400 shadow-lg group-hover:shadow-emerald-500/30 group-hover:border-emerald-500/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <QrCode className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div className="absolute -inset-2 rounded-xl bg-emerald-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="absolute inset-0 rounded-xl border-2 border-emerald-500/30 opacity-0 group-hover:opacity-100 animate-ping-slow" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white transition-colors">
                QReview
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group relative text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-300"
                onClick={() => setActiveLink(link.label)}
              >
                <span className="relative z-10 flex items-center gap-1">
                  {link.label}
                  {link.href.startsWith("#") && (
                    <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-180" />
                  )}
                </span>
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500 ${
                    activeLink === link.label
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
                {link.description && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] text-zinc-500 whitespace-nowrap">
                    {link.description}
                  </span>
                )}
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 group"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {mounted && (
                <>
                  <Sun className="h-5 w-5 text-amber-500 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 absolute" />
                  <Moon className="h-5 w-5 text-slate-700 dark:text-slate-400 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 absolute" />
                </>
              )}
              <span className="sr-only">Toggle theme</span>
            </button>

            {/* CTA Button */}
            <Link
              href="/auth"
              className="group relative inline-flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white px-7 py-2.5 text-sm font-bold text-white dark:text-zinc-950 shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              </span>
            </Link>
          </nav>

          {/* Mobile Menu Button with Theme Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {mounted && (
                <>
                  <Sun className="h-5 w-5 text-amber-500 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 absolute" />
                  <Moon className="h-5 w-5 text-slate-700 dark:text-slate-400 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 absolute" />
                </>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 group"
              aria-label="Toggle menu"
            >
              <div className="relative h-5 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-full bg-zinc-900 dark:bg-white transition-all duration-300 ${
                    isOpen ? "rotate-45 top-2" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 h-0.5 w-full bg-zinc-900 dark:bg-white transition-all duration-300 ${
                    isOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-0.5 w-full bg-zinc-900 dark:bg-white transition-all duration-300 ${
                    isOpen ? "-rotate-45 bottom-2" : "bottom-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl transition-all duration-500 md:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`flex h-full flex-col items-center justify-center gap-8 px-6 transition-all duration-500 ${
            isOpen ? "translate-y-0" : "translate-y-10"
          }`}
        >
          {/* Mobile Logo */}
          <div className="mb-4 flex items-center gap-3">
            <QrCode className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">QReview</span>
          </div>

          {/* Mobile Links */}
          {navLinks.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={handleLinkClick}
              className={`group flex items-center gap-4 text-2xl font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all duration-300 hover:scale-105 ${
                isOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 0.1 + 0.1}s` }}
            >
              <link.icon className="h-6 w-6 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              {link.label}
              <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
            </Link>
          ))}

          {/* Mobile CTA */}
          <Link
            href="/auth"
            onClick={handleLinkClick}
            className={`group relative mt-4 inline-flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white px-8 py-3.5 text-lg font-bold text-white dark:text-zinc-950 shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden ${
              isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
            </span>
          </Link>

          {/* Social Icons */}
          <div
            className={`mt-8 flex gap-6 ${
              isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "0.5s" }}
          >
            {["Twitter", "GitHub", "LinkedIn"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all duration-300 hover:scale-110"
              >
                <span className="sr-only">{social}</span>
                <div className="h-10 w-10 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 flex items-center justify-center hover:border-emerald-500/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all duration-300">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{social[0]}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}