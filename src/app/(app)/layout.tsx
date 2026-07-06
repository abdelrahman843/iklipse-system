import { AppShell } from "@/components/shell/AppShell";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
