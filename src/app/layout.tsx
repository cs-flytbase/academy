import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TestProvider } from "@/contexts/TestContext";
import { Toaster } from "@/components/ui/sonner";
import { primaryFont } from "./fonts"; // Import custom font

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
        className={`${primaryFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <TestProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
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