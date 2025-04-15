import React from "react";
import { Clock } from "lucide-react";
// import UserCourses from '@/components/UserCourses';

const ContinueLearningSection = () => {
  return (
    <section className="py-12 bg-[#121723]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Clock className="mr-2 h-5 w-5" /> Continue Learning
          </h2>
          <p className="text-neutral-400 mt-1">Pick up where you left off</p>
        </div>

        {/* <UserCourses type="in_progress" limit={3} showViewAll={true} /> */}
      </div>
    </section>
  );
};

export default ContinueLearningSection;
