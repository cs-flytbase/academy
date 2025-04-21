import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TestProvider } from "@/contexts/TestContext";
import { Toaster } from "@/components/ui/sonner";
import { primaryFont } from "./fonts"; // Import custom font
import { Geist, Geist_Mono } from 'next/font/google'
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
export const metadata: Metadata = {
  title: "FB Academy",
  description: "Flytbase Academy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // Only use the custom font
        // className={`${primaryFont.variable} antialiased`}
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background overflow-x-hidden`}
        suppressHydrationWarning
      >
        <TestProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </TestProvider>
      </body>
    </html>
  );
}