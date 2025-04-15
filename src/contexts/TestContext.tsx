"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from "react";
import { TestState, TestContextType } from "@/types";

const initialState: TestState = {
  assignmentId: null,
  isActive: false,
  startTime: null,
  remainingTime: null,
  answers: {},
  completed: false,
  submitted: false,
  timeUp: false,
};

type TestAction =
  | { type: "START_TEST"; payload: { assignmentId: string; timeLimit: number } }
  | { type: "END_TEST" }
  | { type: "PAUSE_TEST" }
  | { type: "RESUME_TEST" }
  | {
      type: "SET_ANSWER";
      payload: { questionId: string; answer: string | string[] };
    }
  | { type: "UPDATE_REMAINING_TIME"; payload: number }
  | { type: "SUBMIT_TEST" }
  | { type: "TIME_UP" }
  | { type: "CLEAR_TEST" };

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case "START_TEST":
      return {
        ...state,
        assignmentId: action.payload.assignmentId,
        isActive: true,
        startTime: Date.now(),
        remainingTime: action.payload.timeLimit * 60 * 1000, // convert minutes to milliseconds
        answers: {},
        completed: false,
        submitted: false,
        timeUp: false,
      };
    case "END_TEST":
      return {
        ...state,
        isActive: false,
        completed: true,
      };
    case "PAUSE_TEST":
      return {
        ...state,
        isActive: false,
      };
    case "RESUME_TEST":
      return {
        ...state,
        isActive: true,
      };
    case "SET_ANSWER":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.answer,
        },
      };
    case "UPDATE_REMAINING_TIME":
      return {
        ...state,
        remainingTime: action.payload,
      };
    case "SUBMIT_TEST":
      return {
        ...state,
        isActive: false,
        completed: true,
        submitted: true,
      };
    case "TIME_UP":
      return {
        ...state,
        isActive: false,
        completed: true,
        timeUp: true,
      };
    case "CLEAR_TEST":
      return initialState;
    default:
      return state;
  }
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(testReducer, initialState);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Update remaining time
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (
      state.isActive &&
      state.remainingTime !== null &&
      state.remainingTime > 0
    ) {
      setIsTimerActive(true);
      interval = setInterval(() => {
        dispatch({
          type: "UPDATE_REMAINING_TIME",
          payload: Math.max(0, state.remainingTime! - 1000),
        });
      }, 1000);
    } else {
      setIsTimerActive(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isActive, state.remainingTime]);

  // Check if time is up
  useEffect(() => {
    if (state.remainingTime === 0 && state.isActive) {
      dispatch({ type: "TIME_UP" });
    }
  }, [state.remainingTime, state.isActive]);

  // Prevent leaving the page while the test is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isActive) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state.isActive]);

  const startTest = useCallback((assignmentId: string, timeLimit: number) => {
    dispatch({ type: "START_TEST", payload: { assignmentId, timeLimit } });
  }, []);

  const endTest = useCallback(() => {
    dispatch({ type: "END_TEST" });
  }, []);

  const pauseTest = useCallback(() => {
    dispatch({ type: "PAUSE_TEST" });
  }, []);

  const resumeTest = useCallback(() => {
    dispatch({ type: "RESUME_TEST" });
  }, []);

  const setAnswer = useCallback(
    (questionId: string, answer: string | string[]) => {
      dispatch({ type: "SET_ANSWER", payload: { questionId, answer } });
    },
    []
  );

  const submitTest = useCallback(() => {
    dispatch({ type: "SUBMIT_TEST" });
  }, []);

  const clearTest = useCallback(() => {
    dispatch({ type: "CLEAR_TEST" });
  }, []);

  const contextValue: TestContextType = {
    testState: state,
    startTest,
    endTest,
    pauseTest,
    resumeTest,
    setAnswer,
    submitTest,
    clearTest,
    isTimerActive,
  };

  return (
    <TestContext.Provider value={contextValue}>{children}</TestContext.Provider>
  );
};

export const useTest = (): TestContextType => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("useTest must be used within a TestProvider");
  }
  return context;
};
