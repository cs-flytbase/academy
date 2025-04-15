"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.2, duration: 0.6 },
    }),
  };

  return (
    <div className="relative">
      {/* Hero Content */}
      <div className="flex flex-col md:flex-row px-12 md:px-16 lg:px-20 py-16">
        {/* Left Column - Headline */}
        <div className="w-full md:w-1/2 mb-12 md:mb-0">
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.span
              className="block"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.6 },
                },
              }}
            >
              The Future of
            </motion.span>
            <motion.span
              className="block"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.6, delay: 0.2 },
                },
              }}
            >
              Air Support
            </motion.span>
          </motion.h1>
        </div>

        {/* Right Column - Text and CTA */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col justify-center"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={textVariants}
        >
          <motion.p className="text-lg mb-8" custom={3} variants={textVariants}>
            The future of public safety air support is faster, safer, greener,
            more efficient, more effective, and more affordable. We make that
            future a reality, fostering safer communities worldwide.
          </motion.p>
          <motion.div custom={4} variants={textVariants}>
            <Button className="bg-black hover:bg-gray-800 text-white" asChild>
              <Link href="/product" className="group">
                EXPLORE THE PRODUCT
                <motion.span
                  className="ml-2 inline-block"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
