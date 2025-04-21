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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
}

interface UserStats {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  wishlist_count: number;
  total_hours_spent: number;
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
  });

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

        if (enrollmentError) {
          console.error("Error fetching enrollments:", enrollmentError);
        } else if (enrollmentData) {
          // Transform the data into EnrolledCourse format
          const formattedCourses: EnrolledCourse[] = enrollmentData.map(
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
          setEnrolledCourses(formattedCourses);
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

        // Calculate statistics
        setStats({
          total_enrollments: enrollmentData?.length || 0,
          active_enrollments:
            enrollmentData?.filter((e) => e.status !== "completed").length || 0,
          completed_enrollments:
            enrollmentData?.filter((e) => e.status === "completed").length || 0,
          wishlist_count: wishlistData?.length || 0,
          total_hours_spent: calculateTotalHours(enrollmentData),
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
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
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
    <div className="min-h-screen bg-background px-2 md:px-20 py-8">
      {/* Header with user info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user.user_metadata?.full_name || "Learner"}
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/course">
            Browse Courses <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{stats.total_enrollments}</div>
              <div className="p-2 bg-primary/10 rounded-full">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.active_enrollments} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{stats.completed_enrollments}</div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total_enrollments > 0 
                ? `${Math.round((stats.completed_enrollments / stats.total_enrollments) * 100)}% completion rate`
                : "No courses completed yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{stats.wishlist_count}</div>
              <div className="p-2 bg-pink-500/10 rounded-full">
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saved for later
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Learning Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{stats.total_hours_spent.toFixed(1)}</div>
              <div className="p-2 bg-amber-500/10 rounded-full">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total learning time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Your courses */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="enrolled" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Learning</h2>
              <TabsList>
                <TabsTrigger value="enrolled">All Courses</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
              </TabsList>
            </div>

            {/* ENROLLED COURSES TAB */}
            <TabsContent value="enrolled">
              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 lg:w-1/3 h-36 sm:h-auto relative group">
                          <img
                            src={course.thumbnail || "/placeholder-course.jpg"}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="icon" className="rounded-full">
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold">{course.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {course.description}
                              </p>
                            </div>
                            <Badge
                              variant={course.status === "completed" ? "default" : "outline"}
                              className={course.status === "completed" ? "bg-green-500" : ""}
                            >
                              {course.status === "completed" ? "Completed" : "In Progress"}
                            </Badge>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />

                            <div className="flex justify-between items-center pt-2">
                              <div className="text-xs text-muted-foreground">
                                <div className="flex items-center">
                                  <BookOpen className="mr-1 h-3 w-3" />
                                  {course.completed_lessons}/{course.video_count} lessons
                                </div>
                              </div>

                              <Button size="sm" asChild>
                                <Link href={`/course/${course.id}`}>
                                  {course.status === "completed" ? "Review" : "Continue"}
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {enrolledCourses.length > 3 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" asChild>
                        <Link href="/my-courses">View All Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="bg-muted/40">
                  <CardHeader>
                    <CardTitle className="text-center">No Enrolled Courses</CardTitle>
                    <CardDescription className="text-center">
                      You haven't enrolled in any courses yet.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-center">
                    <Button asChild>
                      <Link href="/course">Browse Courses</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            {/* CERTIFICATES TAB */}
            <TabsContent value="certificates">
              <Card className="bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-center">No Certificates Yet</CardTitle>
                  <CardDescription className="text-center">
                    Complete courses to earn certificates.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <Button asChild>
                    <Link href="/course">Continue Learning</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recently viewed courses */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recently Viewed</h2>
              <Button variant="ghost" size="sm" className="gap-1">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrolledCourses.slice(0, 2).map((course) => (
                <Card key={`recent-${course.id}`} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-1/3 h-24 relative">
                      <img
                        src={course.thumbnail || "/placeholder-course.jpg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-3">
                      <h3 className="font-medium text-sm line-clamp-1">{course.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <Progress value={course.progress} className="h-1 w-1/2" />
                        <span className="text-xs text-muted-foreground">{course.progress}%</span>
                      </div>
                      <div className="mt-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
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
        <div>
          {/* Learning activity */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Learning Activity</CardTitle>
              <CardDescription>Your learning trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] flex items-end justify-between gap-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  const height = Math.floor(Math.random() * (100 - 10) + 10);
                  return (
                    <div key={i} className="relative w-full">
                      <div
                        className="bg-primary/20 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="absolute -bottom-5 w-full text-center text-xs text-muted-foreground">
                        {["M", "T", "W", "T", "F", "S", "S"][i]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between">
                <div className="text-center">
                  <h4 className="text-sm font-medium">Current Streak</h4>
                  <p className="text-2xl font-bold">3 Days</p>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-medium">Hours This Week</h4>
                  <p className="text-2xl font-bold">8.5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming deadlines */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-muted p-2 rounded mr-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Final Project Submission</h4>
                    <p className="text-xs text-muted-foreground">Due in 5 days</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-muted p-2 rounded mr-3">
                    <BookText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Module 3 Quiz</h4>
                    <p className="text-xs text-muted-foreground">Due in 2 days</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Tasks
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/course">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  <span>Courses</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/my-courses">
                  <GradCap className="mr-2 h-5 w-5 text-green-500" />
                  <span>My Learning</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/assignment">
                  <BookText className="mr-2 h-5 w-5 text-amber-500" />
                  <span>Assignments</span>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/profile">
                  <Users className="mr-2 h-5 w-5 text-pink-500" />
                  <span>Profile</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background px-2 md:px-20 py-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-1" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-3 w-28 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
          
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
        
        <div>
          <Skeleton className="h-[300px] w-full mb-6" />
          <Skeleton className="h-[180px] w-full mb-6" />
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;