"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BlueprintOverlayProps {
  scrollProgress: number; // 0 to 1
}

interface Callout {
  id: string;
  title: string;
  desc: string;
  x: string; // percentage across screen
  y: string; // percentage down screen
  lineX: number; // relative line endpoints
  lineY: number;
}

export default function BlueprintOverlay({ scrollProgress }: BlueprintOverlayProps) {
  // Visible during technical blueprint phase (0.35 to 0.60)
  const isVisible = scrollProgress >= 0.35 && scrollProgress <= 0.62;

  // Engineering HUD callouts
  const callouts: Callout[] = [
    {
      id: "wing",
      title: "DRS REAR WING",
      desc: "CARBON WING / HYDRAULIC ACTUATION",
      x: "72%",
      y: "35%",
      lineX: -80,
      lineY: 30,
    },
    {
      id: "chassis",
      title: "MONOCOQUE CHASSIS",
      desc: "HONEYCOMB CARBON FIBER CELL",
      x: "15%",
      y: "45%",
      lineX: 120,
      lineY: 20,
    },
    {
      id: "diffuser",
      title: "VENTURI TUNNEL DIFFUSER",
      desc: "UNDERBODY GROUND EFFECT VENTURI",
      x: "68%",
      y: "65%",
      lineX: -100,
      lineY: -30,
    },
  ];

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden select-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="w-full h-full relative"
          >
            {/* Fine Blueprint Technical Grid Background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(252, 209, 22, 0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(252, 209, 22, 0.04) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
                backgroundPosition: "center",
                opacity: (scrollProgress - 0.35) / 0.1, // fade grid in gently
              }}
            />

            {/* Engineering Callout Nodes */}
            {callouts.map((callout, i) => (
              <div
                key={callout.id}
                className="absolute flex items-start pointer-events-auto"
                style={{ left: callout.x, top: callout.y }}
              >
                {/* Pulse Target Dot */}
                <div className="relative flex items-center justify-center w-4 h-4 mr-3">
                  <div className="w-1.5 h-1.5 bg-[#fcd116] rounded-full z-10" />
                  <div className="absolute w-4 h-4 border border-[#fcd116]/40 rounded-full animate-ping" />
                  <div className="absolute w-2.5 h-2.5 border border-[#fcd116] rounded-full" />
                </div>

                {/* Draw Callout Connector SVG Line */}
                <svg
                  className="absolute pointer-events-none overflow-visible"
                  style={{
                    left: 8,
                    top: 8,
                    width: Math.abs(callout.lineX),
                    height: Math.abs(callout.lineY),
                    transform: `scale(${callout.lineX < 0 ? -1 : 1}, ${callout.lineY < 0 ? -1 : 1})`,
                  }}
                >
                  <motion.path
                    d={`M 0 0 L ${Math.abs(callout.lineX) * 0.4} 0 L ${Math.abs(callout.lineX)} ${Math.abs(
                      callout.lineY
                    )}`}
                    fill="none"
                    stroke="#fcd116"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                  />
                </svg>

                {/* Blueprint specification panel */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.2 + 0.3, type: "spring", stiffness: 120 }}
                  style={{
                    marginLeft: callout.lineX > 0 ? `${callout.lineX}px` : "0px",
                    marginRight: callout.lineX < 0 ? `${Math.abs(callout.lineX)}px` : "0px",
                    marginTop: `${callout.lineY}px`,
                  }}
                  className="hud-panel p-2 md:p-3 bg-black/80 border border-[#fcd116]/20 flex flex-col min-w-[130px] md:min-w-[180px] max-w-[45vw] shadow-lg"
                >
                  <span className="font-hud text-[6px] md:text-[8px] text-[#fcd116] tracking-wider font-bold uppercase mb-0.5">
                    {callout.title}
                  </span>
                  <span className="font-mono text-[5px] md:text-[7px] text-gray-400 uppercase leading-relaxed md:leading-relaxed">
                    {callout.desc}
                  </span>
                  <div className="w-full h-[1px] bg-white/10 my-1.5" />
                  <div className="flex justify-between text-[6px] font-mono text-gray-500 uppercase">
                    <span>SYS_CHECK</span>
                    <span className="text-green-500 font-bold">100% SECURE</span>
                  </div>
                </motion.div>
              </div>
            ))}

            {/* Technical grid widgets on borders */}
            <div className="hidden md:flex absolute top-1/4 left-12 hud-panel p-4 flex-col font-mono text-[7px] text-gray-500 uppercase">
              <span className="text-[#fcd116] font-bold mb-1">AERO SIMULATOR</span>
              <span>PRESSURE RATIO: 1.14</span>
              <span>DRAG COEFF: 0.344 cd</span>
              <span>DOWNFORCE LOAD: 22.4 KN</span>
            </div>

            <div className="hidden md:flex absolute bottom-1/4 right-12 hud-panel p-4 flex-col font-mono text-[7px] text-gray-500 uppercase">
              <span className="text-[#fcd116] font-bold mb-1">STRUCTURAL STRESS</span>
              <span>COCKPIT INT: 100% OK</span>
              <span>KEVLAR SKIN: ACTIVE</span>
              <span>CHASSIS LOAD: 4.2 G MAX</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
