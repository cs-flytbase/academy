"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ArrowRight, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Layout from "@/components/Layout/layout";
import ParallexCard from "@/components/ParallexCard";
import FAQ from "@/components/FAQ";

const VideoLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    // Autoplay video when component mounts
    if (videoRef.current) {
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            // Auto-play was prevented
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    }
  }, []);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header/Navigation */}
        {/* <header className="border-b border-border">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="font-bold text-2xl text-primary">
                    LearnHub
                  </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                  <Link
                    href="/courses"
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Video Library
                  </Link>
                  <Link
                    href="/certifications"
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Certifications
                  </Link>
                  <Link
                    href="/academy"
                    className="flex items-center text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Studio Academy <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 bg-muted rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm w-48"
                  />
                </div>

                <div className="hidden md:block">
                  <ModeToggle />
                </div>

                <Button variant="outline" className="hidden md:inline-flex">
                  Log In
                </Button>

                <Button className="hidden md:inline-flex">Sign Up</Button>

                <button
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>
        </header> */}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-b border-border">
            <div className="container py-4 px-4 space-y-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/courses"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  Video Library
                </Link>
                <Link
                  href="/certifications"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  Certifications
                </Link>
                <Link
                  href="/academy"
                  className="flex items-center text-foreground/80 hover:text-foreground transition-colors"
                >
                  Studio Academy <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </nav>

              <div className="flex items-center relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 bg-muted rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm w-full"
                />
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" className="flex-1">
                  Log In
                </Button>

                <Button className="flex-1">Sign Up</Button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section with Video */}
        {/* Hero Section with Video - Nearly Full Width */}
        <section className="relative py-6 px-4 md:px-5">
          {/* Outer container with very wide max width */}
          <div className="container mx-auto max-w-[95%]">
            {/* Video wrapper with shadow and rounded corners */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100/10">
              {/* Overlay with headline text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 px-4">
                <div className="text-center max-w-5xl pt-32">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                    You know what you want to accomplish.{" "}
                    <span className="text-yellow-400">Now learn how.</span>
                  </h1>

                  <div className="mt-8">
                    <motion.div
                      className="relative inline-block cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 15
                      }}
                      onClick={() => window.location.href = '/course'}
                    >
                      <Button
                        size="lg"
                        className="bg-[#171717]  text-white rounded-full px-8 relative z-10 overflow-hidden"
                        asChild
                      >
                        <motion.div className="group">
                          <div className="flex items-center relative z-10">
                            <span className="mr-2 relative z-10 text-white group-hover:text-black transition-colors duration-300">
                              Start Learning
                            </span>
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ 
                                repeat: Infinity, 
                                repeatType: "reverse", 
                                duration: 1,
                                ease: "easeInOut"
                              }}
                              className="relative z-10 text-white group-hover:text-black transition-colors duration-300"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </motion.span>
                          </div>
                          <motion.div 
                            className="absolute inset-0 bg-white rounded-full z-0"
                            initial={{ scale: 0, opacity: 0 }}
                            whileHover={{ 
                              scale: 1, 
                              opacity: 1,
                              borderRadius: "0%",
                              transition: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] } 
                            }}
                          />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Video Background */}
              <div className="relative w-full h-[calc(100vh-100px)] min-h-[600px] overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute w-full h-full object-cover"
                  muted
                  autoPlay
                  loop
                  onClick={handlePlayPause}
                >
                  <source src="/intro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section with Real Images */}
        <section className="py-16 md:py-24 bg-[#0B0B0B] text-white">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Testimonial 1 */}
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="mb-8 h-16 flex items-center">
                  <img
                    src="https://cdn.prod.website-files.com/65cf50589440654730dd6e6f/665722fc6555054b89f52e9b_download%204.png"
                    alt="Drone Flight Academy"
                    className="h-24 object-contain"
                  />
                </div>

                {/* Testimonial Content */}
                <div className="mb-8 flex-grow">
                  <p className="text-lg text-gray-300 leading-relaxed">
                    FlytBase Academy helped me get to know FlytBase. With the
                    short videos about all the different topics, it was easy to
                    guide myself through the software. I've learned things which
                    I didn't even know were available on the platform. I
                    recommend the FlytBase Academy to everyone who will use the
                    software, even if you're an advanced user. We are looking
                    forward to new modules and videos!
                  </p>
                </div>

                {/* Profile */}
                <div className="flex items-center mt-auto">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-gray-700">
                    <img
                      src="https://cdn.prod.website-files.com/65cf50589440654730dd6e6f/6657253fc908a0d8cf741fa7_IMG_7611%20(1).jpg"
                      alt="Job Vermeulen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">Job Vermeulen</h4>
                    <p className="text-gray-400">Drone Flight Academy</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="mb-8 h-16 flex items-center">
                  <img
                    src="https://cdn.prod.website-files.com/65cf50589440654730dd6e6f/6672e18b3fa4a47bde4770e6_Groupe%20Protec%20Logo.png"
                    alt="Protec Groupe"
                    className="h-14 object-contain"
                  />
                </div>

                {/* Testimonial Content */}
                <div className="mb-8 flex-grow">
                  <p className="text-lg text-gray-300 leading-relaxed">
                    As a security company specializing in autonomous drone
                    solutions, seamless integration with Video Management
                    Systems like Milestone is crucial for delivering robust
                    security solutions to our clients. The 'One Click
                    Integrations with Flinks' course from FlytBase Academy
                    accelerated our VMS integration with simplified setup
                    procedures. Following the course instructions, I swiftly
                    configured our drone video feed within our Milestone VMS,
                    ensuring operational readiness.
                  </p>
                </div>

                {/* Profile */}
                <div className="flex items-center mt-auto">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-gray-700">
                    <img
                      src="https://cdn.prod.website-files.com/65cf50589440654730dd6e6f/6672e0e309ed887628ee9d0e_WhatsApp%20Image%202024-06-18%20at%2017.22.51.jpeg"
                      alt="Glenn Kinkenberg"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">Glenn Kinkenberg</h4>
                    <p className="text-gray-400">Groupe Protec</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why FlytBase Academy Section */}
        <section className="py-16 md:py-24 text-white">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  Why FlytBase
                  <br />
                  Academy?
                </h2>
              </div>
              <div className="flex flex-col justify-center max-w-xl">
                <p className="text-lg text-gray-300 mb-6">
                  Enhance industry awareness, bridge skill gaps, and maximize
                  the ROI of your autonomous drone program.
                </p>
                <div>
                  <button className="text-primary font-medium text-lg hover:underline">
                    See Courses
                  </button>
                </div>
              </div>
            </div>

            {/* Three cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
                <div className="w-12 h-12 bg-[#232323] rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Flexible Learning</h3>
                <p className="text-gray-400">
                  Master autonomous drone operations at your own pace with our
                  remote and self-paced training programs.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
                <div className="w-12 h-12 bg-[#232323] rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Comprehensive Curriculum
                </h3>
                <p className="text-gray-400">
                  Explore autonomous drone technology through our tailor-made
                  courses. Covering all industry aspects from foundation to
                  advanced levels, we ensure learners at any stage gain
                  comprehensive skills and insights.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
                <div className="w-12 h-12 bg-[#232323] rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Industry-Expert Led</h3>
                <p className="text-gray-400">
                  Learn directly from industry leaders at the forefront of
                  autonomous drone operations. Our courses are led by experts
                  actively shaping enterprise solutions across diverse
                  applications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Certification Section */}
        <section className="py-16 md:py-24 text-white">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  Make it official.
                  <br />
                  Get certified.
                </h2>
              </div>
              <div className="flex flex-col justify-center max-w-xl">
                <p className="text-lg text-gray-300">
                  Whether you're new to autonomous drone operations, a seasoned
                  remote operator, or a system integrator developing solutions
                  for enterprises, there's a certification for you.
                </p>
              </div>
            </div>

            {/* Three cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
                <div className="w-12 h-12 bg-[#232323] rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Gain Comprehensive Industry Knowledge
                </h3>
                <p className="text-gray-400">
                  Master the autonomous drone industry—from essential components
                  and solution development to flight safety and compliance.
                  Understand the full impact of autonomy in your sector.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
                <div className="w-12 h-12 bg-[#232323] rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Boost Confidence and Credibility
                </h3>
                <p className="text-gray-400">
                  Stand out in the drone community with FlytBase certifications,
                  demonstrating your leadership in autonomous operations or
                  drone solution delivery.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
                <div className="w-12 h-12 bg-[#232323] rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Fuel Growth in the Autonomous Drone Industry
                </h3>
                <p className="text-gray-400">
                  Consider FlytBase certifications as an investment in your
                  future, setting you up for leadership in drone autonomy and
                  promoting your personal, professional, and business
                  advancement.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Featured Courses Section (Optional) */}
        {/* Wix-Style Courses Section */}

        {/* <ParallexCard/> */}
        {/* Know Your Stuff Section with Fixed CSS */}

        {/* FAQ Section */}
        <FAQ />
      </div>
    </Layout>
  );
};

export default VideoLandingPage;
