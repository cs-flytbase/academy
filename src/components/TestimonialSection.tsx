import React from "react";
import TestimonialSlider from "@/components/TestimonialSlider";

const TestimonialSection = () => {
  return (
    <section className="py-16 bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            What Our Students Say
          </h2>
        </div>

        <TestimonialSlider />
      </div>
    </section>
  );
};

export default TestimonialSection;
