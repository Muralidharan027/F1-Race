"use client";

import { motion } from "framer-motion";

interface NavbarProps {
  scrollProgress: number;
}

export default function Navbar({ scrollProgress }: NavbarProps) {
  const isScrolled = scrollProgress > 0.05;

  const navLinks = [
    { name: "Overview", href: "#overview" },
    { name: "Specifications", href: "#specs" },
    { name: "Aerodynamics", href: "#aero" },
    { name: "Digital Canvas", href: "#canvas" },
  ];

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        padding: "16px 32px",
        margin: "24px auto",
        position: "fixed",
        top: 0,
        left: "50%",
        width: "calc(100% - 48px)",
        maxWidth: "1200px",
        zIndex: 40,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      className="hud-panel ease-premium"
    >
      {/* Brand Logo - Outline to Filled Morph */}
      <a
        href="#"
        style={{ gap: "12px" }}
        className="flex items-center group pointer-events-auto"
      >
        <svg
          width="40"
          height="24"
          viewBox="0 0 40 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-700 ease-in-out"
        >
          {/* Main RS-inspired shape */}
          <path
            d="M2 22L14 2H22C26.4 2 30 5.6 30 10C30 13.5 27.8 16.5 24.6 17.5L34 22H27.5L19.2 17H14V22H2ZM14 12.5H22C23.4 12.5 24.5 11.4 24.5 10C24.5 8.6 23.4 7.5 22 7.5H14V12.5Z"
            stroke="var(--accent-gold)"
            strokeWidth="1.5"
            className="transition-all duration-700 ease-in-out"
            style={{
              fill: isScrolled ? "var(--accent-gold)" : "rgba(252,209,22,0)",
              fillOpacity: isScrolled ? 1 : 0,
            }}
          />
        </svg>
        <span
          className="font-hud text-xs tracking-[0.3em] uppercase transition-all duration-500 font-black text-white"
          style={{
            letterSpacing: isScrolled ? "0.4em" : "0.3em",
          }}
        >
          RS20
        </span>
      </a>

      {/* Nav Navigation Links */}
      <div
        style={{ gap: "32px" }}
        className="hidden md:flex items-center pointer-events-auto"
      >
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="relative font-body text-[11px] font-light tracking-[0.2em] uppercase text-white/80 hover:text-white transition-colors duration-300 py-1"
            style={{ textDecoration: "none" }}
          >
            {link.name}
            {/* Animated Hover Underline */}
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-var(--accent-gold) transition-all duration-300 ease-out" />
          </a>
        ))}
      </div>

      {/* Call to action (Right nav corner) */}
      <div className="pointer-events-auto">
        <button
          className="px-5 py-1.5 border border-white/10 hover:border-var(--accent-gold) bg-white/5 hover:bg-var(--accent-gold) hover:text-black font-hud text-[9px] font-bold tracking-[0.25em] uppercase rounded-full transition-all duration-500 ease-premium shadow-md shadow-black/30"
          style={{
            borderColor: isScrolled ? "rgba(252,209,22,0.3)" : "rgba(255,255,255,0.1)",
          }}
        >
          INQUIRE
        </button>
      </div>

      {/* Embedded CSS for hover underlines because inline classes are cleaner */}
      <style jsx global>{`
        a:hover > span {
          width: 100% !important;
          background-color: var(--accent-gold) !important;
        }
      `}</style>
    </motion.nav>
  );
}
