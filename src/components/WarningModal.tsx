"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface WarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="animate-scale-in">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-2" />
          <AlertDialogTitle className="text-xl">
            Are you sure you want to leave?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            If you leave now, your progress will be lost and you'll have to
            start the test again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel} className="mt-0 sm:mt-0">
            Return to Test
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Leave Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WarningModal;
