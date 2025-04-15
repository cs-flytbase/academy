import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTASection = () => {
  return (
    <section className="py-12 bg-[#0D1117] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Your Drone Journey?
        </h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-300">
          Join thousands of students who have advanced their careers with
          FlytBase Academy
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-[#0D1117] hover:bg-gray-100"
            asChild
          >
            <Link href="/signup">Get Started Today</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-white text-white hover:bg-white/10"
            asChild
          >
            <Link href="/course">Browse Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
