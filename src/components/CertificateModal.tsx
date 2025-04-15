"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

const CertificateModal = ({
  isOpen,
  onClose,
  defaultEmail = "",
  defaultName = "",
  courseId,
  courseTitle,
  onSuccess,
}) => {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email: "" };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        alert("Please log in to generate your certificate");
        setIsSubmitting(false);
        return;
      }

      // Prepare the payload for the webhook
      const webhookPayload = {
        email: email,
        name: name,
        course: courseTitle,
        courseID: courseId,
        userID: userData.user.id,
      };

      console.log("Sending certificate request to webhook:", webhookPayload);

      // Make the API call
      const response = await fetch(
        "https://srv-roxra.app.n8n.cloud/webhook/d1e598f4-24e7-40fe-be60-91410aedd49c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookPayload),
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(
          "Webhook error response:",
          errorData || response.statusText
        );
        throw new Error("Failed to generate certificate");
      }

      // Process the response
      const responseData = await response.json().catch(() => ({}));
      console.log("Webhook response:", responseData);

      // Generate a new certificate record in the database
      const certData = {
        user_id: userData.user.id,
        course_id: courseId,
        created_at: new Date().toISOString(),
        url: responseData.url || "",
        name: name,
        email: email,
      };

      // Try to insert the certificate record
      //   try {
      //     const { data: newCert, error: createError } = await supabase
      //       .from("certificate_user")
      //       .insert(certData)
      //       .select()
      //       .single();

      //     if (createError) {
      //       console.error("Error creating certificate record:", createError);
      //       // Don't throw here - we already sent the webhook request successfully
      //     }
      //   } catch (dbError) {
      //     console.error("Database error:", dbError);
      //     // The webhook was still successful, so we'll continue
      //   }

      // Show success message
      alert(
        "Certificate request submitted successfully! You will receive your certificate shortly."
      );

      // Close the modal
      onClose();

      // Notify parent component of successful submission
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error sending certificate request:", error);
      alert(
        "There was an error generating your certificate. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Certificate Details
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Please enter the name and email you want to appear on your
            certificate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#242424] border-gray-700 text-white focus:ring-[#6b5de4] focus:border-[#6b5de4]"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#242424] border-gray-700 text-white focus:ring-[#6b5de4] focus:border-[#6b5de4]"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#6b5de4] hover:bg-[#5a4dd0] text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Generate Certificate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
