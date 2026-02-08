import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Orbit, BookOpen, Upload, Hexagon } from "lucide-react";

const navItems = [
  { to: "/", label: "The Orbit", icon: Orbit },
  { to: "/truth-ledger", label: "Truth Ledger", icon: BookOpen },
  { to: "/inbox", label: "Inbox / Upload", icon: Upload },
];

export function AppHeader() {
  return (
    <header className="glass-panel border-b border-border/50 px-6 py-3 flex items-center justify-between relative z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Hexagon className="w-7 h-7 text-primary" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-[0.2em] text-foreground text-glow-cyan">
            KINETIC
          </h1>
          <p className="text-[9px] font-mono text-muted-foreground tracking-wider">
            ORGANIZATIONAL PHYSICS ENGINE
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>
    </header>
  );
}
