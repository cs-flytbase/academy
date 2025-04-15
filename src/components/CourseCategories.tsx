import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CourseCategories = () => {
  return (
    <section className="py-16 bg-[#121723]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            Explore Our Curriculum
          </h2>
          <p className="text-lg text-neutral-300 mt-4 max-w-3xl mx-auto">
            From beginner to expert, we offer a range of courses to help you
            master drone technology
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Drone Piloting Fundamentals",
              level: "Beginner",
              modules: 8,
              image:
                "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
            },
            {
              title: "Advanced Flight Operations",
              level: "Intermediate",
              modules: 12,
              image:
                "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
            },
            {
              title: "Drone Programming & Automation",
              level: "Advanced",
              modules: 10,
              image:
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
            },
          ].map((course, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden shadow-card bg-[#1A1F2C] hover-lift animate-fade-in"
              style={{ "--delay": index * 0.1 + 3 } as React.CSSProperties}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="badge badge-blue bg-blue-900/40 text-blue-200 text-xs py-1 px-2 rounded">
                    {course.level}
                  </span>
                  <span className="text-sm text-neutral-400">
                    {course.modules} Modules
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {course.title}
                </h3>
                <Button
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/5 text-white"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-flytbase-secondary text-white hover:bg-flytbase-secondary/90"
          >
            View All Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CourseCategories;
