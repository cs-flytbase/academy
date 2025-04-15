"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

// Arrow SVG component
const NavArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 9 16"
    className="w-2.5 h-4"
  >
    <path
      fill="currentColor"
      d="M2.64 8.16a.5.5 0 0 0 0-.32L.6 1.784c-.163-.486.423-.874.807-.534L8.58 7.626a.5.5 0 0 1 0 .748L1.407 14.75c-.384.34-.97-.048-.806-.534z"
      className="standard-arrow"
    />
  </svg>
);

// NavButton component with complex hover animation
const NavButton = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href}>
        <div className="relative w-[150px] md:w-[160px] h-[40px] overflow-hidden rounded bg-[#171717] border border-white">
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-white rounded"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isHovered ? 1 : 0,
              opacity: isHovered ? 1 : 0,
              borderRadius: isHovered ? "0%" : "50%",
            }}
            transition={{ duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] }}
          />

          {/* Left arrow - starts off-screen left and moves in */}
          <motion.div
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
            initial={{ x: -20, opacity: 0 }}
            animate={{
              x: isHovered ? 0 : -20,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              delay: isHovered ? 0.1 : 0,
              ease: "easeOut",
            }}
          >
            <NavArrow />
          </motion.div>

          {/* Right arrow - starts off-screen right and moves in */}
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black rotate-180"
            initial={{ x: 20, opacity: 0 }}
            animate={{
              x: isHovered ? 0 : -20,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              delay: isHovered ? 0.1 : 0,
              ease: "easeOut",
            }}
          >
            <NavArrow />
          </motion.div>

          {/* Original text that moves up and out */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: 0 }}
            animate={{
              y: isHovered ? -40 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            <span className="font-medium text-white space-x-2">{children}</span>
          </motion.div>

          {/* New text that moves in from below */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: 40 }}
            animate={{
              y: isHovered ? 0 : 40,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            <span className="font-medium text-black">{children}</span>
          </motion.div>
        </div>
      </Link>
    </div>
  );
};

export default NavButton;