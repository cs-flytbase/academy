import React, { useState } from "react";

// Custom Plus Icon component that matches the Wix design
const PlusIcon = () => (
  <svg
    viewBox="0 0 54 54"
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="currentColor"
  >
    <g>
      <g>
        <g>
          <path d="M25.59 52.04l-.01-23.62-23.62-.01v-2.84l23.62.01-.01-23.62h2.84l.01 23.62 23.62.01v2.84l-23.62-.01.01 23.62h-2.84z"></path>
        </g>
        <path fill="none" d="M54 0v54H0V0h54z"></path>
      </g>
    </g>
  </svg>
);

// FAQ Item Component
const FAQItem = ({
  title,
  content,
  isOpen,
  onToggle,
}: {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="border-b border-gray-800 py-8 last:border-b-0">
      <div className="flex justify-between items-start">
        <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
          {title}
        </h3>
        <button
          onClick={onToggle}
          className="flex-shrink-0 mt-1 transform transition-transform duration-300 text-white"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-label={isOpen ? "Close section" : "Open section"}
        >
          <PlusIcon />
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 text-gray-400 transition-all duration-300 ease-in-out">
          {typeof content === "string" ? (
            <p className="text-base leading-relaxed">{content}</p>
          ) : (
            content
          )}
        </div>
      )}
    </div>
  );
};

// Main FAQ Section Component
const FAQ = () => {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const faqData = [
    {
      title: "What is FlytBase Academy?",
      content: (
        <>
          <p className="text-base leading-relaxed mb-4">
            FlytBase Academy is an online learning platform that makes it
            possible for anyone to learn and develop the most in-demand drone
            technology skills of today. Explore online courses, webinars and
            tutorials across a variety of subjects, including drone programming,
            autonomous flight, drone fleet management, and more. Additionally,
            you can earn{" "}
            <a href="#" className="text-blue-500 hover:underline">
              FlytBase Certifications
            </a>{" "}
            that show off your mastery of highly marketable drone technology
            skills.
          </p>
          <p className="text-base leading-relaxed">
            Courses, webinars and tutorials are available for streaming anytime,
            anywhere from your personal computer or smartphone.
          </p>
        </>
      ),
    },
    {
      title: "Is it free?",
      content: (
        <p className="text-base leading-relaxed">
          Yes—all courses, webinars and tutorials are completely free. So what
          are you waiting for? Browse{" "}
          <a href="#" className="text-blue-500 hover:underline">
            courses
          </a>
          , discover a new interest, build skills to grow your business, get
          certified for your accomplishments and more. Dive in and start
          learning something new today.
        </p>
      ),
    },
    {
      title: "What's included in each course?",
      content: (
        <>
          <p className="text-base leading-relaxed mb-4">
            While course activities, materials and resources vary depending on
            the topic, you can expect to find the following:
          </p>
          <ul className="list-none space-y-2">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-black rounded-full mt-2 mr-2"></span>
              <p className="text-base leading-relaxed">Online video lessons</p>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-black rounded-full mt-2 mr-2"></span>
              <p className="text-base leading-relaxed">Class notes</p>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-black rounded-full mt-2 mr-2"></span>
              <p className="text-base leading-relaxed">Articles</p>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-black rounded-full mt-2 mr-2"></span>
              <p className="text-base leading-relaxed">Practical assignments</p>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-black rounded-full mt-2 mr-2"></span>
              <p className="text-base leading-relaxed">Useful tips</p>
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "How do I get certified by FlytBase Academy?",
      content: (
        <>
          <p className="text-base leading-relaxed mb-4">
            The certification process consists of a timed certification exam
            and, in some cases, a project submission. The certification exam
            includes multiple choice questions. You must pass this exam with 75%
            accuracy or better. For certifications that require submitting a
            project, you will be given a brief with specific guidelines that
            demonstrate your skills.
          </p>
          <p className="text-base leading-relaxed mb-4">
            Prep for certification by taking a few related classes, or brush up
            your knowledge with the full course. If you feel like you have a
            good grasp of the course content, skip to the head of the class and
            start the certification process.
          </p>
          <p className="text-base leading-relaxed">
            Once you've earned your FlytBase Certificate, add it to your
            LinkedIn, CV, business website and wherever else you want to show
            off your new credentials.
          </p>
        </>
      ),
    },
    {
      title: "How can I find courses right for me?",
      content: (
        <p className="text-base leading-relaxed">
          Every course is designed with you in mind—whether you're just starting
          with drone technology or looking to advance your skills. We're
          continually updating and launching new courses, dedicated to expanding
          your personal and professional knowledge when it comes to drone
          programming and management. Explore our{" "}
          <a href="#" className="text-blue-500 hover:underline">
            course gallery
          </a>{" "}
          to see what we have and what's coming soon.
        </p>
      ),
    },
    {
      title: "What if I have more questions?",
      content: (
        <p className="text-base leading-relaxed">
          You can always contact our support team if you have any questions,
          feedback or comments. To do this, send an email to{" "}
          <a
            href="mailto:support@flytbase.com"
            className="text-blue-500 hover:underline"
          >
            support@flytbase.com
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12">
          Frequently Asked Questions
        </h2>

        <div className="rounded-3xl overflow-hidden">
          <div className="px-6 py-6 md:px-10 md:py-10">
            {faqData.map((item, index) => (
              <FAQItem
                key={index}
                title={item.title}
                content={item.content}
                isOpen={openSections[index] || false}
                onToggle={() => toggleSection(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
