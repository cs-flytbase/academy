# Supabase Implementation Guide

This document provides detailed instructions on implementing and using Supabase in Next.js applications, specifically focusing on the Academy platform's implementation patterns.

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Configuration](#environment-configuration)
- [Authentication](#authentication)
- [Database Operations](#database-operations)
- [Storage](#storage)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Edge Functions](#edge-functions)
- [Security Best Practices](#security-best-practices)
- [Common Pitfalls](#common-pitfalls)
- [Deployment Considerations](#deployment-considerations)

## Introduction

Supabase is an open-source Firebase alternative providing all the backend services needed for building web and mobile applications. It includes:

- PostgreSQL Database
- Authentication
- Auto-generated APIs
- Real-time subscriptions
- Storage
- Edge Functions

This project uses Supabase with Next.js (App Router) for developing a robust learning management system.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account
- Basic understanding of TypeScript and React

## Project Setup

### 1. Create a Supabase Project

1. Sign up for a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project and note your project URL and anon key
3. Set up your database schema or use migrations

### 2. Install Required Packages

```bash
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs
```

Or using yarn:

```bash
yarn add @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs
```

## Environment Configuration

Create or modify your `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Only for secure server operations
```

**IMPORTANT:** Never expose your `SUPABASE_SERVICE_ROLE_KEY` to the client. This key has admin privileges and should only be used in secure server environments.

## Supabase Client Setup

### Create Client Utility Files

Create the following utility files to standardize Supabase client creation:

#### 1. Client-side Supabase client (`src/utils/supabase/client.ts`)

```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

#### 2. Server-side Supabase client (`src/utils/supabase/server.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
```

#### 3. Middleware for Session Management (`src/utils/supabase/middleware.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // If we're destroying a cookie, we need to explicitly set SameSite=Lax
          // See https://github.com/supabase/auth-helpers/issues/788
          if (value === "") {
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            supabaseResponse.cookies.set(name, value, options);
          } else {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
        remove(name, options) {
          supabaseResponse.cookies.set(name, "", options);
        },
      },
    }
  );

  // This will refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getUser();

  // If user is signed in and the current path is / redirect the user to /dashboard
  if (session && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not signed in and the current path is not / or /login redirect the user to /
  if (
    !session &&
    request.nextUrl.pathname !== "/" &&
    !request.nextUrl.pathname.startsWith("/login")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you want to redirect, create a new response.
  // You can, however, modify the cookies of the response, i.e.:
  //
  // if (shouldRedirect) {
  //    const myNewResponse = NextResponse.redirect(new URL('/where-im-redirecting-to', url))
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  //    return myNewResponse
  // }

  return supabaseResponse;
}
```

## Authentication

### Setup Authentication Actions

Create an auth-actions.ts file to handle authentication operations:

```typescript
// src/lib/auth-actions.ts
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
}

// Login action
export async function login(data: LoginCredentials) {
  "use server";

  const supabase = await createClient();

  // Optional: Validate input with zod or similar
  if (!data.email || !data.password) {
    return { error: { message: "Email and password are required" } };
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error };
  }

  return redirect("/dashboard");
}

// Sign up action
export async function signup(data: SignupCredentials) {
  "use server";

  const supabase = await createClient();

  // Validate input
  if (!data.email || !data.password) {
    return { error: { message: "Email and password are required" } };
  }

  // Create user profile metadata
  const userData = {
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name || "",
      },
    },
  };

  const { error } = await supabase.auth.signUp(userData);

  if (error) {
    return { error };
  }

  return redirect("/login?message=Check your email to confirm your account");
}

// Logout action
export async function logout() {
  "use server";

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error };
  }

  return redirect("/");
}
```

### Implementing Authentication UI

Implement forms that call these server actions:

```tsx
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { login } from "@/lib/auth-actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = await login({ email, password });
    
    if (result?.error) {
      setError(result.error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <div>
        <label htmlFor="email">Email</label>
        <input 
          id="email"
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input 
          id="password"
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
```

## Database Operations

### Basic CRUD Operations

#### Reading Data

```typescript
// Client component example
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCourses();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Courses</h2>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Server Component Example

```typescript
// Server component example
import { createClient } from "@/utils/supabase/server";

export default async function ServerCoursesList() {
  const supabase = await createClient();
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching courses:', error);
    return <div>Error loading courses</div>;
  }
  
  return (
    <div>
      <h2>Courses</h2>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Creating Data

```typescript
async function createCourse(courseData) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .insert([courseData])
    .select();
    
  if (error) throw error;
  return data[0];
}
```

#### Updating Data

```typescript
async function updateCourse(courseId, updates) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select();
    
  if (error) throw error;
  return data[0];
}
```

#### Deleting Data

```typescript
async function deleteCourse(courseId) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);
    
  if (error) throw error;
  return true;
}
```

### Advanced Queries

#### Filtering

```typescript
// Get all published courses for a specific category
const { data } = await supabase
  .from('courses')
  .select('*')
  .eq('status', 'published')
  .eq('category_id', categoryId);
```

#### Joins

```typescript
// Get courses with their categories and authors
const { data } = await supabase
  .from('courses')
  .select(`
    id, 
    title, 
    description,
    categories(id, name),
    authors(id, name, avatar_url)
  `);
```

#### Pagination

```typescript
// Get courses with pagination
const { data, count } = await supabase
  .from('courses')
  .select('*', { count: 'exact' })
  .range(0, 9); // First 10 items (0-9)
```

## Storage

### Upload Files

```typescript
async function uploadCourseThumbnail(courseId, file) {
  const supabase = await createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${courseId}-${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase
    .storage
    .from('course-thumbnails')
    .upload(fileName, file);
    
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('course-thumbnails')
    .getPublicUrl(fileName);
    
  // Update course with thumbnail URL
  await supabase
    .from('courses')
    .update({ thumbnail_url: publicUrl })
    .eq('id', courseId);
    
  return publicUrl;
}
```

### Download Files

```typescript
async function downloadFile(bucketName, filePath) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .storage
    .from(bucketName)
    .download(filePath);
    
  if (error) throw error;
  return data; // Blob
}
```

## Real-time Subscriptions

### Subscribe to Database Changes

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function RealtimeCourseProgress() {
  const [progress, setProgress] = useState(0);
  const supabase = createClient();
  const userId = "user-123"; // Get from auth context
  const courseId = "course-456"; // Get from props or params
  
  useEffect(() => {
    // Initial fetch
    fetchProgress();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('progress-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_course_progress',
          filter: `user_id=eq.${userId} AND course_id=eq.${courseId}`,
        },
        (payload) => {
          setProgress(payload.new.progress_percentage);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, courseId]);
  
  async function fetchProgress() {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('progress_percentage')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
      
    if (data && !error) {
      setProgress(data.progress_percentage);
    }
  }
  
  return (
    <div>
      <h3>Your Progress</h3>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span>{progress}% Complete</span>
    </div>
  );
}
```

## Security Best Practices

### Row Level Security (RLS)

Always implement Row Level Security policies in your Supabase tables:

```sql
-- Example RLS policy for courses table
CREATE POLICY "Users can view published courses" 
  ON courses FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Admins can manage all courses" 
  ON courses 
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
  
CREATE POLICY "Course creators can manage their own courses" 
  ON courses 
  USING (auth.uid() = created_by);
```

### Never Expose Service Role Key

**CRITICAL**: Never expose your `SUPABASE_SERVICE_ROLE_KEY` to the client. This key has admin privileges and bypasses Row Level Security.

### Validate Data on the Server

Always validate data on the server before inserting or updating:

```typescript
"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const courseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  status: z.enum(["draft", "published"]),
  // Add more fields as needed
});

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  
  try {
    // Extract and validate data
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
    };
    
    const validatedData = courseSchema.parse(data);
    
    // Add created_by from the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    validatedData.created_by = user.id;
    
    // Insert into database
    const { data: course, error } = await supabase
      .from('courses')
      .insert([validatedData])
      .select()
      .single();
      
    if (error) throw error;
    return { course };
    
  } catch (error) {
    console.error("Error creating course:", error);
    return { error: error.message };
  }
}
```

## Common Pitfalls

### 1. Not Handling Auth State Correctly

Always handle loading states and errors when checking authentication:

```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ProtectedComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setLoading(false);
      }
    }
    
    getUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to access this content</div>;
  
  return <div>Protected content for {user.email}</div>;
}
```

### 2. Not Handling Database Errors

Always handle database errors properly:

```typescript
try {
  const { data, error } = await supabase
    .from('courses')
    .select('*');
    
  if (error) throw error;
  // Process data
} catch (error) {
  // Log error to monitoring service
  console.error("Database error:", error);
  
  // Show user-friendly message
  return { error: "Failed to load courses. Please try again later." };
}
```

### 3. Not Unsubscribing from Real-time Channels

Always clean up subscriptions to avoid memory leaks:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('changes')
    .on('postgres_changes', { /* ... */ }, handleChange)
    .subscribe();
    
  // Clean up
  return () => {
    supabase.removeChannel(channel);
  };
}, [deps]);
```

## Deployment Considerations

### Environment Variables

Ensure all necessary environment variables are set in your deployment environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only for secure server-side operations)

### Cross-Origin Resource Sharing (CORS)

Configure CORS settings in your Supabase project for your deployment domains:

1. Go to your Supabase Dashboard
2. Navigate to Settings > API > CORS
3. Add your deployment URL

### Rate Limiting

Implement rate limiting for sensitive operations to prevent abuse:

```typescript
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Simple rate limiting middleware
export async function rateLimit(ip: string, limit = 10, windowMs = 60000) {
  const store = cookies();
  const now = Date.now();
  const windowKey = `rate_limit_${ip}_${Math.floor(now / windowMs)}`;
  
  const current = parseInt(store.get(windowKey)?.value || '0', 10);
  
  if (current >= limit) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }
  
  // Set cookie with short expiration
  store.set(windowKey, String(current + 1), {
    expires: new Date(now + windowMs),
  });
  
  return null; // No rate limit hit
}
```

## Conclusion

Supabase provides a robust foundation for building secure, scalable applications. By following these implementation patterns and best practices, you can create a reliable backend for web and mobile applications.

Remember to:

1. Keep your service role key secure
2. Implement proper Row Level Security policies
3. Handle authentication state correctly
4. Always validate data server-side
5. Properly handle errors and edge cases

For more information, refer to the [official Supabase documentation](https://supabase.com/docs).
