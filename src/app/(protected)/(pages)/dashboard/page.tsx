"use client";

import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Award,
  Clock,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Heart,
  BookText,
  LineChart,
  Users,
  Layers,
  GraduationCap as GradCap,
  ArrowRight,
  Play,
  RefreshCw,
  Star,
  CalendarDays,
  BarChart,
  ExternalLink,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import "./progress-custom.css";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Define types for our database schema
interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: number;
  status: string;
  progress_percentage: number;
  last_accessed_at: string;
  created_at: string;
}

interface CourseWishlist {
  id: string;
  user_id: string;
  course_id: number;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  video_count: number;
  playlist_id: string;
  created_at: string;
}

interface Video {
  id: number;
  course_id: number;
}

interface Certificate {
  id: number;
  created_at: string;
  user_id: string;
  url: string;
  name: string;
  email: string;
  assessment_id: number;
}

interface CertificateWithAssessment extends Certificate {
  assessments: {
    id: number;
    title: string;
    course_id: number;
  };
  courses?: {
    id: number;
    title: string;
  };
}

interface WishlistedCourse extends Course {
  wishlisted_at: string;
}

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  video_count: number;
  progress: number;
  status: string;
  last_accessed: string;
  enrolled_at: string;
  completed_lessons: number;
  videos?: Video[];
  completed_videos?: number;
}

interface UserStats {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  wishlist_count: number;
  total_hours_spent: number;
  certificates_count: number;
  total_completed_videos: number;
}

const DashboardPage = () => {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [wishlistedCourses, setWishlistedCourses] = useState<WishlistedCourse[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_enrollments: 0,
    active_enrollments: 0,
    completed_enrollments: 0,
    wishlist_count: 0,
    total_hours_spent: 0,
    certificates_count: 0,
    total_completed_videos: 0,
  });
  const [certificates, setCertificates] = useState<CertificateWithAssessment[]>([]);
  const [videoProgress, setVideoProgress] = useState<{[key: number]: number}>({});
  const [completedVideos, setCompletedVideos] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        if (!userData.user) {
          console.log("No authenticated user found");
          setLoading(false);
          return;
        }

        setUser(userData.user);

        // 1. Fetch enrolled courses with join to courses table
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("course_enrollments")
          .select(
            `
            *,
            courses:course_id (*)
          `
          )
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false });

        let formattedCourses: EnrolledCourse[] = [];

        if (enrollmentError) {
          console.error("Error fetching enrollments:", enrollmentError);
        } else if (enrollmentData) {
          // Transform the data into EnrolledCourse format
          formattedCourses = enrollmentData.map(
            (enrollment) => {
              const course = enrollment.courses as Course;
              return {
                id: course.id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail || "/placeholder-course.jpg",
                video_count: course.video_count || 0,
                progress: enrollment.progress_percentage || 0,
                status: enrollment.status || "active",
                last_accessed:
                  enrollment.last_accessed_at || enrollment.created_at,
                enrolled_at: enrollment.created_at,
                completed_lessons: Math.floor(
                  ((course.video_count || 0) *
                    (enrollment.progress_percentage || 0)) /
                    100
                ),
              };
            }
          );
        }

        // 2. Fetch wishlisted courses with join to courses table
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("course_wishlist")
          .select(
            `
            *,
            courses:course_id (*)
          `
          )
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false });

        if (wishlistError) {
          console.error("Error fetching wishlist:", wishlistError);
        } else if (wishlistData) {
          // Transform the data into WishlistedCourse format
          const formattedWishlist: WishlistedCourse[] = wishlistData.map(
            (wishlistItem) => {
              const course = wishlistItem.courses as Course;
              return {
                ...course,
                wishlisted_at: wishlistItem.created_at,
              };
            }
          );
          setWishlistedCourses(formattedWishlist);
        }

        // 3. Fetch user certificates
        const { data: certificateData, error: certificateError } = await supabase
          .from("certificate_user")
          .select(
            `
            *,
            assessments:assessment_id (*),
            courses:assessments(courses(*))
            `
          )
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false });

        if (certificateError) {
          console.error("Error fetching certificates:", certificateError);
        } else if (certificateData) {
          setCertificates(certificateData as CertificateWithAssessment[]);
        }

        // 4. Fetch video progress data for all enrolled courses
        if (enrollmentData && enrollmentData.length > 0) {
          // First, get all course IDs
          const courseIds = enrollmentData.map(enrollment => enrollment.courses.id);
          
          // Fetch all videos for these courses
          const { data: videosData, error: videosError } = await supabase
            .from("videos")
            .select("id, course_id")
            .in("course_id", courseIds);
            
          if (videosError) {
            console.error("Error fetching videos:", videosError);
          } else if (videosData) {
            // Group videos by course
            const videosByCourse: {[key: number]: Video[]} = {};
            videosData.forEach(video => {
              if (!videosByCourse[video.course_id]) {
                videosByCourse[video.course_id] = [];
              }
              videosByCourse[video.course_id].push(video);
            });
            
            // Fetch progress for all videos
            const { data: progressData, error: progressError } = await supabase
              .from("video_watched")
              .select("*")
              .eq("user_id", userData.user.id)
              .in("video_id", videosData.map(v => v.id));
              
            if (progressError) {
              console.error("Error fetching video progress:", progressError);
            } else if (progressData) {
              // Process progress data
              const progressMap: {[key: number]: number} = {};
              const completed = new Set<number>();
              
              progressData.forEach(item => {
                progressMap[item.video_id] = item.progress_percentage || 0;
                if (item.completed) {
                  completed.add(item.video_id);
                }
              });
              
              setVideoProgress(progressMap);
              setCompletedVideos(completed);
              
              // Update the formatted courses with video progress data
              if (formattedCourses.length > 0) {
                const updatedCourses = formattedCourses.map(course => {
                  const courseVideos = videosByCourse[course.id] || [];
                  const completedCount = courseVideos.filter(video => completed.has(video.id)).length;
                  const newProgress = courseVideos.length > 0 
                    ? Math.round((completedCount / courseVideos.length) * 100) 
                    : course.progress;
                    
                  return {
                    ...course,
                    videos: courseVideos,
                    completed_videos: completedCount,
                    progress: newProgress,
                    completed_lessons: completedCount,
                    status: newProgress >= 100 ? "completed" : "active"
                  };
                });
                
                setEnrolledCourses(updatedCourses);
                formattedCourses = updatedCourses;
              }
            }
          }
        }

        // Finally, set the enrolled courses if not already done
        if (formattedCourses.length > 0 && !formattedCourses[0].videos) {
          setEnrolledCourses(formattedCourses);
        }

        // Calculate statistics
        const totalCompletedVideos = completedVideos.size || 0;
        const activeEnrollments = formattedCourses.filter(c => c.status !== "completed").length;
        const completedEnrollments = formattedCourses.filter(c => c.status === "completed").length;
        
        setStats({
          total_enrollments: formattedCourses.length,
          active_enrollments: activeEnrollments,
          completed_enrollments: completedEnrollments,
          wishlist_count: wishlistData?.length || 0,
          total_hours_spent: calculateTotalHours(enrollmentData),
          certificates_count: certificateData?.length || 0,
          total_completed_videos: totalCompletedVideos,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Helper function to calculate total learning hours
  const calculateTotalHours = (enrollments: any[] | null) => {
    if (!enrollments || enrollments.length === 0) return 0;

    let totalHours = 0;
    enrollments.forEach((enrollment) => {
      const course = enrollment.courses as Course;
      const progress = enrollment.progress_percentage || 0;
      const videoCount = course.video_count || 0;
      const watchedVideos = Math.floor((videoCount * progress) / 100);
      // Assume 15 minutes per video
      totalHours += watchedVideos * 0.25;
    });

    return totalHours;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white px-4 md:px-8 lg:px-20 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="flex justify-center items-center my-12">
            <div className="w-12 h-12 border-4 border-[#0E61DD] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center text-gray-400">
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">Sign In Required</CardTitle>
            <CardDescription className="text-center">
              Please sign in to view your dashboard
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = user.user_metadata?.full_name || "User";
    return name.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white px-4 md:px-8 lg:px-16 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with user info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg hover:shadow-xl transition duration-300 hover:border-gray-700">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-[#0E61DD]/50 shadow-md">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-[#242424] text-[#0E61DD] font-bold text-xl">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Welcome, {user.user_metadata?.full_name || "Learner"}
              </h1>
              <p className="text-gray-400 flex items-center mt-1">
                <CalendarDays className="w-4 h-4 mr-2 text-[#0E61DD]" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <Button className="bg-[#0E61DD] hover:bg-[#2C7BF2] text-white shadow-md transition-all duration-300 font-medium px-6 py-2 h-auto">
            <Link href="/course" className="flex items-center">
              Browse Courses <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#222222] border border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader className="pb-2 pt-4 px-6">
              <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-6">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-white">{stats.total_enrollments}</div>
                <div className="p-2 bg-[#0E61DD]/10 rounded-full group-hover:bg-[#0E61DD]/20 transition-colors">
                  <GraduationCap className="h-5 w-5 text-[#0E61DD]" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.active_enrollments} in progress
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader className="pb-2 pt-4 px-6">
              <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Completed</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-6">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-white">{stats.completed_enrollments}</div>
                <div className="p-2 bg-green-500/20 rounded-full group-hover:bg-green-500/30 transition-colors">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total_enrollments > 0 
                  ? `${Math.round((stats.completed_enrollments / stats.total_enrollments) * 100)}% completion rate`
                  : "No courses completed yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader className="pb-2 pt-4 px-6">
              <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Wishlist</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-6">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-white">{stats.wishlist_count}</div>
                <div className="p-2 bg-pink-500/20 rounded-full group-hover:bg-pink-500/30 transition-colors">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Saved for later
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Your courses */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="enrolled" className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 flex items-center">
                  <LineChart className="w-6 h-6 mr-2 text-[#0E61DD]" />
                  Your Learning Journey
                </h2>
                <TabsList className="bg-[#242424] p-1 border border-gray-800 shadow-md">
                  <TabsTrigger value="enrolled" className="data-[state=active]:bg-[#0E61DD] data-[state=active]:text-white transition-all duration-200 px-4 py-2">
                    All Courses
                  </TabsTrigger>
                  <TabsTrigger value="certificates" className="data-[state=active]:bg-[#0E61DD] data-[state=active]:text-white transition-all duration-200 px-4 py-2">
                    Certificates {stats.certificates_count > 0 && 
                      <span className="ml-1 bg-[#2C7BF2] text-white text-xs px-1.5 py-0.5 rounded-full">{stats.certificates_count}</span>
                    }
                  </TabsTrigger>
                </TabsList>
              </div>

            {/* ENROLLED COURSES TAB */}
            <TabsContent value="enrolled">
              {enrolledCourses.length > 0 ? (
                <div className="space-y-6">
                  {enrolledCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden bg-[#1a1a1a] border border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 lg:w-1/4 h-40 sm:h-auto relative group">
                          <img
                            src={course.thumbnail || "/placeholder-course.jpg"}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="icon" className="rounded-full bg-[#0E61DD] text-white hover:bg-[#2C7BF2] h-12 w-12">
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-semibold text-lg text-white">{course.title}</h3>
                              <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                                {course.description}
                              </p>
                            </div>
                            <Badge
                              variant={course.status === "completed" ? "default" : "outline"}
                              className={`${course.status === "completed" ? "bg-green-500 hover:bg-green-600 text-white" : "text-gray-400 border-gray-700"} px-3 py-1`}
                            >
                              {course.status === "completed" ? "Completed" : "In Progress"}
                            </Badge>
                          </div>

                          <div className="mt-6 space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-white font-medium">{course.progress}%</span>
                            </div>
                            <Progress 
                              value={course.progress} 
                              className="h-2 bg-gray-700"
                              style={{
                                "--progress-background": course.status === "completed" ? "#10b981" : "#0E61DD"
                              } as React.CSSProperties}
                            />

                            <div className="flex justify-between items-center pt-4">
                              <div className="text-sm text-gray-400">
                                <div className="flex items-center">
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  {course.completed_lessons}/{course.video_count} lessons completed
                                </div>
                              </div>

                              <Button size="sm" className="bg-[#0E61DD] hover:bg-[#2C7BF2] text-white px-4 py-2 h-auto" asChild>
                                <Link href={`/course/${course.id}`}>
                                  {course.status === "completed" ? "Review" : "Continue Learning"}
                                  <ArrowRight className="ml-2 h-3 w-3" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {enrolledCourses.length > 3 && (
                    <div className="text-center mt-8">
                      <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-2 h-auto" asChild>
                        <Link href="/my-courses">View All Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="bg-[#1a1a1a] border border-gray-800">
                  <CardHeader className="py-6">
                    <CardTitle className="text-center text-white text-xl">No Enrolled Courses</CardTitle>
                    <CardDescription className="text-center text-gray-400 mt-2">
                      You haven't enrolled in any courses yet.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-center pb-6">
                    <Button className="bg-[#0E61DD] hover:bg-[#2C7BF2] text-white px-6 py-2 h-auto" asChild>
                      <Link href="/course">Browse Courses</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            {/* CERTIFICATES TAB */}
            <TabsContent value="certificates">
              {certificates.length > 0 ? (
                <div className="space-y-6">
                  {certificates.map((certificate) => (
                    <Card key={certificate.id} className="overflow-hidden bg-[#1a1a1a] border border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 flex items-center justify-center py-8 px-6 bg-gradient-to-br from-[#0E61DD]/30 to-[#0E61DD]/10">
                          <Award className="h-16 w-16 text-[#0E61DD]" />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-lg text-white">{certificate.assessments?.title} Certificate</h3>
                              {certificate.courses && (
                                <p className="text-sm text-gray-400 mt-2">
                                  Course: {certificate.courses[0]?.title}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Earned on {new Date(certificate.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button onClick={() => window.open(certificate.url, "_blank")} 
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-auto">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Certificate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-[#1a1a1a] border border-gray-800">
                  <CardHeader className="text-center py-8">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-[#242424] mb-6">
                      <Award className="h-8 w-8 text-gray-500" />
                    </div>
                    <CardTitle className="text-center text-white text-xl">No Certificates Yet</CardTitle>
                    <CardDescription className="text-center text-gray-400 mt-2">
                      Complete assessments to earn certificates.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-center pb-6">
                    <Button className="bg-[#0E61DD] hover:bg-[#2C7BF2] text-white px-6 py-2 h-auto" asChild>
                      <Link href="/course">Continue Learning</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Recently viewed courses */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-[#0E61DD]" />
                Recently Viewed
              </h2>
              <Button variant="ghost" size="sm" className="gap-1 text-gray-400 hover:text-white hover:bg-[#242424] px-3 py-1 h-auto">
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {enrolledCourses.slice(0, 2).map((course) => (
                <Card key={`recent-${course.id}`} className="overflow-hidden bg-[#1a1a1a] border border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex">
                    <div className="w-1/3 h-28 relative">
                      <img
                        src={course.thumbnail || "/placeholder-course.jpg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a]/50"></div>
                    </div>
                    <div className="flex-1 p-4">
                      <h3 className="font-medium text-sm text-white line-clamp-1">{course.title}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <Progress 
                          value={course.progress} 
                          className="h-1.5 w-1/2 bg-gray-700 rounded-full overflow-hidden" 
                          style={{
                            "--progress-background": course.status === "completed" ? "#10b981" : "#0E61DD"
                          } as React.CSSProperties}
                        />
                        <span className="text-xs text-gray-400 ml-2">{course.progress}%</span>
                      </div>
                      <div className="mt-3">
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-[#0E61DD] hover:text-[#2C7BF2] hover:bg-[#0E61DD]/10" asChild>
                          <Link href={`/course/${course.id}`}>Continue</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Learning stats & quick links */}
        <div className="w-full lg:min-w-[300px] space-y-8">
          {/* Quick Links */}
          <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-5 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-[#0E61DD]" />
                Quick Links
              </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto py-3 px-4 border-gray-800 bg-[#1a1a1a] hover:bg-[#242424] transition-colors" asChild>
                <Link href="/course">
                  <BookOpen className="mr-3 h-5 w-5 text-primary" />
                  <span>Courses</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 px-4 border-gray-800 bg-[#1a1a1a] hover:bg-[#242424] transition-colors" asChild>
                <Link href="/my-courses">
                  <GradCap className="mr-3 h-5 w-5 text-green-500" />
                  <span>My Learning</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 px-4 border-gray-800 bg-[#1a1a1a] hover:bg-[#242424] transition-colors" asChild>
                <Link href="/assignment">
                  <BookText className="mr-3 h-5 w-5 text-amber-500" />
                  <span>Assignments</span>
                </Link>
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

  );
};

export default DashboardPage;