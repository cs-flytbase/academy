"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface SubmitModalProps {
  isOpen: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  answeredQuestions: number;
  totalQuestions: number;
}

const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onSubmit,
  onCancel,
  answeredQuestions,
  totalQuestions,
}) => {
  const allQuestionsAnswered = answeredQuestions === totalQuestions;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px] animate-scale-in">
        <DialogHeader className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-primary mb-2" />
          <DialogTitle className="text-xl">Submit your test</DialogTitle>
          <DialogDescription className="text-base">
            {allQuestionsAnswered
              ? "You've answered all questions. Ready to submit your test?"
              : `You've answered ${answeredQuestions} of ${totalQuestions} questions. Are you sure you want to submit?`}
          </DialogDescription>
        </DialogHeader>

        {!allQuestionsAnswered && (
          <div className="my-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            <p className="font-medium">You have unanswered questions</p>
            <p className="mt-1">
              You can go back and complete them, or submit the test with your
              current answers.
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row-reverse gap-2 ">
          <Button
            onClick={onSubmit}
            className="w-full sm:w-auto cursor-pointer"
          >
            Submit Test
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto cursor-pointer"
          >
            Continue Working
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitModal;
