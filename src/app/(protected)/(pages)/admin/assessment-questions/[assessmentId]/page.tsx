  "use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, RefreshCw, Edit, Trash2, Save, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { Assessment, Question, QuestionOption } from "../../../admin/dashboard/components/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Question type options
const questionTypes = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True/False" },
];

// Difficulty options
const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function AssessmentQuestionsPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const supabase = createClient();
  const unwrappedParams = React.use(params);
  const { assessmentId } = unwrappedParams;
  
  // State
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Assessment editing state
  const [isEditingAssessment, setIsEditingAssessment] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    title: "",
    description: "",
    time_limit: 60
  });
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);

  // Question form state
  const [questionForm, setQuestionForm] = useState<{
    id?: string | number;
    question_text: string;
    description: string;
    question_type: string;
    difficulty: string;
    options: {
      id?: string | number;
      option_text: string;
      is_correct: boolean;
    }[];
  }>({
    question_text: "",
    description: "",
    question_type: "multiple_choice",
    difficulty: "medium",
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  });

  // Fetch assessment and questions on component mount
  useEffect(() => {
    fetchAssessment();
    fetchQuestions();
  }, [assessmentId]);

  // Fetch assessment details
  const fetchAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (error) throw error;
      setAssessment(data);
      // Initialize assessment form with current values
      setAssessmentForm({
        title: data.title,
        description: data.description,
        time_limit: data.time_limit
      });
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error("Failed to load assessment details");
    }
  };

  // Fetch questions for the assessment
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("created_at", { ascending: true });

      if (questionsError) throw questionsError;

      const fetchedQuestions = questionsData || [];

      // Fetch options for each question
      const questionsWithOptions = await Promise.all(
        fetchedQuestions.map(async (question) => {
          const { data: optionsData, error: optionsError } = await supabase
            .from("question_options")
            .select("*")
            .eq("question_id", question.id);

          if (optionsError) throw optionsError;

          return {
            ...question,
            options: optionsData || [],
          };
        })
      );

      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new question
  const handleAddQuestion = () => {
    setQuestionForm({
      question_text: "",
      description: "",
      question_type: "multiple_choice",
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

  // Handle editing a question
  const handleEditQuestion = (question: Question) => {
    setIsEditing(true);
    setQuestionForm({
      id: question.id,
      question_text: question.question_text,
      description: "", // The description field doesn't exist in the DB, but we keep it in the UI
      question_type: question.question_type,
      difficulty: question.difficulty || "medium",
      options: question.options?.map((option) => ({
        id: option.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
      })) || [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    });
    setShowQuestionDialog(true);
  };

  // Handle confirming delete
  const confirmDelete = (questionId: string | number) => {
    setQuestionToDelete(String(questionId));
    setShowDeleteConfirm(true);
  };

  // Delete a question
  const deleteQuestion = async () => {
    if (!questionToDelete) return;

    setIsLoadingAction(true);
    try {
      // First delete the options
      const { error: deleteOptionsError } = await supabase
        .from("question_options")
        .delete()
        .eq("question_id", questionToDelete);

      if (deleteOptionsError) throw deleteOptionsError;

      // Then delete the question
      const { error: deleteQuestionError } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionToDelete);

      if (deleteQuestionError) throw deleteQuestionError;

      toast.success("Question deleted successfully");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setIsLoadingAction(false);
      setShowDeleteConfirm(false);
      setQuestionToDelete(null);
    }
  };

  // Toggle assessment editing mode
  const toggleEditAssessment = () => {
    setIsEditingAssessment(!isEditingAssessment);
    
    // Reset form if canceling edit
    if (isEditingAssessment && assessment) {
      setAssessmentForm({
        title: assessment.title,
        description: assessment.description,
        time_limit: assessment.time_limit
      });
    }
  };
  
  // Save assessment changes
  const saveAssessmentChanges = async () => {
    if (!assessment) return;
    
    // Validate form
    if (!assessmentForm.title.trim()) {
      toast.error("Assessment title is required");
      return;
    }

    if (!assessmentForm.description.trim()) {
      toast.error("Assessment description is required");
      return;
    }
    
    setIsSavingAssessment(true);
    
    try {
      const { error } = await supabase
        .from("assessments")
        .update({
          title: assessmentForm.title,
          description: assessmentForm.description,
          time_limit: assessmentForm.time_limit
        })
        .eq("id", assessmentId);
        
      if (error) throw error;
      
      toast.success("Assessment updated successfully");
      fetchAssessment(); // Refresh assessment data
      setIsEditingAssessment(false);
    } catch (error) {
      console.error("Error updating assessment:", error);
      toast.error("Failed to update assessment");
    } finally {
      setIsSavingAssessment(false);
    }
  };

  // Handle input changes for question form
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuestionForm({
      ...questionForm,
      [name]: value,
    });
  };

  // Handle selection changes
  const handleSelectChange = (name: string, value: string) => {
    setQuestionForm({
      ...questionForm,
      [name]: value,
    });

    // If changing from multiple choice to true/false, adjust options
    if (name === "question_type" && value === "true_false") {
      setQuestionForm((prev) => ({
        ...prev,
        options: [
          { option_text: "True", is_correct: false },
          { option_text: "False", is_correct: false },
        ],
      }));
    } else if (name === "question_type" && value === "multiple_choice" && questionForm.options.length < 3) {
      // If changing from true/false to multiple choice, add more options
      setQuestionForm((prev) => ({
        ...prev,
        options: [
          ...prev.options,
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ],
      }));
    }
  };

  // Handle option changes
  const handleOptionChange = (index: number, field: "option_text" | "is_correct", value: string | boolean) => {
    const newOptions = [...questionForm.options];
    
    // Update the option
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };

    // For true/false questions, ensure only one option is correct
    if (questionForm.question_type === "true_false" && field === "is_correct" && value === true) {
      newOptions.forEach((option, i) => {
        if (i !== index) option.is_correct = false;
      });
    }

    setQuestionForm({
      ...questionForm,
      options: newOptions,
    });
  };

  // Add an option
  const addOption = () => {
    if (questionForm.options.length < 8) {
      setQuestionForm({
        ...questionForm,
        options: [...questionForm.options, { option_text: "", is_correct: false }],
      });
    }
  };

  // Remove an option
  const removeOption = (index: number) => {
    if (questionForm.options.length > 2) {
      const newOptions = [...questionForm.options];
      newOptions.splice(index, 1);
      setQuestionForm({
        ...questionForm,
        options: newOptions,
      });
    } else {
      toast.error("A question must have at least 2 options");
    }
  };

  // Save question
  const saveQuestion = async () => {
    // Validate form data
    if (!questionForm.question_text.trim()) {
      toast.error("Question text is required");
      return;
    }

    // Note: We're ignoring the description field as it doesn't exist in the database
    // But we keep it in the UI for a better user experience

    // Ensure at least one option is correct
    if (!questionForm.options.some(option => option.is_correct)) {
      toast.error("At least one option must be correct");
      return;
    }

    // Ensure all options have text
    if (questionForm.options.some(option => !option.option_text.trim())) {
      toast.error("All options must have text");
      return;
    }

    setIsLoadingAction(true);

    try {
      let questionId = questionForm.id;

      if (isEditing && questionId) {
        // Update existing question
        const { error: updateError } = await supabase
          .from("questions")
          .update({
            question_text: questionForm.question_text,
            question_type: questionForm.question_type,
            difficulty: questionForm.difficulty
          })
          .eq("id", questionId);

        if (updateError) throw updateError;

        // Handle options - first delete existing options
        const { error: deleteOptionsError } = await supabase
          .from("question_options")
          .delete()
          .eq("question_id", String(questionId));

        if (deleteOptionsError) throw deleteOptionsError;
      } else {
        // Create new question
        const { data: questionData, error: createError } = await supabase
          .from("questions")
          .insert({
            question_text: questionForm.question_text,
            question_type: questionForm.question_type,
            difficulty: questionForm.difficulty,
            assessment_id: assessmentId,
            is_assessment: true
          })
          .select("id")
          .single();

        if (createError) throw createError;
        questionId = questionData.id;
      }

      // Insert all options
      const optionsToInsert = questionForm.options.map(option => ({
        question_id: String(questionId),
        option_text: option.option_text,
        is_correct: option.is_correct,
      }));

      const { error: insertOptionsError } = await supabase
        .from("question_options")
        .insert(optionsToInsert);

      if (insertOptionsError) throw insertOptionsError;

      toast.success(isEditing ? "Question updated successfully" : "Question created successfully");
      fetchQuestions();
      setShowQuestionDialog(false);
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error(isEditing ? "Failed to update question" : "Failed to create question");
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className="container py-10 bg-gradient-to-b from-background to-background/95 text-foreground min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link href="/admin/dashboard" className="inline-flex items-center">
            <Button variant="outline" size="sm" className="mr-2 hover:bg-primary/10 transition-colors duration-200">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            {assessment ? `Manage Questions: ${assessment.title}` : "Loading Assessment..."}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchQuestions}
            disabled={loading || isLoadingAction}
            className="hover:bg-primary/10 transition-colors duration-200 rounded-lg shadow-md shadow-primary/5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={handleAddQuestion}
            size="sm"
            disabled={loading || isLoadingAction}
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200 rounded-lg shadow-md shadow-primary/5"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {assessment && (
        <Card className="mb-8 border-border bg-card text-card-foreground shadow-lg shadow-primary/5 rounded-xl overflow-hidden">
          {/* Add a subtle top border accent */}
          <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/50"></div>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Assessment Details</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEditAssessment}
                disabled={isSavingAssessment}
                className="hover:bg-primary/10 transition-colors duration-200"
              >
                {isEditingAssessment ? (
                  <>Cancel</>
                ) : (
                  <><Pencil className="h-4 w-4 mr-2" />Edit Assessment</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingAssessment ? (
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-sm font-medium text-muted-foreground">Title</Label>
                  <Input
                    id="title"
                    value={assessmentForm.title}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                    placeholder="Enter assessment title"
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time_limit" className="text-sm font-medium text-muted-foreground">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="1"
                    max="180"
                    value={assessmentForm.time_limit}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, time_limit: parseInt(e.target.value) || 60 })}
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-sm font-medium text-muted-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={assessmentForm.description}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
                    placeholder="Enter assessment description"
                    className="min-h-[100px] focus-visible:ring-primary"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={saveAssessmentChanges}
                    disabled={isSavingAssessment}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
                  >
                    {isSavingAssessment ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Title</h3>
                  <p>{assessment.title}</p>
                </div>
                <div>
                  <h3 className="font-medium">Time Limit</h3>
                  <p>{assessment.time_limit} minutes</p>
                </div>
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{assessment.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Questions</h3>
                  <p>{questions.length} questions (of {assessment.number_of_questions} planned)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card className="border-border bg-card text-card-foreground shadow-lg shadow-primary/5 rounded-xl overflow-hidden">
        {/* Add a subtle top border accent */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/80 to-primary/30"></div>
        <CardHeader className="pb-3">
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              No questions found. Click "Add Question" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-border rounded-lg p-5 hover:bg-muted/40 transition-all duration-200 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border-primary/20">{index + 1}</Badge>
                        <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-medium rounded-full">
                          {question.question_type === "multiple_choice"
                            ? "Multiple Choice"
                            : "True/False"}
                        </Badge>
                        {question.difficulty && (
                          <Badge
                            variant="default"
                            className={`
                              ${question.difficulty === "easy" ? "bg-green-800 hover:bg-green-900" : ""}
                              ${question.difficulty === "medium" ? "bg-yellow-800 hover:bg-yellow-900" : ""}
                              ${question.difficulty === "hard" ? "bg-red-800 hover:bg-red-900" : ""}
                            `}
                          >
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-lg">{question.question_text}</h4>
                      {question.description && (
                        <p className="text-sm text-muted-foreground mt-1 mb-2">
                          {question.description}
                        </p>
                      )}
                      <div className="mt-3 space-y-2">
                        {question.options?.map((option) => (
                          <div
                            key={option.id}
                            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${option.is_correct
                              ? "bg-green-950/70 border border-green-800 text-green-300 hover:bg-green-950"
                              : "bg-gray-800/60 border border-gray-700 text-gray-300 hover:bg-gray-800"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.option_text}</span>
                              {option.is_correct && <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-300">✓</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditQuestion(question)}
                        disabled={isLoadingAction}
                        className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(question.id)}
                        disabled={isLoadingAction}
                        className="rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the question details below."
                : "Create a new question by filling out the form below."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Question Text */}
            <div className="grid gap-2">
              <Label htmlFor="question_text">Question Text *</Label>
              <Textarea
                id="question_text"
                name="question_text"
                value={questionForm.question_text}
                onChange={handleQuestionChange}
                placeholder="Enter the question text"
                className="min-h-[80px]"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description/Hint (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={questionForm.description}
                onChange={handleQuestionChange}
                placeholder="Enter additional context or hints"
                className="min-h-[60px]"
              />
            </div>

            {/* Question Type */}
            <div className="grid gap-2">
              <Label htmlFor="question_type">Question Type</Label>
              <Select
                value={questionForm.question_type}
                onValueChange={(value) => handleSelectChange("question_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={questionForm.difficulty}
                onValueChange={(value) => handleSelectChange("difficulty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Answer Options *</Label>
                {questionForm.question_type === "multiple_choice" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    disabled={questionForm.options.length >= 8}
                    type="button"
                  >
                    Add Option
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Mark at least one option as correct.
              </p>

              <div className="space-y-3">
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-1">
                      <Input
                        value={option.option_text}
                        onChange={(e) =>
                          handleOptionChange(index, "option_text", e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        disabled={questionForm.question_type === "true_false"}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={option.is_correct}
                          onCheckedChange={(checked) =>
                            handleOptionChange(index, "is_correct", checked)
                          }
                          id={`correct-${index}`}
                        />
                        <Label htmlFor={`correct-${index}`} className="text-sm cursor-pointer">
                          Correct
                        </Label>
                      </div>
                      {questionForm.question_type === "multiple_choice" && questionForm.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowQuestionDialog(false)}
              disabled={isLoadingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={saveQuestion}
              disabled={isLoadingAction}
            >
              {isLoadingAction ? "Saving..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Question" : "Create Question"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
              All associated options will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoadingAction}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteQuestion}
              disabled={isLoadingAction}
            >
              {isLoadingAction ? "Deleting..." : "Delete Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* We've removed the Assessment Edit Dialog as requested */}

    </div>
  );
}
