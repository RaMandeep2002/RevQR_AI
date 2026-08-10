"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
        <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-700" />
      </div>
    );
  }

  const themes = [
    { 
      key: "light", 
      label: "Light", 
      icon: Sun,
      className: "text-yellow-500"
    },
    { 
      key: "dark", 
      label: "Dark", 
      icon: Moon,
      className: "text-blue-400"
    },
    { 
      key: "system", 
      label: "System", 
      icon: Monitor,
      className: "text-zinc-400"
    },
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-zinc-800/50 md:flex"
        aria-label="Toggle theme"
      >
        <CurrentIcon className={`h-5 w-5 transition-all duration-300 ${currentTheme.className} group-hover:scale-110`} />
        
        {/* Tooltip */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] text-zinc-500 whitespace-nowrap">
          Theme
        </span>
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl transition-all duration-300 origin-top-right ${
          isOpen 
            ? "opacity-100 scale-100 pointer-events-auto" 
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="p-2">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.key;
            
            return (
              <button
                key={t.key}
                onClick={() => {
                  setTheme(t.key);
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 transition-all duration-300 ${
                  isActive ? t.className : "group-hover:scale-110"
                }`} />
                <span className="flex-1 text-left font-medium">{t.label}</span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Click Outside Handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}