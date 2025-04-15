"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  BarChart,
  Menu,
  X,
  Home,
  BookText,
  GraduationCap,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  User,
  UserCircle,
  Settings,
} from "lucide-react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import UserGreetText from "@/components/UserGreetText";
import LoginButton from "@/components/LoginLogoutButton";
import NavLink from "@/components/ui-custom/NavLink";
import NavButton from "@/components/ui-custom/NavButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { ReactNode } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";

interface LayoutProps {
  children: React.ReactNode;
}

// Define types
type Feature = {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
};

type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
};

type PricingPlan = {
  id: number;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
};

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(1);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  // For mobile view determination
  const [isMobile, setIsMobile] = useState(false);

  // For animation purposes
  const [isVisible, setIsVisible] = useState(false);

  // Check if component is mounted to avoid hydration issues with theme
  useEffect(() => {
    setMounted(true);
    
    // Only run client-side code after hydration
    if (typeof window !== 'undefined') {
      // Initial check for mobile view
      setIsMobile(window.innerWidth < 768);
      
      // Fetch user data
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      };
      
      fetchUser();
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev % features.length) + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMenuOpen &&
        !target.closest("#mobile-menu") &&
        !target.closest("#menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Mobile logout handler
  const handleMobileLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Also close menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        // md breakpoint in Tailwind
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Toggle theme handler for mobile view
  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  // Logout handler with Supabase
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsMenuOpen(false);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error logging out:", error.message);
        throw error;
      }

      // Redirect to home page after successful logout
      router.push("/");

      // Optional: Clear any local storage or cookies if needed
      // localStorage.removeItem('some-key');
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get logo based on theme and screen size
  const getLogo = () => {
    // Make sure we return the same thing on server and client for initial render
    return "https://cdn.prod.website-files.com/65cf50589440654730dd6e6f/65d82ef1cf52cae0205985ca_FB%20Academy.svg";
  };

  // Sample data
  const features: Feature[] = [
    {
      id: 1,
      title: "Interactive Courses",
      description:
        "Engage your students with interactive content, quizzes, and multimedia lessons that make learning enjoyable and effective.",
      icon: <BookOpen className="w-10 h-10 text-primary" />,
    },
    {
      id: 2,
      title: "Community Learning",
      description:
        "Foster collaboration through discussion forums, group projects, and peer reviews to enhance the learning experience.",
      icon: <Users className="w-10 h-10 text-primary" />,
    },
    {
      id: 3,
      title: "Certifications",
      description:
        "Offer certificates and badges upon course completion to recognize achievements and motivate your learners.",
      icon: <Award className="w-10 h-10 text-primary" />,
    },
    {
      id: 4,
      title: "Advanced Analytics",
      description:
        "Track student progress and engagement with detailed analytics to optimize your teaching approach.",
      icon: <BarChart className="w-10 h-10 text-primary" />,
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Training Director",
      company: "TechCorp",
      quote:
        "Implementing this LMS transformed our corporate training program. Our employee engagement increased by 78% and training completion rates soared.",
      avatar: "/api/placeholder/100/100",
    },
    {
      id: 2,
      name: "David Chen",
      role: "Professor",
      company: "Global University",
      quote:
        "The flexibility and rich features of this platform allowed us to easily transition to online learning while maintaining educational quality.",
      avatar: "/api/placeholder/100/100",
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "CEO",
      company: "EduStart",
      quote:
        "As a small educational startup, we needed a scalable solution. This LMS provided everything we needed at a price point that made sense for our growth.",
      avatar: "/api/placeholder/100/100",
    },
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: 1,
      name: "Starter",
      price: "$49",
      description: "Perfect for small teams and individual educators",
      features: [
        "Up to 100 students",
        "10 courses",
        "Basic analytics",
        "Email support",
      ],
      popular: false,
    },
    {
      id: 2,
      name: "Professional",
      price: "$99",
      description: "Ideal for growing educational institutions",
      features: [
        "Up to 1,000 students",
        "Unlimited courses",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      popular: true,
    },
    {
      id: 3,
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with specific needs",
      features: [
        "Unlimited students",
        "Unlimited courses",
        "Advanced analytics & reporting",
        "24/7 dedicated support",
        "Custom integrations",
        "Single Sign-On (SSO)",
      ],
      popular: false,
    },
  ];

  // Footer navigation links
  const footerLinks = [
    {
      title: "Learn",
      links: [
        { name: "Courses", href: "/course" },
        { name: "Tutorials", href: "/tutorials" },
        { name: "Docs", href: "https://docs.flytbase.com/" },
        { name: "Blog", href: "https://www.flytbase.com/blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "https://www.flytbase.com/contact" },
        { name: "FAQ", href: "/faq" },
        { name: "Community", href: "/community" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
      ],
    },
  ];
  // Add this state variable with the existing state declarations
  const [isAdmin, setIsAdmin] = useState(false);

  // Add this useEffect to check if the user is an admin when the component mounts
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Error fetching user or user not found");
          return;
        }

        // Check if user has admin privileges
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        setIsAdmin(profileData?.is_admin || false);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);
  return (
    <div className="min-h-screen flex flex-col ">
      <nav
        className={`w-full sticky top-0 z-50 transition-all duration-200  ${
          isScrolled
            ? "bg-card/90 backdrop-blur-md shadow-md"
            : "bg-card shadow-sm"
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20">
            <div className="flex items-center">
              <Link className="flex items-center" href="/">
                <img
                  src={getLogo()}
                  alt="Flytbase Academy"
                  className="h-12 xs:h-11 sm:h-11 md:h-14 lg:h-16 w-auto max-w-[180px] xs:max-w-[170px] sm:max-w-[190px] md:max-w-[240px] lg:max-w-[280px] object-contain"
                />
              </Link>
            </div>
            

            <div className="hidden md:flex items-center space-x-6 ">
              {/* Desktop navigation */}
              <div className="flex items-center space-x-5 ">
                <NavLink href="/assignment">
                  <span className="text-sm md:text-base font-normal">Certifications</span>
                </NavLink>
                <NavLink href="/course">
                  <span className="text-sm md:text-base font-normal">Courses</span>
                </NavLink>
                
                {/* Resources Dropdown */}
                <div className="relative group mx-2">
                  <div className="flex items-center cursor-pointer">
                    <span className="text-sm md:text-sm font-normal">RESOURCES</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 transition-transform duration-200 group-hover:-rotate-180">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-2 w-48 bg-card rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-border">
                    <div className="py-1">
                      <Link href="/glossary" className="block px-4 py-2 text-sm hover:bg-accent hover:text-primary">
                      Glossary
                      </Link>
                      <Link href="/tutorials" className="block px-4 py-2 text-sm hover:bg-accent hover:text-primary">
                        Tutorials
                      </Link>
                      <Link target="_blank" href="https://www.flytbase.com/webinars?utm_source=navbar&utm_medium=nav_webinar&utm_id=webinar_lead" className="block px-4 py-2 text-sm hover:bg-accent hover:text-primary">
                        Webinars
                      </Link>
                      <Link target="_blank" href="https://docs.flytbase.com/" className="block px-4 py-2 text-sm hover:bg-accent hover:text-primary">
                        Documentation
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-8 w-px bg-border/70"></div>
              <UserGreetText />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                id="menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-primary focus:outline-none p-2 rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden bg-card py-4 px-4 shadow-lg border-t border-border animate-in slide-in-from-top duration-300"
          >
            <div className="space-y-1 flex flex-col">
              <div onClick={() => setIsMenuOpen(false)}>
                <NavLink href="/assignment">
                  <span className="text-sm font-semibold">CERTIFICATES</span>
                </NavLink>
              </div>
              <div onClick={() => setIsMenuOpen(false)}>
                <NavLink href="/course">
                  <span className="text-sm font-semibold">COURSES</span>
                </NavLink>
              </div>
              
              {/* Resources section in mobile */}
              <div className="mt-2 pt-2 border-t border-border/30 font-semibold">
                <div className="px-3 py-2">
                  <h3 className="text-sm font-semibold">Resources</h3>
                </div>
                <div className="space-y-1 pl-3">
                  <Link href="/glossary" className="block py-2 text-sm hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                    Glossary
                  </Link>
                  <Link href="/tutorials" className="block py-2 text-sm hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                    Tutorials
                  </Link>
                  <Link href="https://www.flytbase.com/webinars?utm_source=navbar&utm_medium=nav_webinar&utm_id=webinar_lead" className="block py-2 text-sm hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                    Webinars
                  </Link>
                  <Link href="/docs" className="block py-2 text-sm hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                    Documentation
                  </Link>
                </div>
              </div>
              
              {/* User profile section in mobile menu */}
              <div className="pt-4 mt-4 border-t border-border">
                {user ? (
                  <>
                    {/* User profile area in mobile */}
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Signed in as{" "}
                      <span className="font-medium text-foreground">
                        {user.user_metadata?.full_name || user.email || "User"}
                      </span>
                    </div>
                    
                    {/* Dashboard link */}
                    <button
                      onClick={() => {
                        router.push("/dashboard");
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 text-foreground hover:text-primary hover:bg-accent/50 transition-colors duration-300 py-3 px-3 rounded-md"
                    >
                      <Home className="w-5 h-5" />
                      <span>Dashboard</span>
                    </button>
                    
                    {/* Admin Dashboard link - only shown if user is admin */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          router.push("/admin/dashboard");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 text-foreground hover:text-primary hover:bg-accent/50 transition-colors duration-300 py-3 px-3 rounded-md"
                      >
                        <Users className="w-5 h-5" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {/* Functional logout button */}
                    <button
                      onClick={() => {
                        handleMobileLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors duration-300 py-3 px-3 rounded-md"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-3">
                    <button
                      onClick={() => {
                        router.push("/signup");
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 py-2 px-3 rounded-md"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      {/* Enhanced Footer */}
      <footer className="bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Footer main content */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company info */}
            <div>
              <img
                src={getLogo()}
                alt="Flytbase Academy"
                className="h-10 xs:h-9 sm:h-10 md:h-10 w-auto mb-4 max-w-[160px] sm:max-w-[160px]"
              />
              <p className="text-sm text-muted-foreground mb-4">
                Empowering learners worldwide with cutting-edge drone technology
                education and professional training programs.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Footer link columns */}
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border py-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Flytbase Academy. All rights
              reserved.
            </p>

            <div className="flex mt-4 md:mt-0 space-x-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
