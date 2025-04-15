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

// NavLink component with overflow hidden reveal animation
const NavLink = ({
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
        <div
          className="overflow-hidden relative"
          style={{
            width: isHovered ? "calc(100% + 20px)" : "100%",
            transition: "width 0.3s ease",
          }}
        >
          <motion.div
            className="flex items-center px-4 py-2"
            animate={{
              x: isHovered ? 10 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          >
            <div className="absolute left-[-9px]">
              <NavArrow />
            </div>
            <span>{children}</span>
          </motion.div>
        </div>
      </Link>
    </div>
  );
};

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
        <div className="relative w-[120px] h-[40px] overflow-hidden border border-black rounded">
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-black rounded-full"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white"
            initial={{ x: -20, opacity: 0 }}
            animate={{
              x: isHovered ? -5 : -20,
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white rotate-180"
            initial={{ x: 20, opacity: 0 }}
            animate={{
              x: isHovered ? -5 : -20,
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

          {/* Original black text that moves up and out */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center "
            initial={{ y: 0 }}
            animate={{
              y: isHovered ? -40 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            <span className="font-medium text-black space-x-2">{children}</span>
          </motion.div>

          {/* New white text that moves in from below */}
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
            <span className="font-medium text-white">{children}</span>
          </motion.div>
        </div>
      </Link>
    </div>
  );
};
export const Navbar = () => {
  return (
    <nav className="flex justify-between items-center py-8 px-12 md:px-16 lg:px-20">
      <div className="font-bold text-2xl">
        <Link href="/">FLYTBASE</Link>
      </div>
      <div className="flex items-center space-x-4">
        <NavLink href="/product">PRODUCT</NavLink>
        <NavLink href="https://www.flytbase.com/blog">BLOG</NavLink>
        <NavButton href="https://www.flytbase.com/contact">CONTACT</NavButton>
      </div>
    </nav>
  );
};
