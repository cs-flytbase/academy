"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const mockCourses = [
  {
    id: 'c1',
    title: 'Advanced JavaScript',
    provider: 'Coursera',
    completed: true,
    date: 'Jan 2024'
  },
  {
    id: 'c2',
    title: 'React Performance Patterns',
    provider: 'Frontend Masters',
    completed: true,
    date: 'Feb 2024'
  },
];

const mockCertificates = [
  {
    id: 'a1',
    title: 'Full Stack Assessment',
    score: '92%',
    issuedBy: 'Code Academy',
    date: 'Mar 2024'
  },
  {
    id: 'a2',
    title: 'TypeScript Mastery Exam',
    score: '88%',
    issuedBy: 'Pluralsight',
    date: 'Apr 2024'
  },
];

export default function LearningShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = [...mockCourses, ...mockCertificates];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeIndex];
  const isCourse = 'provider' in current;

  return (
    <section className="w-full py-10 px-6 bg-muted/20 rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">🎓 Your Learning Journey</h2>

      <div className="max-w-xl mx-auto transition-all duration-500">
        <Card className="shadow-xl border bg-background animate-fade-in">
          <CardHeader>
            <CardTitle>{current.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isCourse ? (
              <>
                <p className="text-sm text-muted-foreground">Course by {current.provider}</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Completed: {current.date}
                </Badge>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Assessment by {current.issuedBy}</p>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Score: {current.score}
                </Badge>
                <p className="text-xs text-muted-foreground">Issued: {current.date}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
