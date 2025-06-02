"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  // "http://localhost:3000";

  url = url.startsWith("http") ? url : `https://${url}`;

  // REMOVE this line to prevent adding an extra slash
  // url = url.endsWith("/") ? url : `${url}/`;

  return url;
};

export async function login(formData: FormData) {
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const data = { email, password };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // Log all login errors with full context
    console.error("Login error:", {
      message: error.message,
      code: error.code,
      status: error.status,
      email: email, // Include email for debugging (don't include password)
    });
    
    // First check specifically for email not confirmed errors
    if (error.code === "email_not_confirmed" || 
        error.message.includes("Email not confirmed") || 
        error.message.includes("verification") || 
        error.message.includes("not verified")) {
      // This error means the user's email is not verified
      redirect(`/auth-error?error=pending-verification&email=${encodeURIComponent(email)}`);
    }
    
    // Then handle user not found / invalid credentials
    if (error.message.includes("Invalid login credentials") ||
        error.message.includes("user not found") ||
        error.message.includes("User not found") ||
        error.status === 404) {
      redirect(`/auth-error?error=user-not-found&email=${encodeURIComponent(email)}`);
    }
    
    // Handle other authentication errors with specific messages
    const errorMessage = encodeURIComponent(error.message || "Authentication failed");
    redirect(`/app-error?message=${errorMessage}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const email = formData.get("email") as string;
  
  // Instead of checking if the email exists directly (which requires admin privileges),
  // we'll try to sign up and handle the error based on the response

  // If we reach here, email doesn't exist, proceed with signup
  const data = {
    email: email,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: `${firstName + " " + lastName}`,
        email: email,
      },
      // Explicitly enable email confirmation
      emailRedirectTo: `${getURL()}/auth/callback`,
    },
  };

  const { error, data: signupData } = await supabase.auth.signUp(data);
  
  // Handle errors from the signup process
  if (error) {
    console.error("Signup error:", error.message);
    
    // Check for specific error messages
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      // Try to sign in with provided credentials to check if email is verified
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.get("password") as string
      });
      
      if (signInError && signInError.message.includes("Email not confirmed")) {
        // Email exists but is not verified
        redirect(`/auth-error?error=pending-verification&email=${encodeURIComponent(email)}`);
      } else {
        // Email exists and is already confirmed
        redirect(`/auth-error?error=email-in-use&email=${encodeURIComponent(email)}`);
      }
    }
    
    // For other errors, redirect to general error page with specific message
    const errorMessage = encodeURIComponent(error.message || "Signup failed");
    redirect(`/app-error?message=${errorMessage}`);
  }

  // Check if email confirmation is required from the signup response
  if (signupData?.user && !signupData.user.email_confirmed_at) {
    // Redirect to email verification page
    revalidatePath("/verify-email", "layout");
    redirect("/verify-email");
  } else {
    // In some configs, emails might be auto-confirmed - redirect to login
    redirect("/login");
  }
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Signout error:", error.message);
    const errorMessage = encodeURIComponent(error.message || "Sign out failed");
    redirect(`/app-error?message=${errorMessage}`);
  }

  redirect("/logout");
}
export async function signInWithGoogle() {
  const supabase = await createClient();
  const redirectURL = `${getURL()}/auth/callback`; // Uses updated getURL function

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectURL,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) {
    console.error("Google sign-in error:", error.message);
    const errorMessage = encodeURIComponent(error.message || "Google sign-in failed");
    redirect(`/app-error?message=${errorMessage}`);
  }

  redirect(data.url);
}
