import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="bg-[#0D1117] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl font-bold mb-6">
              Your Journey to{" "}
              <span className="text-[#F18B2E]">Drone Autonomy</span> Starts Here
            </h1>
            <p className="text-xl mb-8">
              Become a certified drone expert with our industry-leading courses
              and hands-on training
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-[#0D1117] hover:bg-gray-100 transition-colors"
                asChild
              >
                <Link href="/courses">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 transition-colors"
                asChild
              >
                <Link href="/sign-up">Sign Up Free</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-[#1E2530] rounded-lg p-6 max-w-md">
              <img
                src="/lovable-uploads/481a13eb-6855-4500-888c-8c5d4a3734a1.png"
                alt="Collection of advanced drones and equipment"
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center">
          <div className="mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Continue Learning</h2>
            <p className="text-gray-400">Pick up where you left off</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
