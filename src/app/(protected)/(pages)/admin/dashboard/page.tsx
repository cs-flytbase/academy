"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  GraduationCap,
  VideoIcon,
  FileQuestion,
  CheckCircle2,
  Edit,
  Trash2,
  Save,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Users,
  UserCog,
  X,
  MoreHorizontal,
  Search,
  Youtube,
  CheckCircle,
  Loader2,
  List,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define interfaces for our database schema
interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  thumbnail?: string;
  created_at?: string;
  playlist_id?: string;
  video_count?: number;
}

interface Video {
  id: string;
  title: string;
  youtube_video_id: string;
  course_id: string;
  about?: string;
  thumbnail?: string;
  created_at?: string;
}

interface Question {
  id: number;
  question_text: string;
  description?: string | null;
  question_type: string;
  video_id?: number | null;
  assessment_id?: number | null;
  difficulty?: string | null;
  after_videoend?: boolean | null;
  is_assessment?: boolean | null;
  options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

interface QuestionForm {
  id?: number;
  question_text: string;
  description?: string | null;
  question_type: string;
  difficulty?: string | null;
  video_id?: number | null;
  assessment_id?: number | null;
  after_videoend?: boolean | null;
  is_assessment?: boolean | null;
  options: {
    id?: number;
    option_text: string;
    is_correct: boolean;
  }[];
}

export default function AdminDashboard() {
  // Initialize Supabase client
  const supabase = createClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("video-questions");

  // State for user authentication and permissions
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // State for data
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // State for selection
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // State for course creation
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [courseCreationStatus, setCourseCreationStatus] = useState<{
    type: string | null;
    message: string;
  }>({ type: null, message: "" });

  // State for question editing
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    question_text: "",
    description: "",
    question_type: "multiple-choice",
    difficulty: "medium",
    video_id: null,
    assessment_id: null,
    after_videoend: false,
    is_assessment: false,
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);

  // Check admin status on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Error fetching user or user not found:", userError);
          router.push("/login");
          return;
        }

        setUser(user);

        // Check if user has admin privileges
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Failed to verify admin status.");
          router.push("/");
          return;
        }

        if (!profileData?.is_admin) {
          toast.error("You don't have permission to access this page.");
          router.push("/");
          return;
        }

        setIsAdmin(true);
        fetchCourses();
        fetchUsers();
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("An error occurred while checking your permissions.");
        router.push("/");
      }
    };

    checkAdminStatus();
  }, []);

  // Reset selections when tab changes
  useEffect(() => {
    setSelectedCourse(null);
    setSelectedVideo(null);
    setQuestions([]);
  }, [activeTab]);

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("title");

      if (error) {
        throw error;
      }

      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  // Fetch videos when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchVideos();
      setSelectedVideo(null);
      setQuestions([]);
    } else {
      setVideos([]);
      setSelectedVideo(null);
      setQuestions([]);
    }
  }, [selectedCourse]);

  // Fetch questions when a video is selected
  useEffect(() => {
    if (selectedVideo) {
      fetchVideoQuestions();
    } else {
      setQuestions([]);
    }
  }, [selectedVideo]);

  // Fetch videos for selected course
  const fetchVideos = async () => {
    if (!selectedCourse) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("course_id", selectedCourse);
      // .order("title");

      if (error) {
        throw error;
      }

      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions for selected video
  const fetchVideoQuestions = async () => {
    if (!selectedVideo) return;

    setLoading(true);
    try {
      // Fetch questions for this video
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("video_id", selectedVideo)
        .order("created_at", { ascending: false });

      if (questionError) {
        throw questionError;
      }

      // Normalize question data to handle field name inconsistencies
      const processedQuestions = questionData.map((q) => ({
        ...q,
        question_text: q.question_text || q.text || q.question || "",
        question_type: q.question_type || q.type || "multiple-choice",
      }));

      // If we have questions, fetch their options
      if (processedQuestions.length > 0) {
        const questionIds = processedQuestions.map((q) => q.id);

        const { data: optionData, error: optionError } = await supabase
          .from("question_options")
          .select("*")
          .in("question_id", questionIds);

        if (optionError) {
          throw optionError;
        }

        // Normalize option data and group by question_id
        const optionsByQuestionId = {};

        if (optionData) {
          optionData.forEach((opt) => {
            if (!optionsByQuestionId[opt.question_id]) {
              optionsByQuestionId[opt.question_id] = [];
            }

            optionsByQuestionId[opt.question_id].push({
              id: opt.id,
              option_text: opt.option_text || opt.text || "",
              is_correct: opt.is_correct,
              question_id: opt.question_id,
            });
          });
        }

        // Add options to questions
        const questionsWithOptions = processedQuestions.map((q) => ({
          ...q,
          options: optionsByQuestionId[q.id] || [],
        }));

        setQuestions(questionsWithOptions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching video questions:", error);
      toast.error("Failed to fetch questions for this video");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle admin status for a user
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      toast.success(
        `User ${currentStatus ? "removed from" : "granted"} admin access`
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating user admin status:", error);
      toast.error("Failed to update user permissions");
    } finally {
      setSaveLoading(false);
    }
  };

  // Create course from YouTube playlist
  // This function handles the course creation through webhook
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    console.log("Sending playlist URL to server:", playlistUrl);
    // Clear previous status
    setCourseCreationStatus({ type: null, message: "" });

    // Basic validation
    if (!playlistUrl.trim()) {
      setCourseCreationStatus({
        type: "error",
        message: "Please enter a YouTube playlist URL",
      });
      return;
    }

    // Validate YouTube playlist URL
    if (
      !(
        (playlistUrl.includes("youtube.com") ||
          playlistUrl.includes("youtu.be")) &&
        (playlistUrl.includes("list=") || playlistUrl.includes("playlist"))
      )
    ) {
      setCourseCreationStatus({
        type: "error",
        message: "Please enter a valid YouTube playlist URL",
      });
      return;
    }

    setSaveLoading(true);

    try {
      // Send request to the webhook - this just forwards the playlist URL to the server
      const response = await fetch(
        "https://srv-roxra.app.n8n.cloud/webhook/35ce5709-5702-4e41-b199-81cf683a5b32",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playlist_url: playlistUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Handle successful POST request
      setCourseCreationStatus({
        type: "success",
        message:
          "Request submitted successfully! The server will now process the playlist and create the course. This may take several minutes.",
      });

      toast.success("Playlist URL submitted to server");

      // Clear the input
      setPlaylistUrl("");

      // Refresh courses after a delay
      setTimeout(() => {
        fetchCourses();
      }, 10000); // Give more time for the server to at least start processing
    } catch (error) {
      console.error("Error sending playlist URL to server:", error);

      setCourseCreationStatus({
        type: "error",
        message:
          "Failed to send request to server. Please check your network connection and try again.",
      });

      toast.error("Failed to send request");
    } finally {
      setSaveLoading(false);
    }
  };

  // Open the dialog to add a new question
  const handleAddQuestion = () => {
    if (!selectedVideo) {
      toast.error("Please select a video first");
      return;
    }

    setQuestionForm({
      question_text: "",
      description: "",
      question_type: "multiple-choice",
      difficulty: "medium",
      options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    });

    setIsEditing(false);
    setShowQuestionDialog(true);
  };

  // Open the dialog to edit an existing question
  const handleEditQuestion = (question: Question) => {
    setQuestionForm({
      id: question.id,
      question_text: question.question_text,
      description: question.description || "",
      question_type: question.question_type,
      difficulty: question.difficulty,
      video_id: question.video_id,
      assessment_id: question.assessment_id,
      after_videoend: question.after_videoend,
      is_assessment: question.is_assessment,
      options:
        question.options?.map((opt) => ({
          id: typeof opt.id === "string" ? parseInt(opt.id) : opt.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })) || [],
    });

    setIsEditing(true);
    setShowQuestionDialog(true);
  };

  // Add a new option to the question form
  const addOption = () => {
    if (questionForm.options.length >= 8) {
      toast.error("Maximum 8 options allowed");
      return;
    }

    setQuestionForm({
      ...questionForm,
      options: [
        ...questionForm.options,
        { option_text: "", is_correct: false },
      ],
    });
  };

  // Remove an option from the question form
  const removeOption = (index: number) => {
    if (questionForm.options.length <= 2) {
      toast.error("Multiple-choice questions need at least 2 options");
      return;
    }

    const updatedOptions = [...questionForm.options];
    updatedOptions.splice(index, 1);

    setQuestionForm({
      ...questionForm,
      options: updatedOptions,
    });
  };

  // Handle changes to option field values
  const handleOptionChange = (
    index: number,
    field: "option_text" | "is_correct",
    value: string | boolean
  ) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };

    setQuestionForm({
      ...questionForm,
      options: updatedOptions,
    });
  };

  // Save a new or updated question
  const saveQuestion = async () => {
    if (!selectedVideo || !selectedCourse) return;

    // Validate form data
    if (!questionForm.question_text.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (questionForm.question_type === "multiple-choice") {
      const validOptions = questionForm.options.filter(
        (opt) => opt.option_text.trim() !== ""
      );

      if (validOptions.length < 2) {
        toast.error("Multiple-choice questions need at least 2 options");
        return;
      }

      if (!validOptions.some((opt) => opt.is_correct)) {
        toast.error("At least one option must be marked as correct");
        return;
      }
    }

    setSaveLoading(true);
    try {
      if (isEditing && questionForm.id) {
        // Update question
        const { error: updateError } = await supabase
          .from("questions")
          .update({
            question_text: questionForm.question_text,
            // description: questionForm.description || null,
            question_type: questionForm.question_type,
            difficulty: questionForm.difficulty || null,
            video_id: selectedVideo ? parseInt(selectedVideo) : null,
            assessment_id: questionForm.assessment_id || null,
            after_videoend: questionForm.after_videoend ?? null,
            is_assessment: questionForm.is_assessment ?? null,
          })
          .eq("id", questionForm.id);

        if (updateError) throw updateError;

        // Delete and re-insert options (as you already did)
      } else {
        // Insert new question
        const { data: newQuestion, error: insertError } = await supabase
          .from("questions")
          .insert({
            question_text: questionForm.question_text,
            // description: questionForm.description || null,
            question_type: questionForm.question_type,
            difficulty: questionForm.difficulty || null,
            video_id: selectedVideo ? parseInt(selectedVideo) : null,
            assessment_id: questionForm.assessment_id || null,
            after_videoend: questionForm.after_videoend ?? null,
            is_assessment: questionForm.is_assessment ?? null,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Insert options

        // For multiple-choice questions, add options
        if (questionForm.question_type === "multiple-choice") {
          const validOptions = questionForm.options.filter(
            (opt) => opt.option_text.trim() !== ""
          );

          if (validOptions.length > 0) {
            const optionsToInsert = validOptions.map((opt) => ({
              question_id: newQuestion.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
            }));

            const { error: optionsError } = await supabase
              .from("question_options")
              .insert(optionsToInsert);

            if (optionsError) throw optionsError;
          }
        }

        toast.success("Question added successfully");
      }

      // Close dialog and refresh questions
      setShowQuestionDialog(false);
      fetchVideoQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error(
        isEditing ? "Failed to update question" : "Failed to add question"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete a question
  const deleteQuestion = async (questionId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      return;
    }

    setSaveLoading(true);
    try {
      // Delete options first (foreign key constraint)
      const { error: optionsError } = await supabase
        .from("question_options")
        .delete()
        .eq("question_id", questionId);

      if (optionsError) throw optionsError;

      // Then delete the question
      const { error: questionError } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);

      if (questionError) throw questionError;

      toast.success("Question deleted successfully");
      fetchVideoQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setSaveLoading(false);
    }
  };

  // If not admin, show loading or redirect
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage courses, videos, questions, and user permissions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 ">
        <TabsList className="grid grid-cols-4 sm:grid-cols-4 w-full p-1 mb-4 h-full">
          <TabsTrigger value="video-questions" className="text-base py-2 px-3">
            <VideoIcon className="mr-2 h-4 w-4" /> Video Questions
          </TabsTrigger>
          <TabsTrigger value="create-course" className="text-base py-2 px-3">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Course
          </TabsTrigger>
          <TabsTrigger value="users" className="text-base py-2 px-3">
            <Users className="mr-2 h-4 w-4" /> User Management
          </TabsTrigger>
        </TabsList>

        {/* Video Questions Tab */}
        <TabsContent value="video-questions">
          <div className="grid gap-6">
            {/* Course and Video Selection */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Select Course and Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6">
                {/* Course Selection */}
                <div>
                  <Label htmlFor="course-select" className="mb-2 block">
                    Course
                  </Label>
                  <Select
                    value={selectedCourse || ""}
                    onValueChange={(value) => {
                      setSelectedCourse(value);
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger id="course-select" className="w-full">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Video Selection (only shown when course is selected) */}
                {selectedCourse && (
                  <div>
                    <Label htmlFor="video-select" className="mb-2 block">
                      Video
                    </Label>
                    <Select
                      value={selectedVideo || ""}
                      onValueChange={setSelectedVideo}
                      disabled={loading || videos.length === 0}
                    >
                      <SelectTrigger id="video-select" className="w-full">
                        <SelectValue
                          placeholder={
                            videos.length === 0
                              ? "No videos available"
                              : "Select a video"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {videos.map((video) => (
                          <SelectItem key={video.id} value={video.id}>
                            {video.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question Management */}
            {selectedVideo && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center">
                    <FileQuestion className="mr-2 h-5 w-5" />
                    Questions for{" "}
                    {videos.find((v) => v.id === selectedVideo)?.title ||
                      "Selected Video"}
                  </CardTitle>
                  <Button onClick={handleAddQuestion}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </CardHeader>
                <CardContent className="px-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-8 bg-muted/40 rounded-lg border border-border">
                      <FileQuestion className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-medium mb-1">
                        No Questions Available
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        No questions have been added to this video yet.
                      </p>
                      <Button onClick={handleAddQuestion} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add First Question
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question) => (
                        <div
                          key={question.id}
                          className="p-4 border rounded-md hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-4">
                              <div className="flex flex-wrap items-start gap-2">
                                <h3 className="font-medium break-words">
                                  {question.question_text}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {question.question_type}
                                </Badge>
                                {question.difficulty && (
                                  <Badge variant="outline" className="text-xs">
                                    {question.difficulty}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 ml-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Question Options */}
                          {question.question_type === "multiple-choice" &&
                            question.options &&
                            question.options.length > 0 && (
                              <div className="mt-3 pl-4 border-l-2 border-muted">
                                <p className="text-sm font-medium mb-1">
                                  Options:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {question.options.map((option, index) => (
                                    <div
                                      key={option.id}
                                      className={`text-sm flex items-center p-2 rounded ${
                                        option.is_correct
                                          ? "bg-green-100 dark:bg-green-900/20"
                                          : "bg-muted/30"
                                      }`}
                                    >
                                      <span className="w-5 text-center">
                                        {index + 1}.
                                      </span>
                                      <span className="ml-1 break-words overflow-hidden">
                                        {option.option_text}
                                      </span>
                                      {option.is_correct && (
                                        <CheckCircle2 className="ml-1 h-3.5 w-3.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Create Course Tab */}
        <TabsContent value="create-course">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Youtube className="mr-2 h-5 w-5" />
                Create Course from YouTube Playlist
              </CardTitle>
              <CardDescription>
                Enter a YouTube playlist URL to automatically create a new
                course with all the videos from the playlist.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playlist-url">YouTube Playlist URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="playlist-url"
                      value={playlistUrl}
                      onChange={(e) => setPlaylistUrl(e.target.value)}
                      placeholder="https://www.youtube.com/playlist?list=EXAMPLE"
                      className="flex-1"
                      disabled={saveLoading}
                    />
                    <Button type="submit" disabled={saveLoading}>
                      {saveLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Course
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {courseCreationStatus.type && (
                  <Alert
                    variant={
                      courseCreationStatus.type === "error"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {courseCreationStatus.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {courseCreationStatus.type === "success"
                        ? "Success"
                        : "Error"}
                    </AlertTitle>
                    <AlertDescription>
                      {courseCreationStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
            <CardFooter className="border-t pt-6 flex flex-col items-start px-6">
              <h3 className="font-medium mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground pl-2">
                <li>Enter a valid YouTube playlist URL</li>
                <li>
                  Our system will process the playlist and extract all videos
                </li>
                <li>
                  A new course will be created with all videos from the playlist
                </li>
                <li>
                  You can then add questions to each video from the Video
                  Questions Manager
                </li>
              </ol>
            </CardFooter>
          </Card>

          {/* Recent Courses List */}
          {courses.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Recent Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Videos</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.slice(0, 5).map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">
                            {course.title}
                          </TableCell>
                          <TableCell>
                            {course.created_at
                              ? new Date(course.created_at).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>{course.video_count || "0"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveTab("video-questions");
                                setSelectedCourse(course.id);
                              }}
                            >
                              <VideoIcon className="mr-2 h-4 w-4" />
                              Manage Questions
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <UserCog className="mr-2 h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user permissions and admin access
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Admin Access</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          {loading ? (
                            <div className="flex justify-center items-center">
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              Loading users...
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              No users found
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((userData) => (
                        <TableRow key={userData.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {userData.full_name
                                  ? userData.full_name.charAt(0).toUpperCase()
                                  : userData.email.charAt(0).toUpperCase()}
                              </div>
                              <span>{userData.full_name || "User"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{userData.email}</TableCell>
                          <TableCell>
                            {new Date(userData.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={userData.is_admin}
                              onCheckedChange={() =>
                                toggleAdminStatus(
                                  userData.id,
                                  userData.is_admin
                                )
                              }
                              disabled={userData.id === user?.id || saveLoading}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    toggleAdminStatus(
                                      userData.id,
                                      userData.is_admin
                                    )
                                  }
                                  disabled={userData.id === user?.id}
                                >
                                  {userData.is_admin ? (
                                    <>
                                      <X className="mr-2 h-4 w-4" />
                                      Remove Admin
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Make Admin
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Add/Edit Dialog - Fixed for smaller screens */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-2">
            <DialogTitle>
              {isEditing ? "Edit Question" : "Add New Question"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 space-y-4 overflow-y-auto pr-2 flex-1">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text</Label>
              <Textarea
                id="question_text"
                value={questionForm.question_text}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    question_text: e.target.value,
                  })
                }
                className="min-h-[80px]"
                placeholder="Enter the question text"
              />
            </div>

            {/* Question Type and Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question_type">Question Type</Label>
                <Select
                  value={questionForm.question_type}
                  onValueChange={(value) =>
                    setQuestionForm({
                      ...questionForm,
                      question_type: value,
                    })
                  }
                >
                  <SelectTrigger id="question_type">
                    <SelectValue placeholder="Select a question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={questionForm.difficulty}
                  onValueChange={(value) =>
                    setQuestionForm({
                      ...questionForm,
                      difficulty: value,
                    })
                  }
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* After Video End */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!questionForm.after_videoend}
                onCheckedChange={(checked) =>
                  setQuestionForm({
                    ...questionForm,
                    after_videoend: checked,
                  })
                }
              />
              <Label>Only show after video ends</Label>
            </div>

            {/* Is Assessment */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!questionForm.is_assessment}
                onCheckedChange={(checked) =>
                  setQuestionForm({
                    ...questionForm,
                    is_assessment: checked,
                  })
                }
              />
              <Label>This is part of an assessment</Label>
            </div>

            {/* Optional: Assessment ID Input */}
            <div className="space-y-1">
              <Label htmlFor="assessment_id">Assessment ID (optional)</Label>
              <Input
                id="assessment_id"
                type="number"
                value={questionForm.assessment_id || ""}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    assessment_id: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                placeholder="Enter assessment ID"
              />
            </div>
            {/* Options for Multiple-Choice Questions */}
            {questionForm.question_type === "multiple-choice" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Answer Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    disabled={questionForm.options.length >= 8}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {questionForm.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 p-3 border rounded-md"
                    >
                      <div className="pt-2">
                        <Checkbox
                          id={`option-correct-${index}`}
                          checked={option.is_correct}
                          onCheckedChange={(checked) =>
                            handleOptionChange(index, "is_correct", !!checked)
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor={`option-text-${index}`}
                          className="mb-1 block"
                        >
                          Option {index + 1}
                          {option.is_correct && " (Correct)"}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`option-text-${index}`}
                            value={option.option_text}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                "option_text",
                                e.target.value
                              )
                            }
                            placeholder={`Option ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                            disabled={questionForm.options.length <= 2}
                            className="h-9 w-9 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Warning if no correct answer selected */}
                {!questionForm.options.some((opt) => opt.is_correct) && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>At least one option must be marked as correct</span>
                  </div>
                )}
              </div>
            )}

            {/* Important information for essay/short answer questions */}
            {questionForm.question_type !== "multiple-choice" && (
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 p-3 rounded-md border border-blue-200 dark:border-blue-900/50 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p>
                    {questionForm.question_type === "essay"
                      ? "Essay questions allow students to provide long-form text responses."
                      : "Short answer questions expect a brief text response from students."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowQuestionDialog(false)}
              disabled={saveLoading}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={saveQuestion}
              disabled={
                saveLoading ||
                !questionForm.question_text.trim() ||
                (questionForm.question_type === "multiple-choice" &&
                  !questionForm.options.some((opt) => opt.is_correct))
              }
            >
              {saveLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Question" : "Add Question"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
