import React from "react";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { QuestionForm } from "../types";

interface QuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questionForm: QuestionForm;
  setQuestionForm: (form: QuestionForm) => void;
  isEditing: boolean;
  selectedVideo: string | null;
  selectedCourse: string | null;
  saveLoading: boolean;
  setSaveLoading: (loading: boolean) => void;
  fetchVideoQuestions: () => Promise<void>;
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({
  isOpen,
  onClose,
  questionForm,
  setQuestionForm,
  isEditing,
  selectedVideo,
  selectedCourse,
  saveLoading,
  setSaveLoading,
  fetchVideoQuestions,
}) => {
  const supabase = createClient();

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

        // Delete existing options
        const { error: deleteOptionsError } = await supabase
          .from("question_options")
          .delete()
          .eq("question_id", questionForm.id);

        if (deleteOptionsError) throw deleteOptionsError;

        // Insert new options for multiple-choice questions
        if (questionForm.question_type === "multiple-choice") {
          const validOptions = questionForm.options.filter(
            (opt) => opt.option_text.trim() !== ""
          );

          if (validOptions.length > 0) {
            const optionsToInsert = validOptions.map((opt) => ({
              question_id: questionForm.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
            }));

            const { error: insertOptionsError } = await supabase
              .from("question_options")
              .insert(optionsToInsert);

            if (insertOptionsError) throw insertOptionsError;
          }
        }

        toast.success("Question updated successfully");
      } else {
        // Insert new question
        const { data: newQuestion, error: insertError } = await supabase
          .from("questions")
          .insert({
            question_text: questionForm.question_text,
            description: questionForm.description || null,
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
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the question details below."
              : "Create a new question for this video."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Question Text */}
          <div className="grid gap-2">
            <Label htmlFor="question-text">Question Text *</Label>
            <Textarea
              id="question-text"
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

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={questionForm.description || ""}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  description: e.target.value,
                })
              }
              className="min-h-[60px]"
              placeholder="Additional context or explanation about the question"
            />
          </div>

          {/* Question Type */}
          <div className="grid gap-2">
            <Label htmlFor="question-type">Question Type</Label>
            <Select
              value={questionForm.question_type}
              onValueChange={(value) =>
                setQuestionForm({
                  ...questionForm,
                  question_type: value,
                  // Reset options if changing from multiple-choice to free-response
                  options:
                    value === "multiple-choice"
                      ? questionForm.options.length > 0
                        ? questionForm.options
                        : [
                            { option_text: "", is_correct: false },
                            { option_text: "", is_correct: false },
                          ]
                      : [],
                })
              }
            >
              <SelectTrigger id="question-type">
                <SelectValue placeholder="Select a question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="free-response">Free Response</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={questionForm.difficulty || "medium"}
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

          {/* After Video End Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="after-videoend" className="cursor-pointer">
              Show after video ends
            </Label>
            <Switch
              id="after-videoend"
              checked={questionForm.after_videoend || false}
              onCheckedChange={(checked) =>
                setQuestionForm({
                  ...questionForm,
                  after_videoend: checked,
                })
              }
            />
          </div>

          {/* Multiple Choice Options */}
          {questionForm.question_type === "multiple-choice" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={questionForm.options.length >= 8}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              {questionForm.options.map((option, index) => (
                <div
                  key={index}
                  className="flex space-x-2 items-center border p-2 rounded-md"
                >
                  <Checkbox
                    id={`correct-${index}`}
                    checked={option.is_correct}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        index,
                        "is_correct",
                        checked as boolean
                      )
                    }
                  />
                  <div className="flex-1">
                    <Input
                      id={`option-${index}`}
                      value={option.option_text}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          "option_text",
                          e.target.value
                        )
                      }
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={questionForm.options.length <= 2}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saveLoading}>
            Cancel
          </Button>
          <Button onClick={saveQuestion} disabled={saveLoading}>
            {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDialog;
