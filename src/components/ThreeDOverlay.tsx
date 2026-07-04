"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";

extend({ ShaderMaterial: THREE.ShaderMaterial });

interface ThreeDOverlayProps {
  scrollProgress: number; // 0 to 1
  mouseX: number; // normalized -1 to 1
  mouseY: number; // normalized -1 to 1
}

// Custom GLSL Shader Material for the Digital Ribbon Trails
const RibbonShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
    uColor: { value: new THREE.Color("#fcd116") },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      // Add a slight wave to the ribbons
      pos.z += sin(pos.y * 2.0) * 0.5;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uScrollProgress;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      // Flow lines along the length of the ribbon (y coordinate)
      float speed = uTime * 4.0 + uScrollProgress * 25.0;
      float linePattern = sin(vUv.y * 30.0 - speed) * 0.5 + 0.5;
      
      // Make it look like thin laser ribbons
      float lineStripes = step(0.7, linePattern);
      
      // Fade out at the edges (width of ribbon - x coordinate)
      float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
      
      // Combine glow and stripes
      vec3 finalColor = uColor * (lineStripes * 0.8 + 0.2);
      
      // Alpha blending
      gl_FragColor = vec4(finalColor, edgeFade * (lineStripes * 0.6 + 0.1));
    }
  `,
};

function RibbonTrails({ scrollProgress }: { scrollProgress: number }) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderRef.current.uniforms.uScrollProgress.value = scrollProgress;
    }
  });

  return (
    <group>
      {/* Left Ribbon Wall */}
      <mesh position={[-6, 0, -20]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 80, 1, 40]} />
        <shaderMaterial
          ref={shaderRef}
          args={[RibbonShaderMaterial]}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Right Ribbon Wall */}
      <mesh position={[6, 0, -20]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 80, 1, 40]} />
        <shaderMaterial
          ref={shaderRef}
          args={[RibbonShaderMaterial]}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Ceiling Ribbons */}
      <mesh position={[0, 4, -20]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 80, 1, 40]} />
        <shaderMaterial
          ref={shaderRef}
          args={[RibbonShaderMaterial]}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Particle System reacting to mouse cursor deflection
function FlowParticles({
  scrollProgress,
  mouseX,
  mouseY,
}: {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}) {
  const count = 1800;
  const meshRef = useRef<THREE.Points>(null);
  const rawPositions = useRef<Float32Array | null>(null);

  // Initialize particles
  const [particleData] = useState(() => {
    const pos = new Float32Array(count * 3);
    const spds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Random position in a cylinder leading away from camera
      pos[i * 3] = (Math.random() - 0.5) * 15; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10; // Y
      pos[i * 3 + 2] = -Math.random() * 80; // Z depth
      spds[i] = 0.5 + Math.random() * 1.5; // Z Speed
    }
    // Keep a cache of original/initial X & Y to deflect from
    rawPositions.current = pos.slice();
    return { pos, spds };
  });

  useFrame(() => {
    if (!meshRef.current || !rawPositions.current) return;

    const geo = meshRef.current.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const scrollFactor = 1.0 + scrollProgress * 3.0; // accelerate speed on scroll

    for (let i = 0; i < count; i++) {
      const idxX = i * 3;
      const idxY = i * 3 + 1;
      const idxZ = i * 3 + 2;

      // Z motion (towards camera)
      posAttr.array[idxZ] += particleData.spds[i] * scrollFactor * 0.6;

      // Recycle particles that pass behind camera
      if (posAttr.array[idxZ] > 10) {
        posAttr.array[idxZ] = -80;
        posAttr.array[idxX] = (Math.random() - 0.5) * 15;
        posAttr.array[idxY] = (Math.random() - 0.5) * 10;
        rawPositions.current[idxX] = posAttr.array[idxX];
        rawPositions.current[idxY] = posAttr.array[idxY];
      }

      // Deflection logic based on cursor coords
      const origX = rawPositions.current[idxX];
      const origY = rawPositions.current[idxY];

      // Calculate distance in XY plane
      // Map mouse coordinates to World Space approximate
      const targetMouseX = mouseX * 5.0;
      const targetMouseY = mouseY * 3.5;

      const diffX = targetMouseX - origX;
      const diffY = targetMouseY - origY;
      const distanceSq = diffX * diffX + diffY * diffY;

      // Deflect particles away if mouse cursor gets close
      if (distanceSq < 6.0) {
        const force = (6.0 - distanceSq) * 0.05;
        // push away
        posAttr.array[idxX] -= (diffX / Math.sqrt(distanceSq)) * force;
        posAttr.array[idxY] -= (diffY / Math.sqrt(distanceSq)) * force;
      } else {
        // Return to original paths/positions
        posAttr.array[idxX] += (origX - posAttr.array[idxX]) * 0.05;
        posAttr.array[idxY] += (origY - posAttr.array[idxY]) * 0.05;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.pos, 3]}
          count={count}
          array={particleData.pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fcd116"
        size={0.12}
        transparent={true}
        opacity={0.7}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}

export default function ThreeDOverlay({
  scrollProgress,
  mouseX,
  mouseY,
}: ThreeDOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Render Three.js overlay during high-speed segments (0.50 to 0.88 of scroll progress)
  let opacity = 0;

  if (scrollProgress >= 0.45 && scrollProgress < 0.58) {
    // Fade in
    opacity = (scrollProgress - 0.45) / 0.13;
  } else if (scrollProgress >= 0.58 && scrollProgress < 0.82) {
    // Full visible
    opacity = 1;
  } else if (scrollProgress >= 0.82 && scrollProgress <= 0.90) {
    // Fade out
    opacity = 1.0 - (scrollProgress - 0.82) / 0.08;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 15,
        opacity: opacity,
        transition: "opacity 0.2s ease-out",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={1.5} color="#ffe033" />
        <FlowParticles scrollProgress={scrollProgress} mouseX={mouseX} mouseY={mouseY} />
        <RibbonTrails scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
