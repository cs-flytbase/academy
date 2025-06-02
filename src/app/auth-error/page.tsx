"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, AlertTriangle, AlertCircle, ArrowRight } from "lucide-react";
import { Suspense } from "react";

// Loading fallback component
function AuthErrorLoading() {
  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center pb-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Main content component using client hooks
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const email = searchParams.get("email") || "";

  // Different error scenarios
  const isEmailInUse = error === "email-in-use";
  const isPendingVerification = error === "pending-verification";
  const isUserNotFound = error === "user-not-found";
  
  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center pb-4">
            <div className={`w-16 h-16 rounded-full ${isPendingVerification ? "bg-amber-100 dark:bg-amber-900/30" : "bg-red-100 dark:bg-red-900/30"} flex items-center justify-center`}>
              {isPendingVerification ? (
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isPendingVerification 
              ? "Please Verify Your Email" 
              : isEmailInUse 
                ? "Email Already Registered" 
                : isUserNotFound
                  ? "Account Not Found"
                  : "Authentication Error"}
          </CardTitle>
          <CardDescription className="pt-2">
            {isPendingVerification 
              ? "We need to verify it's really you before you can access your account."
              : isEmailInUse 
                ? `The email ${email} is already registered with an account.`
                : isUserNotFound
                  ? `We couldn't find an account with the email ${email}.`
                  : "There was a problem with your authentication request."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {isPendingVerification ? (
            <Alert variant="default" className="mb-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
              <AlertTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> One Last Step
              </AlertTitle>
              <AlertDescription>
                It looks like you haven't verified your email address yet. We sent a verification link to <strong>{email}</strong>. 
                Please check your inbox (and spam folder) to complete your registration.
              </AlertDescription>
            </Alert>
          ) : isEmailInUse ? (
            <p className="text-sm text-muted-foreground">
              You already have an account with this email address. Please sign in instead.
            </p>
          ) : isUserNotFound ? (
            <p className="text-sm text-muted-foreground">
              The email address you entered is not registered in our system. Please check that you entered the correct email address or sign up for a new account.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try again or contact support if the issue persists.
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          {isPendingVerification ? (
            <>
              <Link href="/verify-email" className="w-full">
                <Button variant="default" className="w-full">
                  Verification Instructions
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </>
          ) : isEmailInUse ? (
            <>
              <Link href="/login" className="w-full">
                <Button variant="default" className="w-full flex items-center justify-center gap-2">
                  Sign In Instead <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button variant="outline" className="w-full">
                  Use Different Email
                </Button>
              </Link>
            </>
          ) : isUserNotFound ? (
            <>
              <Link href="/signup" className="w-full">
                <Button variant="default" className="w-full flex items-center justify-center gap-2">
                  Sign Up Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Try Another Email
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup" className="w-full">
                <Button variant="default" className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Main component with suspense boundar
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorLoading />}>
      <AuthErrorContent />
    </Suspense>
  );
}
