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
import { TestProvider, useTest } from "@/contexts/TestContext";
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
    <TestProvider>
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

          <Card className="overflow-hidden border border-border/50 shadow-sm">
            <div
              className="h-64 w-full bg-cover bg-center border-b border-border/10"
              style={{
                backgroundImage: `url(${
                  assignment.thumbnail ||
                  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop"
                })`,
              }}
            />

            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {assignment.category || "General"}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full text-white ${getDifficultyColor()}`}
                    >
                      {assignment.difficulty || "N/A"}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {assignment.description}
                  </CardDescription>
                </div>

                <Button
                  onClick={handleStartTest}
                  className="cursor-pointer w-full md:w-auto shadow-sm min-w-36 py-6 subtle-transitions"
                  disabled={isLoading || assignment.questionCount === 0}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Preparing Test...
                    </div>
                  ) : assignment.questionCount === 0 ? (
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      No Questions Available
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </div>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-foreground">Time Limit</p>
                      <p className="text-sm">
                        {assignment.timeLimit
                          ? `${assignment.timeLimit} minutes`
                          : "No limit"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-foreground">Questions</p>
                      <p className="text-sm">
                        {assignment.questionCount} questions to complete
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
                  <h3 className="font-medium mb-2">Test Instructions</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>
                      • You will have{" "}
                      {assignment.timeLimit
                        ? `${assignment.timeLimit} minutes`
                        : "no time limit"}{" "}
                      to complete this test.
                    </li>
                    <li>
                      • The test will automatically submit when the time is up.
                    </li>
                    <li>• Do not refresh or leave the page during the test.</li>
                    <li>
                      • Make sure to save your answers before moving to the next
                      question.
                    </li>
                    <li>• You can review your answers before submitting.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TestProvider>
  );
};

export default AssignmentDetail;
