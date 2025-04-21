import React from "react";
import { Question } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionListProps {
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (id: number) => void;
  loading: boolean;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onEditQuestion,
  onDeleteQuestion,
  loading,
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
                {question.after_videoend && (
                  <Badge variant="secondary">After Video End</Badge>
                )}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditQuestion(question)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteQuestion(question.id)}
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

export default QuestionList;
