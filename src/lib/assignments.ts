"use client";

import { useCallback, useEffect, useState } from "react";

export type Submission = { memberId: string; text: string; submittedAt: string };

export type Assignment = {
  id: string;
  title: string;
  description: string;
  image?: string; // data URL
  videoUrl?: string;
  lessonId?: string;
  assignedTo: string[]; // member ids
  createdAt: string;
  submissions: Submission[];
};

const KEY = "iklipse.assignments.v1";
const today = () => {
  try {
    return new Date().toISOString().slice(0, 10);
  } catch {
    return "2026-06-22";
  }
};

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setAssignments(raw ? (JSON.parse(raw) as Assignment[]) : []);
    } catch {
      setAssignments([]);
    }
    setReady(true);
  }, []);

  const write = (next: Assignment[]) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore quota
    }
  };

  const create = useCallback((a: Omit<Assignment, "id" | "createdAt" | "submissions">) => {
    setAssignments((prev) => {
      const na: Assignment = { ...a, id: `as-${Date.now().toString(36)}`, createdAt: today(), submissions: [] };
      const next = [na, ...prev];
      write(next);
      return next;
    });
  }, []);

  const submit = useCallback((id: string, memberId: string, text: string) => {
    setAssignments((prev) => {
      const next = prev.map((x) =>
        x.id === id
          ? { ...x, submissions: [...x.submissions.filter((s) => s.memberId !== memberId), { memberId, text, submittedAt: today() }] }
          : x,
      );
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setAssignments((prev) => {
      const next = prev.filter((x) => x.id !== id);
      write(next);
      return next;
    });
  }, []);

  return { assignments, ready, create, submit, remove };
}
