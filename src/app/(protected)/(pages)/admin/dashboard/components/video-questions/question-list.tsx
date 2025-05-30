import React from "react";
import { Question } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Play, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface QuestionListProps {
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (id: number) => void;
  loading: boolean;
  onRefresh: () => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onEditQuestion,
  onDeleteQuestion,
  loading,
  onRefresh,
}) => {
  if (loading) {
    return <div className="py-4">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No questions found for this video. Click "Add Question" to create one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">
                  {question.question_type === "multiple-choice"
                    ? "Multiple Choice"
                    : "Free Response"}
                </Badge>
                <Badge
                  variant={question.difficulty === "hard" ? "destructive" : 
                          question.difficulty === "medium" ? "default" : "outline"}
                >
                  {question.difficulty}
                </Badge>
              </div>
              <h4 className="font-medium">{question.question_text}</h4>
              {question.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {question.description}
                </p>
              )}

              {/* Show options for multiple choice */}
              {question.question_type === "multiple-choice" && (
                <div className="mt-2 grid grid-cols-1 gap-1">
                  {question.options?.map((option, idx) => (
                    <div
                      key={idx}
                      className={`text-sm p-1 px-2 rounded ${option.is_correct ? "bg-green-100 dark:bg-green-900/20" : ""}`}
                    >
                      {option.is_correct && (
                        <span className="mr-1">✓</span>
                      )}
                      {option.option_text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2 ml-4">
              <ToggleVideoEndButton question={question} onToggled={onRefresh} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditQuestion(question)}
                title="Edit question"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteQuestion(question.id)}
                title="Delete question"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Component to toggle after_videoend setting
const ToggleVideoEndButton = ({ question, onToggled }: { question: Question, onToggled: () => void }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const toggleAfterVideoEnd = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("questions")
        .update({ after_videoend: !question.after_videoend })
        .eq("id", question.id);
      
      if (error) throw error;
      
      toast.success(`Question will ${!question.after_videoend ? "now" : "no longer"} play after video ends`);
      onToggled(); // Refresh the questions list
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleAfterVideoEnd}
      disabled={isLoading}
      className={`${question.after_videoend ? "text-green-500 hover:text-green-600" : "text-gray-400 hover:text-gray-500"}`}
      title={question.after_videoend ? "Currently plays after video - Click to disable" : "Click to make question play after video ends"}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : question.after_videoend ? (
        <Check className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
};

export default QuestionList;
