"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, PlusCircle, RefreshCw, VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { Course, Video, Question } from "../types";
import QuestionList from "./question-list";
import QuestionDialog from "./question-dialog";

export default function VideoQuestionsTab() {
  const supabase = createClient();
  
  // State for courses and videos
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Default question form
  const [questionForm, setQuestionForm] = useState<any>({
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

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch videos when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchVideos(selectedCourse);
    } else {
      setVideos([]);
      setSelectedVideo(null);
    }
  }, [selectedCourse]);

  // Fetch questions when video changes
  useEffect(() => {
    if (selectedVideo) {
      fetchVideoQuestions();
    } else {
      setQuestions([]);
    }
  }, [selectedVideo]);

  // Fetch all courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos for a specific course
  const fetchVideos = async (courseId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions for a specific video
  const fetchVideoQuestions = async () => {
    if (!selectedVideo) return;
    
    setLoading(true);
    try {
      // First, get the questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("video_id", selectedVideo)
        .order("created_at", { ascending: false });

      if (questionsError) throw questionsError;

      // Then, get the options for each question
      const questionIds = questionsData?.map((q) => q.id) || [];
      
      let questionsWithOptions = [...questionsData];

      if (questionIds.length > 0) {
        const { data: optionsData, error: optionsError } = await supabase
          .from("question_options")
          .select("*")
          .in("question_id", questionIds);

        if (optionsError) throw optionsError;

        // Attach options to questions
        if (optionsData && optionsData.length > 0) {
          questionsWithOptions = questionsData.map((question) => {
            const questionOptions = optionsData.filter(
              (opt) => opt.question_id === question.id
            );
            return { ...question, options: questionOptions };
          });
        }
      }

      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
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

  return (
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

          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCourses}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {selectedVideo && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <VideoIcon className="mr-2 h-5 w-5" />
                Video Questions
              </CardTitle>
              <Button
                onClick={handleAddQuestion}
                size="sm"
                disabled={loading}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <QuestionList 
              questions={questions} 
              onEditQuestion={handleEditQuestion} 
              onDeleteQuestion={deleteQuestion} 
              loading={loading}
              onRefresh={fetchVideoQuestions}
            />
          </CardContent>
        </Card>
      )}

      {/* Question Dialog */}
      {showQuestionDialog && (
        <QuestionDialog
          isOpen={showQuestionDialog}
          onClose={() => setShowQuestionDialog(false)}
          questionForm={questionForm}
          setQuestionForm={setQuestionForm}
          isEditing={isEditing}
          selectedVideo={selectedVideo}
          selectedCourse={selectedCourse}
          saveLoading={saveLoading}
          setSaveLoading={setSaveLoading}
          fetchVideoQuestions={fetchVideoQuestions}
        />
      )}
    </div>
  );
}
