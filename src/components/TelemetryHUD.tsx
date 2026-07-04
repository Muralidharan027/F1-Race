"use client";

import { motion, AnimatePresence } from "framer-motion";


interface TelemetryHUDProps {
  scrollProgress: number; // 0 to 1
}

interface SpecItem {
  title: string;
  value: string;
  detail: string;
  side: "left" | "right";
}

export default function TelemetryHUD({ scrollProgress }: TelemetryHUDProps) {
  // Telemetry Calculations mapped to scroll progress
  const getTelemetry = (progress: number) => {
    let speed = 0;
    let rpm = 900;
    let gear = "N";
    let drs = "LOCKED";
    let gForce = 1.05;

    // Phased telemetry behavior
    if (progress < 0.1) {
      // Preloader/Idle phase
      speed = 0;
      rpm = 900 + Math.sin(Date.now() / 100) * 40; // subtle idle flutter
      gear = "N";
      gForce = 1.02;
    } else if (progress < 0.3) {
      // Phase 2: Launch & Acceleration
      const p = (progress - 0.1) / 0.2; // 0 to 1
      speed = Math.round(p * 185);
      // Simulate gears 1-3
      if (p < 0.3) {
        gear = "1";
        rpm = Math.round(1500 + (p / 0.3) * 9000);
      } else if (p < 0.65) {
        gear = "2";
        const subP = (p - 0.3) / 0.35;
        rpm = Math.round(7200 + subP * 3800);
      } else {
        gear = "3";
        const subP = (p - 0.65) / 0.35;
        rpm = Math.round(7000 + subP * 4200);
      }
      gForce = parseFloat((1.05 + p * 3.2).toFixed(2));
    } else if (progress < 0.6) {
      // Phase 3: Speed run (rotate and specs)
      const p = (progress - 0.3) / 0.3; // 0 to 1
      speed = Math.round(185 + p * 140);
      drs = speed > 280 ? "ACTIVE" : "LOCKED";
      // Gears 4-6
      if (p < 0.3) {
        gear = "4";
        rpm = Math.round(7100 + (p / 0.3) * 3800);
      } else if (p < 0.7) {
        gear = "5";
        const subP = (p - 0.3) / 0.4;
        rpm = Math.round(7200 + subP * 3900);
      } else {
        gear = "6";
        const subP = (p - 0.7) / 0.3;
        rpm = Math.round(7400 + subP * 3600);
      }
      gForce = parseFloat((4.25 - p * 1.5).toFixed(2));
    } else if (progress < 0.85) {
      // Phase 4: High-speed tunnel run
      const p = (progress - 0.6) / 0.25; // 0 to 1
      speed = Math.round(325 + p * 50); // up to 375 km/h
      drs = "ACTIVE";
      gear = p < 0.5 ? "7" : "8";
      rpm = Math.round(8500 + p * 3200);
      gForce = parseFloat((2.75 + p * 1.85).toFixed(2));
    } else {
      // Phase 5: Braking to a stop on platform
      const p = (progress - 0.85) / 0.15; // 0 to 1
      speed = Math.round(375 - p * 375);
      drs = "LOCKED";
      gear = speed > 200 ? "5" : speed > 80 ? "2" : speed > 0 ? "1" : "N";
      rpm = speed > 0 ? Math.round(1500 + (speed / 375) * 8000) : 900 + Math.sin(Date.now() / 150) * 30;
      gForce = parseFloat((4.6 - p * 3.5).toFixed(2));
    }

    return { speed, rpm, gear, drs, gForce };
  };

  const { speed, rpm, gear, drs, gForce } = getTelemetry(scrollProgress);

  // 3D Tilt handler for spec cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 8;
    const rotateY = (x - centerX) / 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  // Specification Items
  const specs: SpecItem[] = [
    { title: "POWER", value: "1,020 HP", detail: "V6 Hybrid Turbo + MGU-K", side: "left" },
    { title: "AERODYNAMICS", value: "3,200 KG", detail: "Active DRS Wing Downforce", side: "left" },
    { title: "WEIGHT", value: "798 KG", detail: "Monocoque Carbon Structure", side: "left" },
    { title: "TOP SPEED", value: "375 KM/H", detail: "Active Aero Configured Limit", side: "right" },
    { title: "ACCELERATION", value: "1.9 SEC", detail: "0-100 km/h Launch Time", side: "right" },
    { title: "DISTRIBUTION", value: "45 / 55", detail: "Front / Rear Bias Split", side: "right" },
  ];

  // Render specifications during the presentation phase (0.22 to 0.52 of scroll progress)
  const showSpecs = scrollProgress >= 0.22 && scrollProgress <= 0.55;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-12 select-none">
      {/* Dynamic Telemetry HUD Panels (Top Area) */}
      <div className="w-full flex justify-between items-start mt-16 md:mt-20 font-mono text-[8px] md:text-[9px] text-gray-400">
        {/* Left Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hud-panel p-4 flex flex-col space-y-1"
        >
          <span className="text-gray-500 font-bold">CIRCUIT TRACKING</span>
          <span className="text-white font-hud tracking-widest text-[10px]">MONACO GP // POOL 3</span>
          <span className="text-gray-500 mt-1">LATERAL G-FORCE</span>
          <span className="text-[#fcd116] font-bold text-xs tracking-wider glow-text">
            {gForce.toFixed(2)} G
          </span>
        </motion.div>

        {/* Right Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hud-panel p-4 flex flex-col items-end space-y-1"
        >
          <span className="text-gray-500 font-bold">DRS FLAP CONTROL</span>
          <span
            className={`font-hud tracking-wider text-[10px] font-bold ${
              drs === "ACTIVE" ? "text-green-500 glow-text" : "text-white"
            }`}
          >
            {drs}
          </span>
          <span className="text-gray-500 mt-1">HYBRID ENERGY</span>
          <span className="text-[#fcd116] font-bold text-xs tracking-wider">
            {Math.max(100 - Math.round(scrollProgress * 25), 0)}% SOC
          </span>
        </motion.div>
      </div>

      {/* Specification Cards - Spring Overlays (Middle Area) */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-8 items-center my-auto w-full px-2 md:px-0">
        {/* Left Spec Column */}
        <div className="col-span-1 md:col-span-4 flex flex-col space-y-2 md:space-y-4">
          <AnimatePresence>
            {showSpecs &&
              specs
                .filter((s) => s.side === "left")
                .map((spec, i) => (
                  <motion.div
                    key={spec.title}
                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -30, scale: 0.9, transition: { duration: 0.3 } }}
                    transition={{
                      type: "spring",
                      stiffness: 110,
                      damping: 15,
                      delay: i * 0.1,
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="hud-panel p-3 md:p-5 cursor-pointer ease-out transition-transform duration-100 flex flex-col border-l-4 border-l-[#fcd116]"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <span className="font-hud text-[7px] md:text-[8px] text-[#fcd116] tracking-widest font-black uppercase mb-0.5 md:mb-1">
                      {spec.title}
                    </span>
                    <span className="font-hud text-base md:text-xl font-black text-white glow-text leading-none mb-0.5 md:mb-1">
                      {spec.value}
                    </span>
                    <span className="font-body text-[7px] md:text-[9px] text-gray-400 font-light tracking-wide leading-tight">
                      {spec.detail}
                    </span>
                  </motion.div>
                ))}
          </AnimatePresence>
        </div>

        {/* Center spacing (Formula Car Viewport) */}
        <div className="hidden md:block md:col-span-4" />

        {/* Right Spec Column */}
        <div className="col-span-1 md:col-span-4 flex flex-col space-y-2 md:space-y-4">
          <AnimatePresence>
            {showSpecs &&
              specs
                .filter((s) => s.side === "right")
                .map((spec, i) => (
                  <motion.div
                    key={spec.title}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 30, scale: 0.9, transition: { duration: 0.3 } }}
                    transition={{
                      type: "spring",
                      stiffness: 110,
                      damping: 15,
                      delay: i * 0.1,
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="hud-panel p-3 md:p-5 cursor-pointer ease-out transition-transform duration-100 flex flex-col items-end text-right border-r-4 border-r-[#fcd116]"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <span className="font-hud text-[7px] md:text-[8px] text-[#fcd116] tracking-widest font-black uppercase mb-0.5 md:mb-1">
                      {spec.title}
                    </span>
                    <span className="font-hud text-base md:text-xl font-black text-white glow-text leading-none mb-0.5 md:mb-1">
                      {spec.value}
                    </span>
                    <span className="font-body text-[7px] md:text-[9px] text-gray-400 font-light tracking-wide leading-tight">
                      {spec.detail}
                    </span>
                  </motion.div>
                ))}
          </AnimatePresence>
        </div>
      </div>

      {/* bottom HUD bar - telemetry readout (Speed, RPM, Gear) */}
      <div className="w-full flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between items-end border-t border-white/5 pt-4 md:pt-6 font-mono text-[9px] text-gray-500">
        {/* Speedometer widget */}
        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-start">
          <div className="hud-panel p-3 md:p-4 flex items-center gap-2 md:gap-4 flex-1 md:flex-none">
            <div className="flex flex-col">
              <span className="text-gray-500 font-black text-[7px] md:text-[9px]">VELOCITY</span>
              <span className="font-hud text-xl md:text-2xl font-black text-white leading-none tracking-widest mt-1">
                {speed} <span className="text-[10px] md:text-xs font-light text-gray-400">KM/H</span>
              </span>
            </div>
            <div className="w-[1px] h-6 md:h-8 bg-white/10 mx-1 md:mx-0" />
            <div className="flex flex-col items-center md:items-start">
              <span className="text-gray-500 font-black text-[7px] md:text-[9px]">GEAR RATIO</span>
              <span className="font-hud text-xl md:text-2xl font-black text-[#fcd116] leading-none glow-text mt-1 text-center">
                {gear}
              </span>
            </div>
          </div>

          {/* RPM meter sweep */}
          <div className="hidden lg:flex flex-col space-y-1.5 w-64">
            <div className="flex justify-between text-[8px] text-gray-600">
              <span>RPM LOG</span>
              <span className="text-white font-bold">{rpm.toLocaleString()} / 12,500</span>
            </div>
            <div className="h-4 border border-white/10 bg-black/40 relative flex items-center px-1 rounded-sm overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-[#fcd116] to-[#ffe033] rounded-xs transition-all duration-100 ease-out"
                style={{ width: `${(rpm / 12500) * 100}%` }}
              />
              <div className="absolute inset-0 flex justify-between px-3 text-[7px] text-white/20 font-black z-10 leading-4">
                <span>0</span>
                <span>4k</span>
                <span>8k</span>
                <span>10k</span>
                <span className="text-red-500/50">12k</span>
              </div>
            </div>
          </div>
        </div>

        {/* System parameters bar */}
        <div className="flex flex-col items-center md:items-end space-y-1 text-center md:text-right w-full md:w-auto mt-4 md:mt-0">
          <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-4 text-[7px] md:text-[9px]">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5" />
              ABS: MONITORING
            </span>
            <span>TCS: OFF // MODE_CORSA</span>
            <span>ERS: HARVESTING</span>
          </div>
          <span className="text-gray-600 text-[8px] tracking-[0.2em]">
            SYSTEM RUNTIME STATUS // [43.7384° N, 7.4246° E] // MONACO GP
          </span>
        </div>
      </div>
    </div>
  );
}
