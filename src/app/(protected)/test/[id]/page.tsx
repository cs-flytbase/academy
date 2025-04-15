"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTest } from "@/contexts/TestContext";
import Timer from "@/components/Timer";
import TestNavigation from "@/components/TestNavigation";
import WarningModal from "@/components/WarningModal";
import SubmitModal from "@/components/SubmitModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  X,
  Menu,
  Save,
  Award,
  Download,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CertificateModal from "@/components/CertificateModal";

// Interface for question options
interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

// Interface for questions
interface Question {
  id: string;
  text: string;
  type: string;
  options?: QuestionOption[];
  assessment_id: number;
  video_id?: string;
  difficulty?: string;
}

// Interface for assignment/assessment
interface Assignment {
  id: number;
  title: string;
  description: string;
  timeLimit: number | null;
  questions: Question[];
  thumbnail?: string;
}

// Interface for test results
interface TestResults {
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  passed: boolean;
  answers: {
    question: Question;
    optionText?: string;
    answer: string | string[];
    isCorrect: boolean;
  }[];
}

// Interface for certificate form data
interface CertificateFormData {
  fullName: string;
  designation: string;
  email: string;
}

const TestPage = () => {
  const [showCertModal, setShowCertModal] = useState(false);
  const { id } = useParams<{ id: string }>();
  const attemptCreatedRef = useRef(false);
  const router = useRouter();
  const supabase = createClient();
  const { testState, setAnswer, submitTest, clearTest } = useTest();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [localAnswer, setLocalAnswer] = useState<string | string[]>("");
  const [reviewMarks, setReviewMarks] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  // Test results state
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "review">("summary");
  const [currentUser, setCurrentUser] = useState(null);
  const [courseTitle, setCourseTitle] = useState("Loading...");
  // Certificate state
  const [certificateModalOpen, setShowCertificateModal] = useState(false);
  const [certificateFormData, setCertificateFormData] =
    useState<CertificateFormData>({
      fullName: "",
      designation: "",
      email: "",
    });
  const [certificateGenerated, setShowCertificate] = useState(false);
  const [certificateId, setCertificateId] = useState<string>("");
  const [existingCertificate, setExistingCertificate] = useState(null);
  // Get the current question
  const currentQuestion = assignment?.questions[currentQuestionIndex];
  const checkExistingCertificate = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from("certificate_user")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking for existing certificate:", error);
        return null;
      }

      return data; // Will be null if no certificate exists
    } catch (error) {
      console.error("Error in checkExistingCertificate:", error);
      return null;
    }
  };

  // Add this to your useEffect that loads course data
  useEffect(() => {
    // Define an inner async function
    const fetchData = async () => {
      // Your existing course data loading code...
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setCurrentUser(userData.user);
      }
      // Fetch course details with a single query
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description")
        .eq("id", courseId)
        .single();

      if (courseError) {
        console.error("Error fetching course:", courseError);
        return;
      }

      if (courseData) {
        setCourseTitle(courseData.title);
      }

      // Add this to check for existing certificate
      const cert = await checkExistingCertificate();
      setExistingCertificate(cert);
    };

    // Call the async function
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  // Function to open certificate URL
  const openCertificate = () => {
    if (existingCertificate?.url) {
      window.open(existingCertificate.url, "_blank");
    } else {
      alert("Certificate URL not available. Please contact support.");
    }
  };
  const generateCertificate = () => {
    setShowCertModal(true);
  };
  const handleCertificateSuccess = async () => {
    // Refresh the certificate status
    const updatedCert = await checkExistingCertificate();
    setExistingCertificate(updatedCert);
  };
  // Create attempt record when test starts
  const createAttemptRecord = async () => {
    if (!user?.id || !assignment) return;

    try {
      setIsSaving(true);

      // Check for existing attempts to determine attempt number
      const { data: existingAttempts, error: attemptError } = await supabase
        .from("assessment_attempts")
        .select("attempt_number")
        .eq("user_id", user.id)
        .eq("assessment_id", Number(id))
        .order("attempt_number", { ascending: false })
        .limit(1);

      if (attemptError) {
        console.error("Error checking existing attempts:", attemptError);
        return;
      }

      const attemptNumber =
        existingAttempts && existingAttempts.length > 0
          ? existingAttempts[0].attempt_number + 1
          : 1;

      // Create the attempt record with "in_progress" status
      const startTime = new Date().toISOString();

      const { data: attemptData, error: insertAttemptError } = await supabase
        .from("assessment_attempts")
        .insert({
          user_id: user.id,
          assessment_id: Number(id),
          attempt_number: attemptNumber,
          started_at: startTime,
          status: "in_progress", // Mark as in progress until submitted
        })
        .select()
        .single();

      if (insertAttemptError) {
        console.error("Error creating attempt record:", insertAttemptError);
        toast.error("Failed to start test", {
          description: "Please try refreshing the page.",
        });
        return;
      }

      // Store the attempt ID for later use
      setAttemptId(attemptData.id);
      console.log("Attempt created with ID:", attemptData.id);

      // After creating the attempt, load any existing answers
      await loadExistingAnswers(attemptData.id);
    } catch (error) {
      console.error("Error creating attempt:", error);
      toast.error("Failed to start test", {
        description: "Please try refreshing the page.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load existing answers for this attempt (in case of browser refresh)
  const loadExistingAnswers = async (currentAttemptId: number) => {
    try {
      const { data: existingAnswers, error } = await supabase
        .from("user_answers")
        .select("*")
        .eq("attempt_id", currentAttemptId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading existing answers:", error);
        return;
      }

      if (existingAnswers && existingAnswers.length > 0) {
        // Create a temporary object to hold answers
        const answersToRestore: Record<string, string | string[]> = {};

        // Process each answer and add to our local state
        existingAnswers.forEach((answer) => {
          if (answer.selected_option_id) {
            // For multiple choice
            answersToRestore[answer.question_id] = answer.selected_option_id;
          } else if (answer.essay_text) {
            // For essay questions
            answersToRestore[answer.question_id] = answer.essay_text;
          }
        });

        // Restore all answers at once by updating testState
        Object.entries(answersToRestore).forEach(([questionId, answer]) => {
          setAnswer(questionId, answer);
        });
      }
    } catch (error) {
      console.error("Error loading existing answers:", error);
    }
  };

  // Save or update an answer in the database
  const saveAnswerToDatabase = async (
    questionId: string,
    answer: string | string[]
  ) => {
    if (!attemptId || !user?.id || !questionId) return;

    try {
      setIsSaving(true);

      // Determine if this is a multiple-choice or essay question
      const isMultipleChoice = typeof answer === "string";

      // Check if this answer already exists
      const { data: existingAnswer, error: checkError } = await supabase
        .from("user_answers")
        .select("*")
        .eq("question_id", questionId)
        .eq("attempt_id", attemptId)
        .eq("user_id", user.id);

      if (checkError) {
        console.error("Error checking existing answer:", checkError);
        return;
      }

      if (existingAnswer && existingAnswer.length > 0) {
        // Update existing answer
        const { error: updateError } = await supabase
          .from("user_answers")
          .update({
            selected_option_id: isMultipleChoice ? answer : null,
            essay_text: !isMultipleChoice ? answer : null,
          })
          .eq("id", existingAnswer[0].id);

        if (updateError) {
          console.error("Error updating answer:", updateError);
          toast.error("Failed to save answer", {
            description: "Your answer may not be saved.",
          });
        }
      } else {
        // Insert new answer
        const { error: insertError } = await supabase
          .from("user_answers")
          .insert({
            question_id: questionId,
            user_id: user.id,
            attempt_id: attemptId,
            selected_option_id: isMultipleChoice ? answer : null,
            essay_text: !isMultipleChoice ? answer : null,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error inserting answer:", insertError);
          toast.error("Failed to save answer", {
            description: "Your answer may not be saved.",
          });
        }
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate test results based on user answers
  const calculateTestResults = () => {
    if (!assignment) return null;

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const detailedAnswers: TestResults["answers"] = [];

    // Collection to store option texts for logging
    const optionTextLog: Record<string, string> = {};

    // Process each question
    assignment.questions.forEach((question) => {
      const userAnswer = testState.answers[question.id];
      let isCorrect = false;
      let optionText: string | undefined = undefined;

      // For multiple choice questions
      if (question.type === "multiple-choice") {
        const selectedOption = question.options?.find(
          (opt) => opt.id === userAnswer
        );

        // Store the option text if an option was selected
        if (selectedOption) {
          optionText = selectedOption.text;
          // Add to our log collection
          optionTextLog[question.id] = optionText;
        }

        // Check if any option is correct when no answer is selected
        if (typeof userAnswer === "undefined") {
          const hasCorrectOptions = question.options?.some(
            (opt) => opt.is_correct
          );
          if (!hasCorrectOptions) isCorrect = true; // Handle questions with no correct options
        } else {
          isCorrect = selectedOption?.is_correct || false;
        }

        if (isCorrect) correctCount++;
        else if (typeof userAnswer !== "undefined") incorrectCount++;
        else unansweredCount++;
      }
      // For essay questions
      else {
        isCorrect = false; // Essay questions not counted in score
        if (typeof userAnswer === "undefined") unansweredCount++;
        else incorrectCount++; // Count as incorrect for scoring purposes
      }

      detailedAnswers.push({
        question,
        answer: userAnswer || "",
        optionText, // This will be undefined for essay questions or unanswered questions
        isCorrect,
      });
    });

    // Log the collected option texts
    console.log("Selected option texts:", optionTextLog);

    // Calculate percentage score based on ALL questions
    const totalQuestions = assignment.questions.length;
    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    // Determine if the user passed (80% or higher)
    const passed = score >= 80;

    const results = {
      score,
      correctCount,
      incorrectCount: incorrectCount + unansweredCount,
      unansweredCount,
      passed,
      answers: detailedAnswers,
    };

    // Log the entire results object
    console.log("Test results with option texts:", results);

    return results;
  };
  // Handle saving answer to both context and database
  const handleSetAnswer = (questionId: string, answer: string | string[]) => {
    // First, update local state through the context
    setAnswer(questionId, answer);

    // Then save to database
    saveAnswerToDatabase(questionId, answer);
  };

  // Handle generating certificate
  // Updated handleGenerateCertificate function to fix the "undefined" error

  const handleGenerateCertificate = async () => {
    if (!user?.id || !assignment || !testResults) {
      toast.error("Missing required information for certificate generation");
      return;
    }

    try {
      setSubmitting(true);

      // Validate required fields
      if (!certificateFormData.fullName.trim()) {
        toast.error("Full name is required");
        return;
      }

      if (!certificateFormData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Prepare answers for storage - serialize to avoid circular references
      const processedAnswers = testResults.answers.map((item) => ({
        question_id: item.question.id,
        question_text: item.question.text,
        question_type: item.question.type,
        answer_id: typeof item.answer === "string" ? item.answer : "",
        answer_text: item.optionText || "",
        is_correct: item.isCorrect,
      }));

      // Create unique certificate ID
      const certificateId = `FB-CERT-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Create certificate payload - only include fields that exist in your database table
      const certificateData = {
        user_id: user.id,
        assessment_id: Number(id),
        attempt_id: attemptId,
        full_name: certificateFormData.fullName.trim(),
        designation: certificateFormData.designation.trim(),
        email: certificateFormData.email.toLowerCase().trim(),
        score: testResults.score,
        certificate_id: certificateId,
        issued_at: new Date().toISOString(),
        // Remove answer_data temporarily to test if that's causing the issue
      };

      // Log the exact data we're sending to the database
      console.log(
        "Certificate data for insert:",
        JSON.stringify(certificateData, null, 2)
      );

      // Perform insert without the answers first to test
      // const { data, error } = await supabase
      //   .from("certificates")
      //   .insert(certificateData)
      //   .select();

      // Full error inspection
      // if (error) {
      //   console.error(
      //     "Full Supabase error object:",
      //     JSON.stringify(error, null, 2)
      //   );
      //   console.error("Error code:", error.code);
      //   console.error("Error message:", error.message);
      //   console.error("Error details:", error.details);

      //   // Try to provide a meaningful error message
      //   let errorMessage = "Database error";
      //   if (error.message) errorMessage += `: ${error.message}`;
      //   if (error.details) errorMessage += ` (${error.details})`;

      //   toast.error(errorMessage);
      //   return;
      // }

      // Check if we got data back
      // if (!data || data.length === 0) {
      //   console.error("No data returned from certificate creation");
      //   toast.error("Failed to create certificate record");
      //   return;
      // }

      // console.log("Certificate created successfully:", data[0]);

      // Now try to update with answers in a separate operation
      // This helps isolate if the answers data is causing problems
      // try {
      //   const serializedAnswers = JSON.stringify(processedAnswers);

      //   const { error: updateError } = await supabase
      //     .from("certificates")
      //     .update({ answer_data: serializedAnswers })
      //     .eq("id", data[0].id);

      //   if (updateError) {
      //     console.error("Error saving answers:", updateError);
      //     // Continue anyway since the certificate was created
      //   }
      // } catch (answerError) {
      //   console.error("Error updating with answers:", answerError);
      //   // Continue anyway
      // }

      // Success handling
      setShowCertificateModal(false);
      setShowCertificate(true);
      setCertificateId(certificateId);
      toast.success("Certificate generated successfully!");

      // No need to attempt PDF generation if there were issues
    } catch (error) {
      console.error("Certificate generation catch-all error:", error);

      // Handle any type of error
      let errorMessage = "Failed to generate certificate";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle sidebar based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Auto-hide sidebar on small screens, show on larger screens
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create attempt when test starts
  useEffect(() => {
    if (
      user &&
      assignment &&
      testState.isActive &&
      !attemptId &&
      !attemptCreatedRef.current
    ) {
      attemptCreatedRef.current = true; // Mark attempt creation as initiated
      createAttemptRecord();
    }
  }, [user, assignment, testState.isActive, attemptId]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
          return;
        }

        setUser(user);
        if (user?.user_metadata?.full_name) {
          setCertificateFormData((prev) => ({
            ...prev,
            fullName: user.user_metadata.full_name,
            email: user.email || "",
          }));
        }
      } catch (error) {
        console.error("Error in fetchUser:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch assignment and questions data
  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);

        // 1. Fetch the assessment details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", Number(id))
          .single();

        if (assessmentError) {
          throw new Error(
            `Error fetching assessment: ${assessmentError.message}`
          );
        }
        console.log("assessmentData:", assessmentData);
        if (!assessmentData) {
          toast.error("Assignment not found");
          router.push("/assignment");
          return;
        }

        // 2. Fetch questions related to this assessment
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("assessment_id", Number(id))
          .eq("is_assessment", true);

        if (questionsError) {
          throw new Error(
            `Error fetching questions: ${questionsError.message}`
          );
        }

        if (!questionsData || questionsData.length === 0) {
          toast.error("No questions found for this test", {
            description: "This test doesn't have any questions yet.",
          });
          router.push(`/assignment/${id}`);
          return;
        }

        // Process questions to get options for multiple-choice questions
        const processedQuestions = await Promise.all(
          questionsData.map(async (question) => {
            let options = [];

            // If question type is multiple-choice, fetch options
            if (question.question_type === "multiple-choice") {
              const { data: optionsData, error: optionsError } = await supabase
                .from("question_options")
                .select("*")
                .eq("question_id", question.id);

              if (optionsError) {
                console.error(
                  `Error fetching options for question ${question.id}:`,
                  optionsError
                );
              } else if (optionsData && optionsData.length > 0) {
                // Map database field names to expected format
                options = optionsData.map((option) => ({
                  id: option.id,
                  text: option.option_text || option.text, // Try both field names
                  is_correct: option.is_correct,
                }));
              } else {
                console.warn(`No options found for question ${question.id}`);
              }
            }

            return {
              id: question.id,
              text: question.question_text || question.text, // Try both field names
              type: question.question_type || question.type, // Try both field names
              options: options,
              assessment_id: question.assessment_id,
              video_id: question.video_id,
              difficulty: question.difficulty,
            };
          })
        );
        console.log("course", assessmentData.course_id);
        setCourseId(assessmentData.course_id);
        // 3. Set the assignment state with all the data
        setAssignment({
          id: assessmentData.id,
          title: assessmentData.title,
          description: assessmentData.description,
          timeLimit: assessmentData.time_limit,
          thumbnail: assessmentData.thumbnail,
          questions: processedQuestions,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load test data", {
          description: "Please try again or contact support.",
        });
        router.push("/assignment");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssignmentData();
    }
  }, [id, supabase, router]);

  // Calculate and display test results when test is completed
  useEffect(() => {
    if (testState.completed && assignment) {
      const results = calculateTestResults();
      if (results) {
        setTestResults(results);
        setShowTestResults(true);
      }
    }
  }, [testState.completed, assignment]);

  // Setup navigation watcher
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (testState.isActive) {
        e.preventDefault();
        return "";
      }
    };

    const handleNavigation = (e: PopStateEvent) => {
      if (testState.isActive) {
        e.preventDefault();
        setWarningOpen(true);
        router.push(`/test/${id}`);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [testState.isActive, id, router]);

  // Load assignment and initialize test
  useEffect(() => {
    if (loading) return;

    if (!assignment) {
      toast.error("Assignment not found", {
        description: "The test you're looking for doesn't exist.",
      });
      router.push("/");
      return;
    }

    if (!testState.isActive && !testState.completed) {
      // If the test isn't active and not completed, redirect back to assignment page
      router.push(`/assignment/${id}`);
    }

    // Handle test completion via time up
    if (testState.timeUp) {
      toast.error("Time's up!", {
        description: "Your test has been submitted automatically.",
      });
    }
  }, [
    assignment,
    testState.isActive,
    testState.completed,
    testState.timeUp,
    id,
    loading,
    router,
  ]);

  // Load answers from testState when changing questions
  useEffect(() => {
    if (
      currentQuestion &&
      testState.answers[currentQuestion.id] !== undefined
    ) {
      setLocalAnswer(testState.answers[currentQuestion.id]);
    } else {
      setLocalAnswer("");
    }
  }, [currentQuestion, testState.answers]);

  // Cleanup any pending save operations on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Loading test...</span>
      </div>
    );
  }

  if (!assignment || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-card rounded-lg shadow-sm border">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Test Unavailable</h2>
          <p className="mb-6 text-muted-foreground">
            This test is unavailable or has no questions.
          </p>
          <Button asChild>
            <Link href="/assignment">Return to Assignments</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Handler for marking questions for review
  const toggleMarkForReview = () => {
    if (!currentQuestion) return;

    setReviewMarks((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));

    // Save current answer if available
    if (localAnswer) {
      handleSetAnswer(currentQuestion.id, localAnswer);
    }

    toast.success(
      reviewMarks[currentQuestion.id]
        ? "Removed review mark"
        : "Marked for review"
    );
  };

  const handlePrevious = () => {
    if (submitting) return;

    if (currentQuestionIndex > 0) {
      // Save current answer before navigating
      if (currentQuestion && localAnswer) {
        handleSetAnswer(currentQuestion.id, localAnswer);
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (submitting) return;

    if (currentQuestionIndex < assignment.questions.length - 1) {
      // Save current answer before navigating
      if (currentQuestion && localAnswer) {
        handleSetAnswer(currentQuestion.id, localAnswer);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSave = () => {
    if (submitting) return;

    if (currentQuestion && localAnswer) {
      handleSetAnswer(currentQuestion.id, localAnswer);
      toast.success("Answer saved", {
        description: "Your answer has been saved.",
      });
    }
  };

  const handleAnswerChange = (value: string | string[]) => {
    setLocalAnswer(value);

    // For multiple choice, save immediately
    if (currentQuestion && typeof value === "string") {
      handleSetAnswer(currentQuestion.id, value);
    } else if (currentQuestion) {
      // For essay/text responses, use debouncing to avoid saving on every keystroke
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleSetAnswer(currentQuestion.id, value);
      }, 1000); // Save after 1 second of inactivity
    }
  };

  const handleOpenSubmitModal = () => {
    if (submitting || submitModalOpen) return;

    // Save current answer before showing submit modal
    if (currentQuestion && localAnswer) {
      handleSetAnswer(currentQuestion.id, localAnswer);
    }
    setSubmitModalOpen(true);
  };

  const handleSubmitTest = async () => {
    // Prevent multiple submissions
    if (submitting) return;

    try {
      // Save the current answer if any
      if (currentQuestion && localAnswer) {
        handleSetAnswer(currentQuestion.id, localAnswer);
      }

      setSubmitting(true);

      // Calculate test results
      const results = calculateTestResults();
      if (!results) {
        throw new Error("Failed to calculate test results");
      }

      // Update the existing attempt record instead of creating a new one
      if (!attemptId) {
        throw new Error("No active attempt found");
      }

      const finishTime = new Date().toISOString();

      // Determine if the user passed (assuming 80% is passing threshold, as used in calculateTestResults)
      const passed = results.score >= 80;

      const { error: updateAttemptError } = await supabase
        .from("assessment_attempts")
        .update({
          finished_at: finishTime,
          score: results.score,
          status: "completed",
          passed: passed, // Add the passed field based on the test result
        })
        .eq("id", attemptId);

      if (updateAttemptError) {
        console.error("Error updating attempt record:", updateAttemptError);
        throw new Error("Failed to update test attempt");
      }

      // Rest of the code remains the same
      // 4. Create payload for API if needed
      const payload = {
        testId: id,
        attemptId: attemptId,
        userDetails: {
          userId: user?.id || "anonymous",
          userName: user?.user_metadata?.full_name || "Anonymous User",
          email: user?.email || "no-email",
        },
        answers: testState.answers,
        timeSpent:
          (assignment.timeLimit || 0) * 60 * 1000 -
          (testState.remainingTime || 0),
        submittedAt: finishTime,
        score: results.score,
        passed: passed, // Include passed status in the payload
      };

      // Send POST request to your API endpoint if needed
      const response = await fetch(
        "https://srv-roxra.app.n8n.cloud/webhook/0ef3ba2e-0826-4d50-9e0d-9448674ac035",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit test to external API");
      }

      // Once successfully submitted, update local state
      submitTest();
      setTestResults(results);
      setShowTestResults(true);
      toast.success("Test submitted successfully!");
      setSubmitModalOpen(false);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    } finally {
      // Add a small delay before resetting the submitting state
      setTimeout(() => {
        setSubmitting(false);
      }, 500);
    }
  };

  const handleLeaveTest = () => {
    if (submitting) return;

    clearTest();
    router.push("/");
  };

  const handleFinishReview = () => {
    if (submitting) return;

    router.push("/");
  };

  // Navigate to a specific question
  const navigateToQuestion = (index: number) => {
    if (submitting || index === currentQuestionIndex) return;

    // Save current answer before navigating
    if (currentQuestion && localAnswer) {
      handleSetAnswer(currentQuestion.id, localAnswer);
    }
    setCurrentQuestionIndex(index);

    // Auto-close sidebar on mobile after selecting a question
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Get status of a question (for sidebar)
  const getQuestionStatus = (questionId: string) => {
    const isReviewed = reviewMarks[questionId] || false;
    const isAnswered = !!testState.answers[questionId];

    if (isReviewed && isAnswered) return "answered-review";
    if (isReviewed) return "review";
    if (isAnswered) return "answered";
    return "not-answered";
  };

  // Format time for display
  const formatTime = (ms?: number) => {
    if (!ms) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Count answered questions
  const answeredQuestions = Object.keys(testState.answers).length;
  const markedForReviewCount =
    Object.values(reviewMarks).filter(Boolean).length;
  const unansweredCount = assignment.questions.length - answeredQuestions;

  // Certificate form input handlers
  const handleCertificateFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setCertificateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Render certificate
  // Updated renderCertificate function to use the gaming certificate design
  const renderCertificate = () => {
    if (!testResults || !assignment) return null;

    // Format date for certificate
    const formatDate = () => {
      const date = new Date();
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();

      // Add suffix to day
      let daySuffix = "th";
      if (day > 3 && day < 21) daySuffix = "th";
      else if (day % 10 === 1) daySuffix = "st";
      else if (day % 10 === 2) daySuffix = "nd";
      else if (day % 10 === 3) daySuffix = "rd";

      return `${day}${daySuffix} day of ${month} of the year ${year}.`;
    };

    return (
      <div className="relative max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs text-gray-500">
            Certificate ID: {certificateId}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowCertificate(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Certificate with gaming theme */}
        <div className="relative">
          {/* Background image */}
          <img
            src="/game-certificate-bg.jpg"
            alt="Certificate Background"
            className="w-full h-auto rounded-lg"
          />

          {/* Content overlay */}
          <div className="absolute inset-0 p-8 flex flex-col">
            {/* Certificate header is already in the image */}

            {/* Certificate body */}
            <div className="flex-1 flex flex-col mt-32">
              {/* "This certificate is presented to" text is in the image */}

              {/* Name */}
              <div className="bg-gray-200 py-3 px-6 rounded mx-auto mb-8 text-center">
                <h2 className="text-purple-900 font-bold uppercase text-4xl tracking-wider font-mono">
                  {certificateFormData.fullName}
                </h2>
              </div>

              {/* Date */}
              <p className="text-white text-center text-xl mt-4">
                Awarded this {formatDate()}
              </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between space-x-8">
              <div className="text-center">
                <div className="h-px bg-cyan-400 w-48 mb-2"></div>
                <p className="text-white font-bold">Mr. Yael Amari</p>
                <p className="text-white text-sm">Board of Directors</p>
              </div>

              <div className="text-center">
                <div className="h-px bg-cyan-400 w-48 mb-2"></div>
                <p className="text-white font-bold">Mr. Yael Amari</p>
                <p className="text-white text-sm">Board of Directors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render test results page
  if (showTestResults && testResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-card rounded-xl p-6 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Assessment Results</h1>
            <p className="text-muted-foreground">{assignment.title}</p>
          </div>

          {certificateGenerated ? (
            renderCertificate()
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-blue-500 mb-1">
                  {testResults.score}%
                </div>
                <div className="text-lg text-muted-foreground">
                  {testResults.passed ? "Passed" : "Failed"}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-card shadow rounded-lg p-4 text-center border border-border">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
                  <div className="text-xl font-bold">
                    {testResults.correctCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="bg-card shadow rounded-lg p-4 text-center border border-border">
                  <AlertCircle className="mx-auto h-6 w-6 text-rose-500 mb-2" />
                  <div className="text-xl font-bold">
                    {testResults.incorrectCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="bg-card shadow rounded-lg p-4 text-center border border-border">
                  <AlertTriangle className="mx-auto h-6 w-6 text-amber-500 mb-2" />
                  <div className="text-xl font-bold">
                    {testResults.unansweredCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Unanswered
                  </div>
                </div>
              </div>

              {testResults.passed ? (
                <div className="bg-green-950/20 border border-green-600/30 rounded-lg p-6 mb-8 text-center">
                  <div className="inline-block p-2 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <Award className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    Congratulations! You've Qualified for a Certificate
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    You've passed this assessment with a score of{" "}
                    {testResults.score}%. You can now claim your official
                    certificate.
                  </p>
                  <Button
                    onClick={() => router.push(`/certificate/${courseId}`)}
                    // onClick={generateCertificate}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Award className="mr-2 h-5 w-5" />
                    Claim Certificate
                  </Button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h2 className="font-medium text-lg mb-4">
                    Performance Summary
                  </h2>
                  <p className="mb-6 text-muted-foreground">
                    You answered {testResults.correctCount} out of{" "}
                    {testResults.correctCount + testResults.incorrectCount}{" "}
                    questions correctly. We recommend reviewing the course
                    materials and trying again.
                  </p>

                  <h3 className="font-medium mb-2">Recommendations</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                    <li>Review the drone safety regulations module</li>
                    <li>Practice with the flight simulator exercises</li>
                    <li>
                      Join the community forum to discuss challenging concepts
                    </li>
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex gap-1 mb-4">
                  {/* <Button
                    variant={activeTab === "summary" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("summary")}
                    className="rounded-r-none"
                  >
                    Summary
                  </Button> */}
                  <Button
                    variant={activeTab === "review" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("review")}
                    className=""
                  >
                    Review Answers
                  </Button>
                </div>

                {activeTab === "review" && (
                  <div className="space-y-6">
                    {testResults.answers.map((item, index) => (
                      <div
                        key={item.question.id}
                        className="border-b border-border pb-4 last:border-0"
                      >
                        <h3 className="font-medium mb-2">
                          Question {index + 1}: {item.question.text}
                        </h3>

                        {item.answer ? (
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                              {item.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <div>
                              <div className="text-muted-foreground text-sm">
                                Your answer:
                              </div>
                              <div
                                className={
                                  item.isCorrect
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {typeof item.answer === "string" &&
                                item.question.type === "multiple-choice"
                                  ? item.optionText || "Unknown answer"
                                  : item.optionText}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-500">
                            <AlertTriangle className="h-5 w-5" />
                            <span>Not answered</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "summary" &&
                  testResults.correctCount === 0 &&
                  testResults.incorrectCount > 0 && (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        It looks like you had some difficulty with this
                        assessment. Don't worry - learning takes time, and
                        understanding concepts deeply is more important than
                        getting everything right on the first try.
                      </p>
                      <p className="text-muted-foreground">
                        Consider revisiting the course materials, particularly
                        the sections on drone safety and flight regulations.
                        Practice makes perfect!
                      </p>
                    </div>
                  )}
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push("/assignment")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Assessments
                </Button>

                <Button onClick={() => router.push(`/assignment/${id}`)}>
                  Retry Assessment
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Certificate Generation Modal */}
        <Dialog
          open={certificateModalOpen}
          onOpenChange={setShowCertificateModal}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate Your Certificate</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Congratulations on passing the assessment! Fill in your details
                to generate your certificate.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={certificateFormData.fullName}
                    onChange={handleCertificateFormChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation/Title</Label>
                  <Input
                    id="designation"
                    name="designation"
                    placeholder="Drone Pilot, Instructor, etc."
                    value={certificateFormData.designation}
                    onChange={handleCertificateFormChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={certificateFormData.email}
                    onChange={handleCertificateFormChange}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-1 text-xs text-muted-foreground">
                <div>Certificate Details:</div>
                <div>Assessment: {assignment.title}</div>
                <div>Score: {testResults.score}%</div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCertificateModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerateCertificate} disabled={submitting}>
                {submitting ? "Generating..." : "Generate Certificate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Render question with appropriate input type
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={localAnswer as string}
            onValueChange={handleAnswerChange}
            className="space-y-4 mt-6"
          >
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className=""
                  />
                  <Label
                    htmlFor={option.id}
                    className="w-full text-base font-normal cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))
            ) : (
              <div className="p-4 border rounded-lg bg-secondary/30">
                <p className="text-muted-foreground text-center">
                  No options available for this question.
                </p>
              </div>
            )}
          </RadioGroup>
        );
      case "essay":
      case "short-answer":
        return (
          <div className="mt-6">
            <Textarea
              placeholder="Type your answer here..."
              value={localAnswer as string}
              onChange={(e: any) => handleAnswerChange(e.target.value)}
              className="min-h-40 p-4 text-base"
              disabled={submitting}
            />
          </div>
        );
      default:
        return (
          <div className="mt-6 p-4 border rounded-lg bg-secondary/30">
            <p className="text-muted-foreground text-center">
              Unsupported question type: {currentQuestion.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Main content */}
      <div className="p-3 sm:p-6 transition-all duration-300">
        <div className="max-w-3xl mx-auto">
          {/* Header section */}
          <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {assignment.title}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of{" "}
                  {assignment.questions.length}
                </p>
                <div className="hidden sm:flex items-center gap-2 bg-card p-2 rounded-lg font-mono text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  {formatTime(testState.remainingTime)}
                </div>
                <div className="sm:hidden flex items-center gap-1 bg-card px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3 text-primary" />
                  {formatTime(testState.remainingTime)}
                </div>

                {/* Show auto-save indicator */}
                {isSaving && (
                  <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded text-xs animate-pulse">
                    <Save className="h-3 w-3" />
                    <span>Saving...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar toggle button */}
            {!sidebarOpen && (
              <Button
                onClick={() => setSidebarOpen(true)}
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg flex items-center justify-center"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Question card */}
          <div className="bg-card rounded-xl shadow-sm border border-border/50 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-foreground mb-6">
                {currentQuestion.text}
              </h2>
              {renderQuestionInput()}
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <TestNavigation
                  currentQuestion={currentQuestionIndex}
                  totalQuestions={assignment.questions.length}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSave={handleSave}
                  onSubmit={handleOpenSubmitModal}
                  hasAnswer={!!testState.answers[currentQuestion.id]}
                />

                <Button
                  variant={
                    reviewMarks[currentQuestion.id] ? "default" : "outline"
                  }
                  size="sm"
                  onClick={toggleMarkForReview}
                  className="mt-2 sm:mt-0 w-full sm:w-auto"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {reviewMarks[currentQuestion.id]
                    ? "Unmark Review"
                    : "Mark for Review"}
                </Button>
              </div>
            </div>
          </div>

          {/* Submit section */}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {answeredQuestions} of {assignment.questions.length} questions
              answered
            </div>
            <Button
              onClick={handleOpenSubmitModal}
              variant="default"
              disabled={submitting}
              className={submitting ? "cursor-not-allowed" : "cursor-pointer"}
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Right sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-[320px] md:w-[280px] lg:w-[320px] bg-card border-l border-border shadow-xl z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 p-4 border-b border-border flex justify-between items-center bg-card/95 backdrop-blur-sm">
            <h2 className="font-bold text-base">Test Navigation</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-muted/30">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Answered</div>
              <div className="font-bold">{answeredQuestions}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Unanswered</div>
              <div className="font-bold">{unansweredCount}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">For Review</div>
              <div className="font-bold">{markedForReviewCount}</div>
            </div>
          </div>

          {/* Legend */}
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-medium mb-2">Legend:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-600"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-border"></div>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-rose-500 dark:bg-rose-600"></div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-600"></div>
                <span>For Review</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-violet-500 dark:bg-violet-600"></div>
                <span>Answered+Review</span>
              </div>
            </div>
          </div>

          {/* Question Navigation Buttons */}
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-medium mb-2">Questions:</h3>
            <div className="grid grid-cols-6 sm:grid-cols-5 gap-2">
              {assignment.questions.map((question, index) => {
                const status = getQuestionStatus(question.id);
                let buttonClass = "";

                if (status === "answered")
                  buttonClass =
                    "bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-transparent";
                else if (status === "review")
                  buttonClass =
                    "bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white border-transparent";
                else if (status === "answered-review")
                  buttonClass =
                    "bg-violet-500 dark:bg-violet-600 hover:bg-violet-600 dark:hover:bg-violet-700 text-white border-transparent";
                else if (
                  index < currentQuestionIndex &&
                  !testState.answers[question.id]
                )
                  buttonClass =
                    "bg-rose-500 dark:bg-rose-600 hover:bg-rose-600 dark:hover:bg-rose-700 text-white border-transparent";

                // Add ring for current question
                if (currentQuestionIndex === index) {
                  buttonClass +=
                    " ring-2 ring-primary dark:ring-primary ring-offset-1 ring-offset-background";
                }

                return (
                  <Button
                    key={question.id}
                    className={`h-10 w-10 p-0 font-normal ${buttonClass}`}
                    onClick={() => navigateToQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="sticky bottom-0 p-3 border-t border-border grid grid-cols-1 gap-2 bg-card/95 backdrop-blur-sm">
            <Button
              variant="default"
              onClick={handleOpenSubmitModal}
              disabled={submitting}
              className="w-full"
            >
              Submit Test
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WarningModal
        isOpen={warningOpen}
        onConfirm={handleLeaveTest}
        onCancel={() => setWarningOpen(false)}
      />

      <SubmitModal
        isOpen={submitModalOpen}
        onSubmit={handleSubmitTest}
        onCancel={() => setSubmitModalOpen(false)}
        answeredQuestions={answeredQuestions}
        totalQuestions={assignment.questions.length}
      />
      {showCertModal && (
        <CertificateModal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          defaultEmail={user?.email || ""}
          defaultName={
            user?.profile?.full_name ||
            user?.profile?.display_name ||
            user?.user_metadata?.full_name ||
            ""
          }
          courseId={courseId}
          courseTitle={courseTitle}
          onSuccess={handleCertificateSuccess}
        />
      )}
    </div>
  );
};

export default TestPage;
