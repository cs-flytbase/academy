"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  PerspectiveCamera,
  Sky,
  Html,
  useHelper,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";
import { SpotLightHelper } from "three";

// Define proper TypeScript interfaces
interface KeyboardControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  yawLeft: boolean;
  yawRight: boolean;
}

interface DroneStats {
  altitude: number;
  speed: number;
  battery: number;
  signal: number;
}

// Custom hook for keyboard controls
const useKeyboardControls = (): KeyboardControls => {
  const [movement, setMovement] = useState<KeyboardControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    yawLeft: false,
    yawRight: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for these keys
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "w",
          "a",
          "s",
          "d",
          "q",
          "e",
          "Shift",
          " ",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case "w":
        case "ArrowUp":
          setMovement((m) => ({ ...m, forward: true }));
          break;
        case "s":
        case "ArrowDown":
          setMovement((m) => ({ ...m, backward: true }));
          break;
        case "a":
        case "ArrowLeft":
          setMovement((m) => ({ ...m, left: true }));
          break;
        case "d":
        case "ArrowRight":
          setMovement((m) => ({ ...m, right: true }));
          break;
        case "Shift":
          setMovement((m) => ({ ...m, down: true }));
          break;
        case " ":
          setMovement((m) => ({ ...m, up: true }));
          break;
        case "q":
          setMovement((m) => ({ ...m, yawLeft: true }));
          break;
        case "e":
          setMovement((m) => ({ ...m, yawRight: true }));
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "w":
        case "ArrowUp":
          setMovement((m) => ({ ...m, forward: false }));
          break;
        case "s":
        case "ArrowDown":
          setMovement((m) => ({ ...m, backward: false }));
          break;
        case "a":
        case "ArrowLeft":
          setMovement((m) => ({ ...m, left: false }));
          break;
        case "d":
        case "ArrowRight":
          setMovement((m) => ({ ...m, right: false }));
          break;
        case "Shift":
          setMovement((m) => ({ ...m, down: false }));
          break;
        case " ":
          setMovement((m) => ({ ...m, up: false }));
          break;
        case "q":
          setMovement((m) => ({ ...m, yawLeft: false }));
          break;
        case "e":
          setMovement((m) => ({ ...m, yawRight: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return movement;
};

// Animated propeller component with proper TypeScript types
function AnimatedPropeller({
  position,
}: {
  position: [number, number, number];
}) {
  const propRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (propRef.current) {
      propRef.current.rotation.z += 0.5; // Fast rotation
    }
  });

  return (
    <mesh ref={propRef} position={position}>
      <boxGeometry args={[0.15, 0.01, 0.01]} />
      <meshStandardMaterial color="#888" />
    </mesh>
  );
}

// Animated LED component with proper TypeScript types
function AnimatedLED({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const ledRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (
      ledRef.current &&
      ledRef.current.material instanceof THREE.MeshStandardMaterial
    ) {
      // Pulsating emissive intensity
      const intensity = 1 + Math.sin(state.clock.getElapsedTime() * 5) * 0.5;
      ledRef.current.material.emissiveIntensity = intensity;
    }
  });

  return (
    <mesh ref={ledRef} position={position}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
      />
    </mesh>
  );
}

// Simple drone model
function Drone({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const bodyRef = useRef<THREE.Group>(null);

  return (
    <group position={position} rotation={rotation} ref={bodyRef}>
      {/* Drone body */}
      <mesh>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Drone arms */}
      {[
        [0.1, 0, 0.1] as [number, number, number],
        [0.1, 0, -0.1] as [number, number, number],
        [-0.1, 0, 0.1] as [number, number, number],
        [-0.1, 0, -0.1] as [number, number, number],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      {/* Propellers - using custom animated component */}
      {[
        [0.1, 0.08, 0.1] as [number, number, number],
        [0.1, 0.08, -0.1] as [number, number, number],
        [-0.1, 0.08, 0.1] as [number, number, number],
        [-0.1, 0.08, -0.1] as [number, number, number],
      ].map((pos, i) => (
        <AnimatedPropeller key={i} position={pos} />
      ))}
      {/* LEDs - using custom animated component */}
      <AnimatedLED
        position={[0.12, 0, 0.12] as [number, number, number]}
        color="#ff0000"
      />{" "}
      {/* Red - Front Right */}
      <AnimatedLED
        position={[0.12, 0, -0.12] as [number, number, number]}
        color="#00ff00"
      />{" "}
      {/* Green - Back Right */}
      <AnimatedLED
        position={[-0.12, 0, 0.12] as [number, number, number]}
        color="#00ff00"
      />{" "}
      {/* Green - Front Left */}
      <AnimatedLED
        position={[-0.12, 0, -0.12] as [number, number, number]}
        color="#ff0000"
      />{" "}
      {/* Red - Back Left */}
      {/* Camera */}
      <mesh position={[0, 0, 0.1] as [number, number, number]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

// Custom environment with buildings and terrain
function SimulationEnvironment() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4a7c59" />
      </mesh>

      {/* Buildings */}
      {Array.from({ length: 50 }, (_, i) => {
        const x = Math.random() * 80 - 40;
        const z = Math.random() * 80 - 40;
        const height = Math.random() * 10 + 2;
        const width = Math.random() * 5 + 2;
        const depth = Math.random() * 5 + 2;

        return (
          <mesh key={i} position={[x, height / 2 - 2, z]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={`#${Math.floor(Math.random() * 0xffffff)
                .toString(16)
                .padStart(6, "0")}`}
            />
          </mesh>
        );
      })}

      {/* Trees */}
      {Array.from({ length: 100 }, (_, i) => {
        const x = Math.random() * 80 - 40;
        const z = Math.random() * 80 - 40;
        const height = Math.random() * 3 + 1;

        return (
          <group key={i} position={[x, -2, z]}>
            {/* Trunk */}
            <mesh position={[0, height / 2, 0]}>
              <cylinderGeometry args={[0.2, 0.2, height, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Leaves */}
            <mesh position={[0, height, 0]}>
              <coneGeometry args={[1, 2, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
      })}

      {/* Center marker */}
      <mesh position={[0, -1.9, 0]}>
        <cylinderGeometry args={[5, 5, 0.1, 36]} />
        <meshStandardMaterial color="#ff0000" opacity={0.7} transparent />
      </mesh>
    </group>
  );
}

// Main drone camera and physics
function DroneCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const droneRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  // Physics state with proper typing
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const acceleration = useRef(new THREE.Vector3(0, 0, 0));
  const rotation = useRef(new THREE.Quaternion());
  const targetRotation = useRef(new THREE.Quaternion());
  const { camera } = useThree();

  // Get keyboard controls
  const controls = useKeyboardControls();

  // Stats
  const [stats, setStats] = useState<DroneStats>({
    altitude: 0,
    speed: 0,
    battery: 100,
    signal: 95,
  });

  // Debug mode
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    const handleToggleDebug = (e: KeyboardEvent) => {
      if (e.key === "b") {
        setDebugMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleToggleDebug);
    return () => window.removeEventListener("keydown", handleToggleDebug);
  }, []);

  // Use spotlight helper in debug mode
  useHelper(debugMode && spotlightRef, SpotLightHelper);

  // Update physics and camera position on each frame
  useFrame((state, delta) => {
    // Apply controls to acceleration
    acceleration.current.set(0, 0, 0);

    const speed = 10; // max speed
    const rotSpeed = 1.5; // rotation speed

    // Forward/backward tilt (pitch)
    if (controls.forward) {
      acceleration.current.z -= speed * 2 * delta;
      targetRotation.current.setFromEuler(new THREE.Euler(-0.3, 0, 0));
    } else if (controls.backward) {
      acceleration.current.z += speed * 2 * delta;
      targetRotation.current.setFromEuler(new THREE.Euler(0.3, 0, 0));
    } else {
      targetRotation.current.setFromEuler(new THREE.Euler(0, 0, 0));
    }

    // Left/right tilt (roll)
    if (controls.left) {
      acceleration.current.x -= speed * 2 * delta;
      targetRotation.current.multiply(
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.3))
      );
    } else if (controls.right) {
      acceleration.current.x += speed * 2 * delta;
      targetRotation.current.multiply(
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.3))
      );
    }

    // Up/down movement (throttle)
    if (controls.up) {
      acceleration.current.y += speed * 1.5 * delta;
    } else if (controls.down) {
      acceleration.current.y -= speed * 1.5 * delta;
    }

    // Yaw rotation (yaw)
    if (controls.yawLeft) {
      camera.rotateY(rotSpeed * delta);
    } else if (controls.yawRight) {
      camera.rotateY(-rotSpeed * delta);
    }

    // Apply acceleration to velocity
    velocity.current.add(acceleration.current);

    // Apply drag
    velocity.current.multiplyScalar(0.95);

    // Move camera based on velocity
    camera.position.add(velocity.current);

    // Smoothly interpolate to target rotation
    rotation.current.slerp(targetRotation.current, 0.1);

    // Apply rotation to drone
    if (droneRef.current) {
      droneRef.current.quaternion.copy(rotation.current);
    }

    // Update spotlight position and direction
    if (spotlightRef.current) {
      spotlightRef.current.position.copy(camera.position);
      spotlightRef.current.target.position.copy(
        new THREE.Vector3(0, 0, -1)
          .applyQuaternion(camera.quaternion)
          .add(camera.position)
      );
      spotlightRef.current.target.updateMatrixWorld();
    }

    // Update stats
    setStats({
      altitude: Math.max(0, camera.position.y + 2),
      speed: Math.sqrt(
        velocity.current.x * velocity.current.x +
          velocity.current.z * velocity.current.z
      ),
      battery: Math.max(0, 100 - state.clock.getElapsedTime() / 10),
      signal: 95 + Math.sin(state.clock.getElapsedTime()) * 5,
    });

    // Prevent drone from going below ground
    if (camera.position.y < -1) {
      camera.position.y = -1;
      velocity.current.y = 0;
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 0, 0]}
        fov={90}
      />

      {/* Drone model that follows the camera */}
      <group ref={droneRef} position={[0, -0.2, -0.4]}>
        <Drone position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />
      </group>

      {/* Spotlight for night flying */}
      <spotLight
        ref={spotlightRef}
        position={[0, 0, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.8}
        color="white"
        castShadow
      />
      <primitive
        object={spotlightRef.current?.target || new THREE.Object3D()}
      />

      {/* HUD Elements */}
      <Html fullscreen>
        <div className="absolute inset-0 pointer-events-none">
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
            <div className="animate-pulse">+</div>
          </div>

          {/* Status panel */}
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg flex justify-between items-center">
            <div>
              <div>Alt: {stats.altitude.toFixed(1)}m</div>
              <div>Speed: {stats.speed.toFixed(1)}m/s</div>
            </div>
            <div>
              <div>Battery: {stats.battery.toFixed(0)}%</div>
              <div>Signal: {stats.signal.toFixed(0)}%</div>
            </div>
          </div>

          {/* Controls help */}
          <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg text-sm">
            <div className="font-bold mb-1 text-center">FPV Drone Controls</div>
            <div className="grid grid-cols-2 gap-2">
              <div>W / ↑: Forward</div>
              <div>S / ↓: Backward</div>
              <div>A / ←: Left</div>
              <div>D / →: Right</div>
              <div>Space: Ascend</div>
              <div>Shift: Descend</div>
              <div>Q: Rotate Left</div>
              <div>E: Rotate Right</div>
              <div>B: Toggle Debug</div>
            </div>
          </div>
        </div>
      </Html>
    </>
  );
}

// Main App Component
export default function FPVDroneSimulator() {
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day");

  // Toggle between day and night
  const toggleTimeOfDay = () => {
    setTimeOfDay((prev) => (prev === "day" ? "night" : "day"));
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas shadows>
        <fog
          attach="fog"
          args={["#ffffff", 1, timeOfDay === "day" ? 50 : 20]}
        />

        <Suspense fallback={null}>
          <DroneCamera />
          <SimulationEnvironment />

          {timeOfDay === "day" ? (
            <Sky
              distance={450000}
              sunPosition={[0, 1, 0]}
              inclination={0.5}
              azimuth={0.25}
            />
          ) : (
            <>
              <Stars radius={100} depth={50} count={5000} factor={4} />
              <ambientLight intensity={0.1} />
            </>
          )}

          <ambientLight intensity={timeOfDay === "day" ? 0.8 : 0.1} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={timeOfDay === "day" ? 1 : 0.2}
            castShadow
          />
        </Suspense>
      </Canvas>

      {/* Time of day toggle button */}
      <button
        onClick={toggleTimeOfDay}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-10"
      >
        {timeOfDay === "day" ? "🌙 Night Mode" : "☀️ Day Mode"}
      </button>
    </div>
  );
}
