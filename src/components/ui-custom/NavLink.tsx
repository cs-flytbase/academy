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

export default NavLink;