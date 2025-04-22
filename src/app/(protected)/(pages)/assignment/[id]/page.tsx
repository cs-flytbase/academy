"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTest } from "@/contexts/TestContext";
import { Clock, BarChart, ChevronLeft, Play, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { NextPage } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Inline interface for the assignment (assessment) detail.
interface AssignmentDetailData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  timeLimit: number | null; // from time_limit
  difficulty: string | null; // from difficulty
  category: string | null; // from category
  courseId: number; // from course_id
  createdAt: string; // from created_at
  questionCount: number; // Count of questions for this assessment
}

const AssignmentDetail: NextPage = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { startTest } = useTest();
  const [assignment, setAssignment] = useState<
    AssignmentDetailData | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the assignment detail from Supabase based on the id from the route
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;

      try {
        const supabase = createClient();

        // Fetch the assessment details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", Number(id))
          .single();

        if (assessmentError) {
          toast.error("Assignment not found", {
            description: "The assignment you're looking for doesn't exist.",
          });
          return;
        }

        // Get the count of questions for this assessment
        const { count: questionCount, error: questionCountError } =
          await supabase
            .from("questions")
            .select("*", { count: "exact", head: true })
            .eq("assessment_id", Number(id));

        if (questionCountError) {
          console.error("Error fetching question count:", questionCountError);
        }

        if (assessmentData) {
          // Map snake_case fields to camelCase
          const mappedAssignment: AssignmentDetailData = {
            id: assessmentData.id,
            title: assessmentData.title,
            description: assessmentData.description,
            thumbnail: assessmentData.thumbnail,
            timeLimit: assessmentData.time_limit,
            difficulty: assessmentData.difficulty,
            category: assessmentData.category,
            courseId: assessmentData.course_id,
            createdAt: assessmentData.created_at,
            questionCount: questionCount || 0,
          };
          setAssignment(mappedAssignment);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast.error("Error loading assignment", {
          description: "There was a problem loading the assignment details.",
        });
      }
    };

    fetchAssignment();
  }, [id]);

  // Show nothing if assignment not found
  if (!assignment) {
    return null;
  }

  const handleStartTest = () => {
    setIsLoading(true);

    // Set a brief timeout to show loading state
    setTimeout(() => {
      startTest(String(assignment.id), assignment.timeLimit);
      router.push(`/test/${assignment.id}`);
    }, 800);
  };

  const getDifficultyColor = () => {
    switch (assignment.difficulty) {
      case "easy":
        return "bg-emerald-500";
      case "medium":
        return "bg-amber-500";
      case "hard":
        return "bg-rose-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/assignment" className="cursor-pointer">
            <Button
              variant="ghost"
              className="cursor-pointer mb-8 group subtle-transitions"
            >
              <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Assignments
            </Button>
          </Link>

          <Card className="overflow-hidden border border-border/50 shadow-lg bg-gradient-to-b from-background to-secondary/20">

            <CardHeader className="pb-6 pt-8 px-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Certificate Assessment
                  </span>
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                    {assignment.category || "General"}
                  </span>
                  <span
                    className={`text-xs font-medium px-3 py-1.5 rounded-full text-white border border-white/10 ${getDifficultyColor()}`}
                  >
                    {assignment.difficulty || "Standard"}
                  </span>
                </div>
                
                <div>
                  <CardTitle className="text-3xl font-bold">{assignment.title}</CardTitle>
                  <CardDescription className="mt-3 text-base max-w-2xl">
                    {assignment.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-8 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-6">
                  <div className="bg-card/40 border border-border/50 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold mb-4 text-lg flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-blue-400" />
                      Test Overview
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-background/60 rounded-lg p-4 border border-border/40 flex flex-col">
                        <span className="text-sm text-muted-foreground">Questions</span>
                        <span className="text-2xl font-semibold mt-1">{assignment.questionCount}</span>
                        <span className="text-xs text-muted-foreground mt-1">Complete all to pass</span>
                      </div>
                      
                      <div className="bg-background/60 rounded-lg p-4 border border-border/40 flex flex-col">
                        <span className="text-sm text-muted-foreground">Time Limit</span>
                        <span className="text-2xl font-semibold mt-1">
                          {assignment.timeLimit ? `${assignment.timeLimit} min` : "No limit"}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">Plan your time accordingly</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card/40 border border-border/50 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold mb-4 text-lg flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-400" />
                      Test Instructions
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start">
                        <div className="bg-blue-500/10 text-blue-400 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        You will have {assignment.timeLimit ? `${assignment.timeLimit} minutes` : "no time limit"} to complete this test.
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-500/10 text-blue-400 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        The test will automatically submit when the time is up.
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-500/10 text-blue-400 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        Do not refresh or leave the page during the test.
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-500/10 text-blue-400 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        Make sure to save your answers before moving to the next question.
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-500/10 text-blue-400 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        You can review your answers before submitting.
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 sticky top-6 flex flex-col gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Ready to start?</h3>
                      <p className="text-sm text-muted-foreground">Once you begin, the timer will start and you'll need to complete all questions.</p>
                    </div>
                    
                    <Button
                      onClick={handleStartTest}
                      size="lg"
                      className="w-full py-6 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md"
                      disabled={isLoading || assignment.questionCount === 0}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Preparing Test...
                        </div>
                      ) : assignment.questionCount === 0 ? (
                        <div className="flex items-center justify-center">
                          <AlertCircle className="mr-2 h-5 w-5" />
                          No Questions Available
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Play className="mr-2 h-5 w-5" />
                          Start Test Now
                        </div>
                      )}
                    </Button>
                    
                    <div className="text-xs text-center text-muted-foreground">
                      You can pause the test at any time, but the timer will continue running.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default AssignmentDetail;
