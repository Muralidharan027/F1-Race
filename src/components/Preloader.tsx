"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  progress: number;
  isComplete: boolean;
}

export default function Preloader({ progress, isComplete }: PreloaderProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [ignited, setIgnited] = useState(false);

  // Trigger engine ignition vibration briefly when completed
  useEffect(() => {
    if (isComplete) {
      setIgnited(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 1500); // Wait for ignition effect and fade out
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fcd116] text-[#080808] overflow-hidden ${
          ignited ? "engine-vibration" : ""
        }`}
        style={{
          background: ignited
            ? "radial-gradient(circle, #ffe033 0%, #fcd116 70%, #d4a700 100%)"
            : "#fcd116",
          transition: "background 0.5s ease-in-out",
        }}
      >
        {/* Editorial Textures */}
        <div className="grain-overlay" style={{ opacity: 0.08 }} />
        <div className="ink-texture" style={{ opacity: 0.04 }} />

        {/* Oversized Background Watermark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ fontFamily: "var(--font-display)" }}
          className="absolute font-black text-[25vw] leading-none pointer-events-none select-none select-none tracking-tighter"
        >
          RS20
        </motion.div>

        {/* Cinematic Motion Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#000" strokeWidth="0.5" strokeDasharray="5,15" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#000" strokeWidth="0.5" strokeDasharray="10,25" />
            <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#000" strokeWidth="0.5" strokeDasharray="5,15" />
            <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#000" strokeWidth="0.5" strokeDasharray="5,20" />
            <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#000" strokeWidth="0.5" strokeDasharray="5,20" />
          </svg>
        </div>

        {/* Central HUD Loading Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md p-8 border border-black/10 bg-white/10 backdrop-blur-md rounded-lg shadow-2xl relative z-10"
        >
          {/* Tech Status Header */}
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-[9px] tracking-[0.2em] font-black uppercase text-black/60 flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full mr-2 bg-black ${ignited ? "animate-ping" : "animate-pulse"}`} />
              {ignited ? "ENGINE IGNITION READY" : "BOOTSTRAPPING CORE SYSTEMS"}
            </span>
            <span className="font-mono text-[10px] tracking-wider font-bold">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Loader bar */}
          <div className="w-full h-[3px] bg-black/10 rounded-full overflow-hidden relative mb-6">
            <motion.div
              className="h-full bg-black"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />
          </div>

          {/* Spec details rolling in preloader */}
          <div className="space-y-1.5 font-mono text-[8px] text-black/50 uppercase">
            <div className="flex justify-between">
              <span>LOAD STREAM</span>
              <span className="text-black font-semibold">
                {ignited ? "COMPLETED" : "240 FRAMES // LOSSLESS"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ACTIVE SYSTEM</span>
              <span className="text-black font-semibold">FORMULA RS20 CHASSIS</span>
            </div>
            <div className="flex justify-between">
              <span>WebGL ENVIRONMENT</span>
              <span className="text-black font-semibold">R3F CUSTOM SHADERS v19</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Editorial branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-12 text-center"
        >
          <p className="font-mono text-[9px] tracking-[0.3em] font-black uppercase text-black">
            LOCKED // MOTORSPORT PERFORMANCE PROJECT
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
