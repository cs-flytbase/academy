"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Loading fallback component
function ErrorLoading() {
  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center pb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Loading Error Details...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Main content component that uses client-side hooks
function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("message") || "An unexpected error occurred.";

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center pb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription className="pt-2">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            We apologize for the inconvenience. You can try refreshing the page or going back to the home page.
            If the problem persists, please contact our support team.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <Button 
            variant="default" 
            className="w-full flex items-center gap-2"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Home className="h-4 w-4" /> Go to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main component with suspense boundary
export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorLoading />}>
      <ErrorContent />
    </Suspense>
  );
}
