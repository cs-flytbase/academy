"use client";
import React, { useEffect, useState } from "react";
import { Testimonial } from "@/types/testimonials";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

// Enhanced testimonials with drone-related content
const fakeTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Michael Chen",
    title: "Drone Surveying Specialist",
    quote:
      "The autonomous flight training completely transformed how I approach mapping projects. I've increased efficiency by 70% since completing the course.",
    rating: 5,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_image: "https://i.pravatar.cc/150?img=11",
    course_id: null,
  },
  {
    id: "2",
    name: "Sarah Williams",
    title: "Aerial Cinematographer",
    quote:
      "After learning advanced autonomous flight patterns, I've been able to capture shots that were impossible before. Clients are amazed by the results.",
    rating: 5,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_image: "https://i.pravatar.cc/150?img=5",
    course_id: null,
  },
  {
    id: "3",
    name: "James Rodriguez",
    title: "Industrial Inspection Manager",
    quote:
      "The certification program helped our team standardize inspection protocols. We've reduced site visit time by 40% using the autonomous flight techniques.",
    rating: 4,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_image: "https://i.pravatar.cc/150?img=8",
    course_id: null,
  },
  {
    id: "4",
    name: "Emma Thompson",
    title: "Precision Agriculture Consultant",
    quote:
      "The specialized agricultural modules were exactly what our farm needed. We've optimized crop monitoring and reduced costs significantly.",
    rating: 5,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_image: "https://i.pravatar.cc/150?img=23",
    course_id: null,
  },
];

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>(null);

  useEffect(() => {
    // Simulate an API call delay
    const timer = setTimeout(() => {
      setTestimonials(fakeTestimonials);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-flytbase-secondary"></div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl  rounded-4xl">
      <div className="relative">
        <Carousel
          className="w-full"
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem
                key={testimonial.id}
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2"
              >
                <div className="p-1">
                  <Card className="border-none bg-[#1A1F2C] shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Top section with profile image and stars */}
                      <div className="flex items-center mb-6">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-flytbase-secondary/20 flex-shrink-0 mr-4 border-2 border-flytbase-secondary/30">
                          <img
                            src={
                              testimonial.profile_image ||
                              `https://i.pravatar.cc/150?img=${Math.floor(
                                Math.random() * 70
                              )}`
                            }
                            alt={testimonial.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-neutral-400 mb-1">
                            {testimonial.title}
                          </p>
                          <div className="flex">
                            {Array.from({ length: testimonial.rating }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-flytbase-secondary text-flytbase-secondary"
                                />
                              )
                            )}
                            {Array.from({ length: 5 - testimonial.rating }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 text-flytbase-secondary/30"
                                />
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quote section */}
                      <div className="bg-[#0D1117]/50 p-4 rounded-lg flex-grow flex items-center">
                        <p className="text-lg italic text-neutral-300">
                          "{testimonial.quote}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={() => api?.scrollPrev()}
              className="h-10 w-10 rounded-full bg-[#1A1F2C] border border-flytbase-secondary/20 flex items-center justify-center text-flytbase-secondary hover:bg-flytbase-secondary/10 focus:outline-none transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              className="h-10 w-10 rounded-full bg-[#1A1F2C] border border-flytbase-secondary/20 flex items-center justify-center text-flytbase-secondary hover:bg-flytbase-secondary/10 focus:outline-none transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default TestimonialSlider;
