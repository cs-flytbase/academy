// File: src/app/page.tsx
"use client";

import { motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { ThreeScene } from "./ThreeScene";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden text-black">
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Hero />
        <div className="relative h-[600px] w-full">{/* <ThreeScene /> */}</div>
      </motion.div>
    </main>
  );
}
