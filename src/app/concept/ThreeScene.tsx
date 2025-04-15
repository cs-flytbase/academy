"use client";
// Updated implementation without framer-motion-3d
import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrbitControls,
  Environment,
  useTexture,
  Text,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { motion, MotionConfig } from "framer-motion";

function HUD() {
  const { camera } = useThree();

  return (
    <>
      {/* Altitude indicator */}
      <Html position={[-5, 2, 0]} transform>
        <div className="bg-black/70 text-white p-2 rounded w-16">
          <div className="text-sm">400ft</div>
          <div className="mt-4 text-sm">270ft</div>
          <div className="mt-4 text-sm">280ft</div>
          <div className="mt-4 text-sm">260ft</div>
          <div className="mt-4 bg-black text-white px-2 py-1 flex items-center">
            <span className="mr-1">▶</span> 239ft
          </div>
          <div className="mt-4 text-sm">230ft</div>
          <div className="mt-4 text-sm">220ft</div>
        </div>
      </Html>

      {/* Compass */}
      <Html position={[0, 3, 0]} transform>
        <div className="flex space-x-10">
          <div className="text-white text-sm">180°</div>
          <div className="bg-black/70 px-2 py-1 rounded text-white">
            <div className="text-xs">SW</div>
            <div>203°</div>
          </div>
          <div className="text-white text-sm">225°</div>
        </div>
      </Html>

      {/* Distance */}
      <Html position={[5, 3, 0]} transform>
        <div className="bg-red-600 text-white px-2 py-1 rounded flex items-center">
          <span className="mr-1">→</span> 290 ft
        </div>
      </Html>

      {/* Map */}
      <Html position={[5, 0, 0]} transform>
        <div className="bg-black/80 w-32 h-32 rounded">
          <div className="h-full w-full relative">
            <div className="absolute right-2 top-2 text-white text-xs">
              Redwood City Park
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <div className="transform rotate-45 text-white">▲</div>
              </div>
            </div>
            <div className="absolute left-1/2 bottom-2 -translate-x-1/2 text-white text-xs">
              DESTINATION
            </div>
          </div>
        </div>
      </Html>
    </>
  );
}

function TerrainMesh() {
  const mesh = useRef<THREE.Mesh>(null);
  const heightMap = useTexture("/heightMap.jpg");

  // Enhanced animation using standard Three.js techniques
  useFrame((state) => {
    if (mesh.current) {
      // Subtle terrain movement
      mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.01;

      // Animate position on mount (replacing framer-motion-3d functionality)
      if (mesh.current.position.y < -2) {
        mesh.current.position.y = THREE.MathUtils.lerp(
          mesh.current.position.y,
          -2,
          0.02
        );
      }
    }
  });

  // Instead of using framer-motion-3d, we'll use standard
  // React Three Fiber animation techniques
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[30, 30, 64, 64]} />
      <meshStandardMaterial
        displacementMap={heightMap}
        displacementScale={3.5}
        color={"green"}
        wireframe={false}
      />
    </mesh>
  );
}

export const ThreeScene = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={canvasRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="w-full h-full"
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 10, 15]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls enableZoom={false} enablePan={false} />
        <Environment preset="forest" />

        <TerrainMesh />
        <HUD />
      </Canvas>
    </motion.div>
  );
};
