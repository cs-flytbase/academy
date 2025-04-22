"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  GraduationCap, 
  Award, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Video,
  Heart,
  FileText 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import CourseCard from "@/components/ui/course-card";
// import CertificateAssessmentCard from "@/components/ui/certificate-assessment-card";

const CourseCertificateSwitcher = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [visibleItems, setVisibleItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [autoplay, setAutoplay] = useState(true);
  const [coursesData, setCoursesData] = useState([]);
  const [certificatesData, setCertificatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const autoplayTimerRef = useRef(null);
  const autoplayDelay = 5000; // 5 seconds
  const supabase = createClient();

  // Fetch courses and certificates from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch courses
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
        } else {
          // Format courses data as needed
          const formattedCourses = courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description || "Learn new skills with this course.",
            thumbnail: course.thumbnail || "/placeholder-course.jpg",
            duration: course.watch_hour || formatDuration(calculateEstimatedDuration(course.video_count || 0)),
            videoCount: course.video_count || 0,
            level: "All Levels" // Not in schema, using default
          }));
          setCoursesData(formattedCourses);
        }
        
        // Fetch assessments (certificates)
        const { data: assessments, error: assessmentsError } = await supabase
          .from("assessments")
          .select("*, courses(title)")
          .order("created_at", { ascending: false });
        
        if (assessmentsError) {
          console.error("Error fetching assessments:", assessmentsError);
        } else {
          // Format assessments data as certificates
          const formattedAssessments = assessments.map(assessment => ({
            id: assessment.id,
            title: assessment.title,
            description: assessment.description || "Complete this assessment to earn certification.",
            thumbnail: assessment.thumbnail || "/placeholder-certificate.jpg",
            requirements: `${assessment.time_limit ? (assessment.time_limit + ' minutes') : 'Timed assessment'}`,
            level: assessment.difficulty || "Professional",
            credentialValidity: "2 years", // Default validity not in schema
            relatedCourse: assessment.courses?.title || "Independent Assessment"
          }));
          setCertificatesData(formattedAssessments);
        }
      } catch (error) {
        console.error("Error in data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const calculateEstimatedDuration = (videoCount) => {
    // Assuming average video is 15 minutes
    return videoCount * 15;
  };

  // Format duration helper function
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Update items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update visible items when tab, index, or items per page changes
  useEffect(() => {
    const items = activeTab === "courses" ? coursesData : certificatesData;
    const endIndex = Math.min(currentIndex + itemsPerPage, items.length);
    setVisibleItems(items.slice(currentIndex, endIndex));
  }, [activeTab, currentIndex, itemsPerPage, coursesData, certificatesData]);

  // Handle autoplay
  useEffect(() => {
    if (autoplay && !loading) {
      autoplayTimerRef.current = setInterval(() => {
        handleNext();
      }, autoplayDelay);
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplay, currentIndex, activeTab, loading]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);

  const handlePrev = () => {
    const items = activeTab === "courses" ? coursesData : certificatesData;
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    const items = activeTab === "courses" ? coursesData : certificatesData;
    const maxIndex = Math.max(0, items.length - itemsPerPage);
    
    if (currentIndex >= maxIndex) {
      // If we're at the end, switch tabs and reset index
      setActiveTab(prev => prev === "courses" ? "certificates" : "courses");
      setCurrentIndex(0);
    } else {
      // Otherwise, advance to the next item
      setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    }
  };

  // Reset index when tab changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  const currentData = activeTab === "courses" ? coursesData : certificatesData;
  const hasNext = currentIndex < currentData.length - itemsPerPage;
  const hasPrev = currentIndex > 0;

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold mb-4 md:mb-0 text-white">
            Expand Your Knowledge
          </h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-auto grid-cols-2 bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="courses" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <GraduationCap className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Award className="h-4 w-4" />
                Assessments
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-10 w-10 rounded-full blur-md bg-blue-600/30 animate-pulse" />
            </div>
            <span className="ml-4 text-lg text-white">Loading content...</span>
          </div>
        ) : (
          <div 
            className="relative" 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Navigation buttons */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 z-10">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-zinc-900/80 backdrop-blur-sm border-zinc-700 hover:bg-blue-600/20 hover:border-blue-500/50 text-white"
                onClick={handlePrev}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 z-10">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-zinc-900/80 backdrop-blur-sm border-zinc-700 hover:bg-blue-600/20 hover:border-blue-500/50 text-white"
                onClick={handleNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Carousel content - now with better spacing for new cards */}
            <div className="overflow-hidden py-8">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${activeTab}-${currentIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {currentData.length === 0 ? (
                    <div className="col-span-full text-center py-10">
                      <p className="text-muted-foreground">No {activeTab} available at the moment.</p>
                    </div>
                  ) : (
                    activeTab === "courses" ? (
                      // Courses display
                      visibleItems.map((course) => (
                    <Card key={course.id} className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
                      <div className="relative h-48">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 right-0 m-3">
                          <Badge variant="secondary" className="bg-black/70 text-white">
                            {course.level}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold line-clamp-1">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {course.duration}
                          </div>
                          <div>{course.videoCount} videos</div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          asChild
                        >
                          <Link href={`/course/${course.id}`}>
                            Start Learning
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))) : (
                    // Certificates display (actually Assessments)
                    visibleItems.map((assessment) => (
                      <Card key={assessment.id} className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
                        <div className="relative h-48">
                          <img 
                            src={assessment.thumbnail} 
                            alt={assessment.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 right-0 m-3">
                            <Badge className="bg-primary text-primary-foreground">
                              {assessment.level}
                            </Badge>
                          </div>
                          {assessment.relatedCourse && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-xs">
                              Related course: {assessment.relatedCourse}
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-bold line-clamp-1">{assessment.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                            {assessment.description}
                          </p>
                          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Award className="mr-1 h-4 w-4" />
                              {assessment.requirements}
                            </div>
                            <div>Category: {assessment.category || 'General'}</div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            variant="outline"
                            asChild
                          >
                            <Link href={`/assignment/${assessment.id}`}>
                              Take Assessment
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )
                )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination dots */}
            {currentData.length > itemsPerPage && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(currentData.length / itemsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index * itemsPerPage)}
                    className={`h-2 rounded-full transition-all ${
                      Math.floor(currentIndex / itemsPerPage) === index 
                        ? "w-6 bg-primary" 
                        : "w-2 bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
                  </div>
        )}
        
        {!loading && currentData.length > 0 && (
          <div className="mt-10 text-center">
            <Button 
              variant="outline" 
              size="lg"
              asChild
            >
              <Link href={activeTab === "courses" ? "/course" : "/assignment"}>
                View All {activeTab === "courses" ? "Courses" : "Assessments"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseCertificateSwitcher;