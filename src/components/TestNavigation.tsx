"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  AlertCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface TestNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onSubmit: () => void;
  hasAnswer: boolean;
}

const TestNavigation: React.FC<TestNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSave,
  onSubmit,
  hasAnswer,
}) => {
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const handleSave = () => {
    onSave();
    toast.success("Answer saved", {
      description: `Question ${currentQuestion + 1} saved successfully.`,
    });
  };

  return (
    <div className="w-full py-2 sm:py-4">
      {/* Mobile view (stacked layout) */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex justify-between items-center w-full">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstQuestion}
            size="sm"
            className="group cursor-pointer w-24"
          >
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs">Previous</span>
          </Button>

          <Button
            variant={isLastQuestion ? "outline" : "default"}
            onClick={onNext}
            disabled={isLastQuestion}
            size="sm"
            className="group cursor-pointer w-24"
          >
            <span className="text-xs">Next</span>
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="flex justify-between items-center w-full gap-2">
          {!hasAnswer && (
            <div className="flex items-center text-amber-500 mr-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs whitespace-nowrap">Not answered</span>
            </div>
          )}

          <div className="flex items-center ml-auto gap-2">
            <Button
              variant="ghost"
              onClick={handleSave}
              size="sm"
              className="cursor-pointer"
            >
              <Save className="mr-1 h-4 w-4" />
              <span className="text-xs">Save</span>
            </Button>

            {isLastQuestion && (
              <Button
                onClick={onSubmit}
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 cursor-pointer"
              >
                <Send className="mr-1 h-4 w-4" />
                <span className="text-xs">Submit</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tablet and desktop view (horizontal layout) */}
      <div className="hidden sm:flex justify-between items-center w-full">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="group cursor-pointer"
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          {!hasAnswer && (
            <div className="flex items-center text-amber-500 mr-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Not answered</span>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={handleSave}
            size="sm"
            className="cursor-pointer"
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>

          {isLastQuestion && (
            <Button
              onClick={onSubmit}
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 cursor-pointer"
            >
              <Send className="mr-1 h-4 w-4" />
              Submit Test
            </Button>
          )}
        </div>

        <Button
          variant={isLastQuestion ? "outline" : "default"}
          onClick={onNext}
          disabled={isLastQuestion}
          className="group cursor-pointer"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default TestNavigation;
