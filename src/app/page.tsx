"use client";

import { useEffect, useState } from "react";
import Preloader from "@/components/Preloader";
import ScrollCanvas from "@/components/ScrollCanvas";
import Navbar from "@/components/Navbar";
import TelemetryHUD from "@/components/TelemetryHUD";
import BlueprintOverlay from "@/components/BlueprintOverlay";
import ThreeDOverlay from "@/components/ThreeDOverlay";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse Coordinates for 2.5D Parallax and WebGL interactivity
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Handle image preloading callbacks
  const handleProgress = (percent: number) => {
    setLoadProgress(percent);
  };

  const handleComplete = () => {
    // Add a slight delay for the preloader exit animation feel
    setTimeout(() => {
      setIsPreloaded(true);
    }, 800);
  };

  // Initialize Lenis Smooth Scroll and Window Scroll listener
  useEffect(() => {
    if (!isPreloaded) return;

    // Load Lenis dynamically to prevent SSR errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenisInstance: any;
    
    import("lenis").then(({ default: Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        const progress = window.scrollY / scrollHeight;
        setScrollProgress(progress);
      };

      lenisInstance.on("scroll", handleScroll);

      function raf(time: number) {
        if (lenisInstance) {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        }
      }

      requestAnimationFrame(raf);
      
      // Call once initially
      handleScroll();
    });

    return () => {
      if (lenisInstance) {
        lenisInstance.destroy();
      }
    };
  }, [isPreloaded]);

  // Track Mouse Move (Normalized -1 to 1) for 2.5D Parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate dynamic background color transition (Yellow -> Amber -> Black)
  const getBackgroundStyle = (progress: number) => {
    if (progress < 0.8) {
      return "#fcd116"; // Rich yellow
    }
    // Interpolate yellow (#fcd116) to dark grey/black (#080808)
    const p = Math.min((progress - 0.8) / 0.15, 1);
    
    const r = Math.round(252 - p * (252 - 8));
    const g = Math.round(209 - p * (209 - 8));
    const b = Math.round(22 - p * (22 - 8));

    return `linear-gradient(180deg, rgb(${r}, ${g}, ${b}) 0%, #000000 100%)`;
  };

  // Parallax offsets
  const parallaxTypography = {
    transform: `translate(${mouse.x * -35}px, ${mouse.y * -35}px)`,
    transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
  };

  const parallaxCanvas = {
    transform: `translate(${mouse.x * 6}px, ${mouse.y * 6}px) scale(1.02)`,
    transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
  };

  return (
    <main
      className="relative w-full overflow-x-hidden"
      style={{
        background: getBackgroundStyle(scrollProgress),
        minHeight: isPreloaded ? "600vh" : "100vh", // 6 viewports of scroll depth
      }}
    >
      {/* Editorial Overlay Textures */}
      <div className="grain-overlay" />
      <div className="ink-texture" />

      {/* Preloader */}
      <Preloader progress={loadProgress} isComplete={isPreloaded} />

      {/* Interactive Frame Canvas Layer - Mounted immediately to begin preloading */}
      <div
        style={{
          ...parallaxCanvas,
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <ScrollCanvas
          scrollProgress={scrollProgress}
          onProgress={handleProgress}
          onComplete={handleComplete}
          isPreloaded={isPreloaded}
        />
      </div>

      {/* Fixed Sticky Experience UI Overlays */}
      {isPreloaded && (
        <div
          style={{ zIndex: 100 }}
          className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none"
        >
          {/* Background Spatial Typography Layer (RS20) */}
          <div
            style={{
              ...parallaxTypography,
              opacity: scrollProgress < 0.7 ? Math.max(0.04 - scrollProgress * 0.05, 0.01) : 0,
              fontFamily: "var(--font-display)",
              zIndex: 5,
            }}
            className="absolute inset-0 flex items-center justify-center font-black text-[30vw] text-black pointer-events-none select-none tracking-tighter transition-opacity duration-300"
          >
            RS20
          </div>

          {/* WebGL React Three Fiber Shader Overlay */}
          <ThreeDOverlay
            scrollProgress={scrollProgress}
            mouseX={mouse.x}
            mouseY={mouse.y}
          />

          {/* Technical Blueprint Overlay */}
          <BlueprintOverlay scrollProgress={scrollProgress} />

          {/* Navigation Bar */}
          <Navbar scrollProgress={scrollProgress} />

          {/* Telemetry and Specification HUD Panel Overlay */}
          <TelemetryHUD scrollProgress={scrollProgress} />

          {/* Call To Action Overlay */}
          <CallToAction scrollProgress={scrollProgress} />
        </div>
      )}
    </main>
  );
}
