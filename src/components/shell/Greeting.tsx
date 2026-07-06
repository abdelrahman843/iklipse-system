"use client";

import { useAuth } from "@/lib/auth";

export function Greeting() {
  const { currentUser } = useAuth();
  const first = currentUser?.name?.split(" ")[0] ?? "there";
  return <>Good evening, {first}.</>;
}
