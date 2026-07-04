"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface CallToActionProps {
  scrollProgress: number; // 0 to 1
}

export default function CallToAction({ scrollProgress }: CallToActionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Visible during final CTA phase (0.84 to 1.0)
  const isVisible = scrollProgress >= 0.82;
  const opacity = isVisible ? Math.min((scrollProgress - 0.82) / 0.08, 1) : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: isVisible ? "auto" : "none",
        opacity: opacity,
        transition: "opacity 0.5s ease-out",
        background: "transparent",
      }}
      className="select-none text-center px-4"
    >
      {/* Title with Masked Reveal & Variable Font Weight */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl flex flex-col items-center space-y-4"
      >
        <span className="font-hud text-[10px] text-[#fcd116] tracking-[0.4em] font-black uppercase glow-text">
          CHASSIS CONCEPT RS20
        </span>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none"
        >
          EXPERIENCE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#fcd116] to-[#ffe033] glow-text-bright">
            PERFORMANCE.
          </span>
        </h1>
        <p className="font-body text-xs md:text-sm text-gray-400 font-light tracking-wide max-w-md leading-relaxed mt-4">
          Uncompromised engineering. Fully active aerodynamics. A new dimension of motorsport built for Awwwards interaction.
        </p>
      </motion.div>

      {/* Pulsing Glowing CTA Button with Expanding Light Rings */}
      <div
        className="relative mt-12 flex items-center justify-center pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glowing Expanding Rings (SVG) on Hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-48 h-48 overflow-visible opacity-50">
            {/* Ring 1 */}
            <circle
              cx="96"
              cy="96"
              r={isHovered ? "75" : "55"}
              fill="none"
              stroke="#fcd116"
              strokeWidth="0.5"
              className="transition-all duration-[1.2s] ease-out"
              style={{
                opacity: isHovered ? 0 : 0.15,
                transformOrigin: "center",
              }}
            />
            {/* Ring 2 */}
            <circle
              cx="96"
              cy="96"
              r={isHovered ? "95" : "55"}
              fill="none"
              stroke="#fcd116"
              strokeWidth="1"
              strokeDasharray="4,4"
              className="transition-all duration-[1.4s] ease-out"
              style={{
                opacity: isHovered ? 0.3 : 0,
                transformOrigin: "center",
              }}
            />
            {/* Ring 3 */}
            <circle
              cx="96"
              cy="96"
              r={isHovered ? "115" : "55"}
              fill="none"
              stroke="#fcd116"
              strokeWidth="0.5"
              className="transition-all duration-[1.8s] ease-out"
              style={{
                opacity: isHovered ? 0.15 : 0,
                transformOrigin: "center",
              }}
            />
          </svg>
        </div>

        {/* Pulsing CTA Button */}
        <button
          className="relative z-10 px-8 py-3.5 bg-gradient-to-r from-[#fcd116] to-[#ffe033] hover:from-white hover:to-white text-black font-hud font-black text-[11px] tracking-[0.25em] uppercase transition-all duration-500 rounded-xs shadow-2xl cursor-pointer hover:scale-105"
          style={{
            animation: isHovered ? "none" : "glowPulse 2s infinite ease-in-out",
          }}
        >
          REQUEST DRIVE ACCESS
        </button>
      </div>

      {/* Fine technical footprint info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-12 font-mono text-[8px] text-gray-500 uppercase tracking-widest"
      >
        © 2026 RS20 FORMULA LABS // ALL RIGHTS RESERVED
      </motion.div>
    </div>
  );
}
