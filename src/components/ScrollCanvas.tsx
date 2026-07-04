"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollCanvasProps {
  scrollProgress: number; // 0 to 1
  onProgress: (percent: number) => void;
  onComplete: () => void;
  isPreloaded: boolean;
}

export default function ScrollCanvas({
  scrollProgress,
  onProgress,
  onComplete,
  isPreloaded,
}: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const totalFrames = 240;
  const imageFolderPath = "/assets/frames";

  // Preload frames in background and use a timed progress to ensure fast entry
  useEffect(() => {
    let active = true;
    const tempImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    // Fake progress to ensure we enter the site in ~2.5 seconds maximum,
    // avoiding the long wait for all 240 high-res frames to download.
    let fakeProgress = 0;
    const maxTime = 2500; // 2.5 seconds
    const intervalMs = 30;
    const increment = 100 / (maxTime / intervalMs);

    const progressInterval = setInterval(() => {
      if (!active) return;
      fakeProgress += increment;
      
      if (fakeProgress >= 100) {
        fakeProgress = 100;
        clearInterval(progressInterval);
        onProgress(100);
        setImagesLoaded(true);
        onComplete();
      } else {
        onProgress(fakeProgress);
      }
    }, intervalMs);

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      // Format number to 4 digits: frame_0001.png
      const frameNum = String(i).padStart(4, "0");
      img.src = `${imageFolderPath}/frame_${frameNum}.png`;

      const handleLoad = () => {
        if (!active) return;
        loadedCount++;
        
        // If all images load super fast (e.g. from cache), finish early
        if (loadedCount === totalFrames && fakeProgress < 100) {
           clearInterval(progressInterval);
           onProgress(100);
           setImagesLoaded(true);
           onComplete();
        }
      };

      img.onload = handleLoad;
      img.onerror = handleLoad;

      tempImages.push(img);
    }

    imagesRef.current = tempImages;

    return () => {
      active = false;
      clearInterval(progressInterval);
    };
  }, [onProgress, onComplete]);

  // Draw image on canvas
  const drawImage = useRef((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Scale canvas buffer by DPR for crisp Retina rendering
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    if (imgWidth === 0 || imgHeight === 0) return;

    // object-fit: cover mathematics
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    } else {
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  });

  // Determine current frame based on scrollProgress
  const currentFrameIndex = Math.min(
    Math.max(Math.floor(scrollProgress * (totalFrames - 1)), 0),
    totalFrames - 1
  );

  // Redraw when frame changes or images are loaded
  useEffect(() => {
    if (imagesLoaded && imagesRef.current[currentFrameIndex]) {
      drawImage.current(imagesRef.current[currentFrameIndex]);
    }
  }, [currentFrameIndex, imagesLoaded]);

  // Redraw on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imagesLoaded && imagesRef.current[currentFrameIndex]) {
        drawImage.current(imagesRef.current[currentFrameIndex]);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentFrameIndex, imagesLoaded]);

  return (
    <div className="relative w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover"
        style={{
          opacity: isPreloaded ? 1 : 0,
          transition: "opacity 1.2s ease-in-out",
        }}
      />
    </div>
  );
}
