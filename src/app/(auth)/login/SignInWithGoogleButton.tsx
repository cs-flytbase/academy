"use client";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-actions";

import React from "react";

const SignInWithGoogleButton = () => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2 cursor-pointer"
      onClick={() => {
        signInWithGoogle();
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 12v-2.5h9.2c.2 1 .3 2 .3 3 0 5.5-3.7 9.5-9.5 9.5S2.5 18 2.5 12 6.5 2.5 12 2.5c2.5 0 4.7.9 6.4 2.3l-1.9 1.9C15 5.8 13.6 5.2 12 5.2c-3.7 0-6.8 3-6.8 6.8s3 6.8 6.8 6.8c3.4 0 6.2-2.4 6.7-5.5H12z"
        />
      </svg>
      Login with Google
    </Button>
  );
};

export default SignInWithGoogleButton;
