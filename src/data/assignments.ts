
import { Assignment } from "@/types";

export const assignments: Assignment[] = [
  {
    id: "a1",
    title: "Introduction to Web Development",
    description: "Test your knowledge of HTML, CSS, and JavaScript fundamentals.",
    timeLimit: 30,
    category: "Web Development",
    difficulty: "easy",
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070&auto=format&fit=crop",
    questions: [
      {
        id: "q1-a1",
        text: "What does HTML stand for?",
        type: "multiple-choice",
        options: [
          { id: "q1-a1-o1", text: "Hyper Text Markup Language" },
          { id: "q1-a1-o2", text: "Home Tool Markup Language" },
          { id: "q1-a1-o3", text: "Hyperlinks and Text Markup Language" },
          { id: "q1-a1-o4", text: "Hyper Tool Multi Language" }
        ],
        correctAnswer: "q1-a1-o1"
      },
      {
        id: "q2-a1",
        text: "Which CSS property is used to control the text size?",
        type: "multiple-choice",
        options: [
          { id: "q2-a1-o1", text: "font-style" },
          { id: "q2-a1-o2", text: "text-size" },
          { id: "q2-a1-o3", text: "font-size" },
          { id: "q2-a1-o4", text: "text-style" }
        ],
        correctAnswer: "q2-a1-o3"
      },
      {
        id: "q3-a1",
        text: "Explain how JavaScript differs from Java.",
        type: "essay",
      }
    ]
  },
  {
    id: "a2",
    title: "Data Structures and Algorithms",
    description: "Test your knowledge of fundamental data structures and algorithms.",
    timeLimit: 45,
    category: "Computer Science",
    difficulty: "medium",
    thumbnail: "https://images.unsplash.com/photo-1580894742597-87bc8789db3d?q=80&w=2070&auto=format&fit=crop",
    questions: [
      {
        id: "q1-a2",
        text: "What is the time complexity of binary search?",
        type: "multiple-choice",
        options: [
          { id: "q1-a2-o1", text: "O(1)" },
          { id: "q1-a2-o2", text: "O(n)" },
          { id: "q1-a2-o3", text: "O(log n)" },
          { id: "q1-a2-o4", text: "O(n²)" }
        ],
        correctAnswer: "q1-a2-o3"
      },
      {
        id: "q2-a2",
        text: "Describe the difference between a stack and a queue.",
        type: "essay"
      }
    ]
  },
  {
    id: "a3",
    title: "UI/UX Design Principles",
    description: "Evaluate your understanding of user interface and user experience design principles.",
    timeLimit: 20,
    category: "Design",
    difficulty: "easy",
    thumbnail: "https://images.unsplash.com/photo-1545235617-7a424c1a60cc?q=80&w=2080&auto=format&fit=crop",
    questions: [
      {
        id: "q1-a3",
        text: "What is the primary goal of UX design?",
        type: "multiple-choice",
        options: [
          { id: "q1-a3-o1", text: "Making interfaces visually appealing" },
          { id: "q1-a3-o2", text: "Creating user satisfaction and positive experiences" },
          { id: "q1-a3-o3", text: "Developing complex interactions" },
          { id: "q1-a3-o4", text: "Minimizing development costs" }
        ],
        correctAnswer: "q1-a3-o2"
      },
      {
        id: "q2-a3",
        text: "Explain the concept of accessibility in design.",
        type: "essay"
      }
    ]
  },
  {
    id: "a4",
    title: "React Fundamentals",
    description: "Test your understanding of React concepts and practices.",
    timeLimit: 35,
    category: "Web Development",
    difficulty: "medium",
    thumbnail: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2070&auto=format&fit=crop",
    questions: [
      {
        id: "q1-a4",
        text: "What is JSX in React?",
        type: "multiple-choice",
        options: [
          { id: "q1-a4-o1", text: "A JavaScript library" },
          { id: "q1-a4-o2", text: "A syntax extension for JavaScript that looks similar to HTML" },
          { id: "q1-a4-o3", text: "A database query language" },
          { id: "q1-a4-o4", text: "A React-specific HTML version" }
        ],
        correctAnswer: "q1-a4-o2"
      },
      {
        id: "q2-a4",
        text: "Explain the concept of component lifecycle in React.",
        type: "essay"
      }
    ]
  },
  {
    id: "a5",
    title: "Python Programming",
    description: "Test your Python programming skills and knowledge.",
    timeLimit: 40,
    category: "Programming",
    difficulty: "medium",
    thumbnail: "https://images.unsplash.com/photo-1649180556628-9ba704115795?q=80&w=2062&auto=format&fit=crop",
    questions: [
      {
        id: "q1-a5",
        text: "Which of the following is not a Python data type?",
        type: "multiple-choice",
        options: [
          { id: "q1-a5-o1", text: "List" },
          { id: "q1-a5-o2", text: "Dictionary" },
          { id: "q1-a5-o3", text: "Array" },
          { id: "q1-a5-o4", text: "Tuple" }
        ],
        correctAnswer: "q1-a5-o3"
      },
      {
        id: "q2-a5",
        text: "Write a Python function to check if a string is a palindrome.",
        type: "essay"
      }
    ]
  },
  {
    id: "a6",
    title: "Database Systems",
    description: "Test your knowledge of database design and SQL.",
    timeLimit: 50,
    category: "Computer Science",
    difficulty: "hard",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2021&auto=format&fit=crop",
    questions: [
      {
        id: "q1-a6",
        text: "What does ACID stand for in database systems?",
        type: "multiple-choice",
        options: [
          { id: "q1-a6-o1", text: "Atomicity, Consistency, Isolation, Durability" },
          { id: "q1-a6-o2", text: "Aggregation, Concurrency, Inheritance, Dependency" },
          { id: "q1-a6-o3", text: "Authentication, Configuration, Integration, Deployment" },
          { id: "q1-a6-o4", text: "Assembly, Compilation, Interpretation, Debugging" }
        ],
        correctAnswer: "q1-a6-o1"
      },
      {
        id: "q2-a6",
        text: "Explain the difference between SQL and NoSQL databases.",
        type: "essay"
      }
    ]
  }
];
