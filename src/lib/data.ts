/* =========================================================================
   MOCK DATA - stands in for the Supabase "system of record".
   SLA deadlines are stored as offsets (ms from page load) so live countdown
   timers resolve on the client and zones can be demonstrated live.
   ========================================================================= */

export type Tier = 1 | 2 | 3 | 4 | 5;
export type MemberStatus = "active" | "break" | "offline" | "meeting";

export type KpiBreakdown = {
  attendance: number;
  delivery: number;
  comms: number; // responsiveness
  quality: number; // comms quality
  education: number;
};

export type Seniority = "owner" | "management" | "senior" | "member";

export type Member = {
  id: string;
  name: string;
  role: string;
  seniority: Seniority;
  tier: Tier;
  status: MemberStatus;
  currentTask: string;
  kpi: number;
  breakdown: KpiBreakdown;
  bracketRemainingMs: number; // time left in current 11h bracket
  color: string;
};

export const seniorityMeta: Record<
  Seniority,
  { label: string; color: string; icon: "crown" | "star" | "chevron" | "dot" }
> = {
  owner: { label: "Owner / Partner", color: "#3f3f46", icon: "crown" },
  management: { label: "Top management", color: "#3f3f46", icon: "star" },
  senior: { label: "Senior", color: "#3f3f46", icon: "chevron" },
  member: { label: "Team", color: "#94a3b8", icon: "dot" },
};

const MIN = 60_000;
const HOUR = 60 * MIN;

export const members: Member[] = [
  {
    id: "ownr-nabil",
    name: "Nabil",
    role: "Founder & Partner",
    seniority: "owner",
    tier: 1,
    status: "active",
    currentTask: "Reviewing the week across all accounts",
    kpi: 99,
    breakdown: { attendance: 100, delivery: 99, comms: 100, quality: 99, education: 98 },
    bracketRemainingMs: 6.5 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "ownr-biker",
    name: "Biker",
    role: "Partner",
    seniority: "owner",
    tier: 1,
    status: "meeting",
    currentTask: "Partner sync",
    kpi: 97,
    breakdown: { attendance: 99, delivery: 97, comms: 98, quality: 97, education: 95 },
    bracketRemainingMs: 5.0 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "sameh",
    name: "Sameh",
    role: "Lead Coordinator",
    seniority: "management",
    tier: 2,
    status: "active",
    currentTask: "VFX QC, Orbit Telecom spot",
    kpi: 88,
    breakdown: { attendance: 90, delivery: 89, comms: 85, quality: 90, education: 82 },
    bracketRemainingMs: 3.1 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "sama",
    name: "Sama",
    role: "Account Director",
    seniority: "management",
    tier: 2,
    status: "active",
    currentTask: "Approving Nile Beverages cutdowns",
    kpi: 91,
    breakdown: { attendance: 94, delivery: 92, comms: 88, quality: 93, education: 86 },
    bracketRemainingMs: 7.5 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "karim",
    name: "Karim",
    role: "Art Director",
    seniority: "management",
    tier: 2,
    status: "active",
    currentTask: "Orbit Telecom, lower-thirds pack",
    kpi: 79,
    breakdown: { attendance: 82, delivery: 77, comms: 74, quality: 80, education: 81 },
    bracketRemainingMs: 8.3 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "biker",
    name: "Joe",
    role: "Head of AI Content",
    seniority: "senior",
    tier: 3,
    status: "meeting",
    currentTask: "Client sync, Aurora Films",
    kpi: 90,
    breakdown: { attendance: 96, delivery: 91, comms: 89, quality: 92, education: 84 },
    bracketRemainingMs: 4.8 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "mariam",
    name: "Mina",
    role: "Senior AI Specialist",
    seniority: "senior",
    tier: 3,
    status: "active",
    currentTask: "Aurora Films, title sequence v3",
    kpi: 82,
    breakdown: { attendance: 86, delivery: 80, comms: 78, quality: 84, education: 79 },
    bracketRemainingMs: 2.2 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "omar",
    name: "Omar VFX",
    role: "Motion Artist",
    seniority: "senior",
    tier: 3,
    status: "active",
    currentTask: "Nile Beverages, 6 social cutdowns",
    kpi: 74,
    breakdown: { attendance: 78, delivery: 70, comms: 66, quality: 76, education: 72 },
    bracketRemainingMs: 1.1 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "lina",
    name: "Shams",
    role: "Senior Coordinator",
    seniority: "senior",
    tier: 3,
    status: "offline",
    currentTask: "Idle",
    kpi: 61,
    breakdown: { attendance: 64, delivery: 58, comms: 55, quality: 66, education: 70 },
    bracketRemainingMs: 0.4 * HOUR,
    color: "#94a3b8",
  },
  {
    id: "abdo",
    name: "Abdo",
    role: "Lead Automations Specialist",
    seniority: "senior",
    tier: 3,
    status: "active",
    currentTask: "Calendar / AI integration maintenance check",
    kpi: 89,
    breakdown: { attendance: 95, delivery: 88, comms: 86, quality: 88, education: 88 },
    bracketRemainingMs: 5.9 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "fawzy",
    name: "Fawzy",
    role: "Head of Media Buying",
    seniority: "senior",
    tier: 3,
    status: "active",
    currentTask: "Schweppes, color pass",
    kpi: 77,
    breakdown: { attendance: 80, delivery: 76, comms: 72, quality: 78, education: 75 },
    bracketRemainingMs: 7.1 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "nabil",
    name: "Kotb",
    role: "Social Media Executive",
    seniority: "member",
    tier: 4,
    status: "active",
    currentTask: "Scheduling the weekly content calendar",
    kpi: 84,
    breakdown: { attendance: 88, delivery: 84, comms: 86, quality: 83, education: 80 },
    bracketRemainingMs: 6.2 * HOUR,
    color: "#3f3f46",
  },
  {
    id: "yusuf",
    name: "Yusuf",
    role: "Junior Coordinator",
    seniority: "member",
    tier: 4,
    status: "break",
    currentTask: "On break",
    kpi: 86,
    breakdown: { attendance: 88, delivery: 84, comms: 87, quality: 85, education: 95 },
    bracketRemainingMs: 5.4 * HOUR,
    color: "#3f3f46",
  },
];

export const currentUser = members[0];

export const kpiCategories = [
  { key: "attendance", label: "Attendance" },
  { key: "delivery", label: "Delivery" },
  { key: "comms", label: "Comms Resp." },
  { key: "quality", label: "Comms Quality" },
  { key: "education", label: "Education" },
] as const;

/* ---- SLA zones ---------------------------------------------------------- */
export type Zone = "green" | "orange" | "red" | "black";

export type ClientRecord = {
  id: string;
  name: string;
  tier: Tier;
  retainer: "A" | "B";
  manager: string;
  driveLink: string;
  activeProjects: number;
  openEscalations: number;
  health: number; // 0-100
  slaOffsetMs: number; // public deadline relative to load
};

export const clients: ClientRecord[] = [
  {
    id: "aurora",
    name: "Aurora Films",
    tier: 1,
    retainer: "A",
    manager: "Joe",
    driveLink: "https://drive.google.com/drive/folders/aurora",
    activeProjects: 4,
    openEscalations: 1,
    health: 72,
    slaOffsetMs: 38 * MIN,
  },
  {
    id: "nile",
    name: "Nile Beverages",
    tier: 1,
    retainer: "A",
    manager: "Sama",
    driveLink: "https://drive.google.com/drive/folders/nile",
    activeProjects: 6,
    openEscalations: 2,
    health: 54,
    slaOffsetMs: -12 * MIN, // already in red zone
  },
  {
    id: "orbit",
    name: "Orbit Telecom",
    tier: 2,
    retainer: "B",
    manager: "Sameh",
    driveLink: "https://drive.google.com/drive/folders/orbit",
    activeProjects: 3,
    openEscalations: 0,
    health: 88,
    slaOffsetMs: 5.5 * HOUR,
  },
  {
    id: "verde",
    name: "Verde Cosmetics",
    tier: 2,
    retainer: "A",
    manager: "Sama",
    driveLink: "https://drive.google.com/drive/folders/verde",
    activeProjects: 2,
    openEscalations: 0,
    health: 91,
    slaOffsetMs: 26 * HOUR,
  },
  {
    id: "helios",
    name: "Helios Real Estate",
    tier: 3,
    retainer: "B",
    manager: "Yusuf",
    driveLink: "https://drive.google.com/drive/folders/helios",
    activeProjects: 1,
    openEscalations: 3,
    health: 38,
    slaOffsetMs: -90 * MIN, // black zone
  },
  {
    id: "cairo-eats",
    name: "Cairo Eats",
    tier: 3,
    retainer: "B",
    manager: "Sameh",
    driveLink: "https://drive.google.com/drive/folders/cairo-eats",
    activeProjects: 2,
    openEscalations: 0,
    health: 80,
    slaOffsetMs: 52 * HOUR,
  },
];

/* ---- Tasks -------------------------------------------------------------- */
export type Priority = "critical" | "high" | "medium" | "low";
export type TaskColumn = "backlog" | "in_progress" | "review" | "done";

export type Task = {
  id: string;
  title: string;
  assigneeId: string;
  client: string;
  priority: Priority;
  column: TaskColumn;
  slaOffsetMs: number;
  deps: number;
  driveRef: boolean;
};

export const tasks: Task[] = [
  { id: "T-128", title: "Aurora - title sequence v3", assigneeId: "mariam", client: "Aurora Films", priority: "critical", column: "in_progress", slaOffsetMs: 38 * MIN, deps: 2, driveRef: true },
  { id: "T-131", title: "Nile - 6 social cutdowns", assigneeId: "omar", client: "Nile Beverages", priority: "critical", column: "in_progress", slaOffsetMs: -12 * MIN, deps: 0, driveRef: true },
  { id: "T-140", title: "Orbit - lower-thirds pack", assigneeId: "karim", client: "Orbit Telecom", priority: "high", column: "in_progress", slaOffsetMs: 5.5 * HOUR, deps: 1, driveRef: true },
  { id: "T-141", title: "Helios - listing reel", assigneeId: "lina", client: "Helios Real Estate", priority: "high", column: "review", slaOffsetMs: -90 * MIN, deps: 0, driveRef: true },
  { id: "T-145", title: "Verde - product teaser storyboard", assigneeId: "mariam", client: "Verde Cosmetics", priority: "medium", column: "backlog", slaOffsetMs: 26 * HOUR, deps: 3, driveRef: false },
  { id: "T-147", title: "Nile - master color pass", assigneeId: "sameh", client: "Nile Beverages", priority: "high", column: "review", slaOffsetMs: 2.4 * HOUR, deps: 1, driveRef: true },
  { id: "T-150", title: "Cairo Eats - menu animation", assigneeId: "karim", client: "Cairo Eats", priority: "low", column: "backlog", slaOffsetMs: 52 * HOUR, deps: 0, driveRef: false },
  { id: "T-151", title: "Orbit - brand bumper", assigneeId: "sameh", client: "Orbit Telecom", priority: "medium", column: "done", slaOffsetMs: 9 * HOUR, deps: 0, driveRef: true },
  { id: "T-152", title: "Aurora - sound design handoff", assigneeId: "omar", client: "Aurora Films", priority: "medium", column: "backlog", slaOffsetMs: 30 * HOUR, deps: 2, driveRef: true },
  { id: "T-153", title: "Verde - final delivery export", assigneeId: "mariam", client: "Verde Cosmetics", priority: "low", column: "done", slaOffsetMs: 70 * HOUR, deps: 0, driveRef: true },
];

export const taskColumns: { key: TaskColumn; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

/* ---- Sales / leads ------------------------------------------------------ */
export type LeadStage = "new" | "contacted" | "proposal" | "won" | "lost";
export type Lead = {
  id: string;
  name: string;
  company: string;
  source: string;
  value: number;
  stage: LeadStage;
  nextAction: string;
  owner: string;
  newsletter: boolean;
};

export const leads: Lead[] = [
  { id: "L-01", name: "Hana Wassef", company: "Lumen Studios", source: "Referral", value: 48000, stage: "proposal", nextAction: "Send SOW", owner: "Joe", newsletter: true },
  { id: "L-02", name: "Tarek Nour", company: "Pulse Fitness", source: "Instagram", value: 22000, stage: "contacted", nextAction: "Discovery call", owner: "Sama", newsletter: false },
  { id: "L-03", name: "Dina Magdy", company: "Cleo Skincare", source: "Inbound", value: 65000, stage: "won", nextAction: "Kickoff", owner: "Joe", newsletter: true },
  { id: "L-04", name: "Sherif Ali", company: "Delta Logistics", source: "Cold email", value: 31000, stage: "new", nextAction: "Qualify", owner: "Yusuf", newsletter: false },
  { id: "L-05", name: "Nada Kamal", company: "Sol Energy", source: "Event", value: 88000, stage: "proposal", nextAction: "Follow up", owner: "Joe", newsletter: true },
  { id: "L-06", name: "Adam Reda", company: "Mint Mobile MEA", source: "Referral", value: 120000, stage: "contacted", nextAction: "Send deck", owner: "Sama", newsletter: false },
  { id: "L-07", name: "Yara Sami", company: "Bloom Florists", source: "Inbound", value: 14000, stage: "won", nextAction: "Onboard", owner: "Yusuf", newsletter: true },
  { id: "L-08", name: "Khaled Adel", company: "Atlas Bank", source: "Event", value: 210000, stage: "lost", nextAction: "Nurture", owner: "Joe", newsletter: false },
];

export const leadStages: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "proposal", label: "Proposal" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

/* ---- Salary ------------------------------------------------------------- */
export type ReceiptStatus = "confirmed" | "pending" | "denied";
export type SalaryRow = {
  id: string;
  memberId: string;
  base: number;
  kpiAdj: number;
  payout: number;
  receipt: ReceiptStatus;
};

export const salary: SalaryRow[] = [
  { id: "S-1", memberId: "sama", base: 2800, kpiAdj: 220, payout: 3020, receipt: "confirmed" },
  { id: "S-2", memberId: "sameh", base: 2800, kpiAdj: 130, payout: 2930, receipt: "confirmed" },
  { id: "S-3", memberId: "yusuf", base: 2600, kpiAdj: 90, payout: 2690, receipt: "pending" },
  { id: "S-4", memberId: "mariam", base: 2200, kpiAdj: 60, payout: 2260, receipt: "confirmed" },
  { id: "S-5", memberId: "omar", base: 1600, kpiAdj: -80, payout: 1520, receipt: "denied" },
  { id: "S-6", memberId: "karim", base: 1700, kpiAdj: 40, payout: 1740, receipt: "pending" },
  { id: "S-7", memberId: "lina", base: 1100, kpiAdj: -140, payout: 960, receipt: "pending" },
];

/* ---- Academy ------------------------------------------------------------ */
export type Lesson = {
  id: string;
  title: string;
  desc: string;
  source: "drive" | "loom" | "youtube";
  duration: string;
  track: string;
  progress: number; // 0-100
  hasQuiz: boolean;
  dueThisWeek: boolean;
};

export const lessons: Lesson[] = [
  { id: "A-01", title: "Iklipse Color Pipeline - DaVinci to Delivery", desc: "The full color workflow from raw footage to final export, the iklipse way.", source: "drive", duration: "32 min", track: "Craft", progress: 100, hasQuiz: true, dueThisWeek: false },
  { id: "A-02", title: "Client Comms: The 15-Minute Response Rule", desc: "Why first-response speed wins retainers, and how to hit the 15-minute SLA.", source: "loom", duration: "12 min", track: "Comms", progress: 60, hasQuiz: true, dueThisWeek: true },
  { id: "A-03", title: "Motion Principles - Easing & Timing", desc: "Easing, timing and weight - the fundamentals that make motion feel alive.", source: "youtube", duration: "24 min", track: "Craft", progress: 0, hasQuiz: true, dueThisWeek: true },
  { id: "A-04", title: "SLA & Buffer Logic Explained", desc: "The two-layer buffer system and how SLA zones drive escalation.", source: "drive", duration: "18 min", track: "Ops", progress: 100, hasQuiz: true, dueThisWeek: false },
  { id: "A-05", title: "Sound Design Fundamentals", desc: "Layering, mixing and the small details that elevate every edit.", source: "youtube", duration: "41 min", track: "Craft", progress: 35, hasQuiz: false, dueThisWeek: true },
  { id: "A-06", title: "Escalation Etiquette & Tone", desc: "How to escalate firmly without burning the relationship.", source: "loom", duration: "9 min", track: "Comms", progress: 0, hasQuiz: true, dueThisWeek: false },
];

/* ---- SOP Library -------------------------------------------------------- */
export type Sop = {
  id: string;
  title: string;
  category: string;
  tier: string;
  summary: string;
  gated: boolean;
};

/* The real iklipse SOP set (Tier 1 - Employee-Facing). Numbers 04 and 12 are
   intentionally absent (no source document exists). */
export const sops: Sop[] = [
  { id: "SOP-01", title: "Client Work Pipeline & Workflow", category: "Delivery", tier: "Employee", gated: true, summary: "Every client project runs on a mandatory dual-layer buffer - the client sees one date, the team works to an earlier one." },
  { id: "SOP-02", title: "Iklipse Social Media", category: "Marketing", tier: "Employee", gated: false, summary: "Content strategy & volume - Iklipse's own output is structurally reduced ~30-35% to protect quality and consistency." },
  { id: "SOP-03", title: "Vendor & Collaborator Management", category: "Operations", tier: "Employee", gated: true, summary: "How to source, vet, brief, pay and manage external vendors and collaborators without losing control of quality or cost." },
  { id: "SOP-05", title: "Filing, Source Files & Delivery Protocol", category: "Delivery", tier: "Employee", gated: true, summary: "Folder structure & naming - every project lives in a structured tree so anyone can find anything in seconds." },
  { id: "SOP-06", title: "Client Onboarding & Off-boarding", category: "Clients", tier: "Employee", gated: true, summary: "Client tiers determine level of care, response SLA, and whether onboarding offers a call. The full intake-to-exit flow." },
  { id: "SOP-07", title: "Holiday & Time-Off Requests", category: "People & HR", tier: "Employee", gated: false, summary: "Months 1-3 probationary reset (strict), then the standard request, approval and coverage rules for time off." },
  { id: "SOP-08", title: "KPI & Performance Scoring", category: "People & HR", tier: "Employee", gated: true, summary: "A 100-point monthly scorecard across five weighted categories - the core mechanic behind salary adjustments." },
  { id: "SOP-09", title: "Quality Control - The QC Gate", category: "Delivery", tier: "Employee", gated: true, summary: "A medium-agnostic QC gate applied to all work without exception: static, video, AI-generated and more." },
  { id: "SOP-10", title: "Team Communication, Daily Updates & Meetings", category: "Comms", tier: "Employee", gated: false, summary: "The daily individual update synthesized from every data source, plus meeting cadence and etiquette." },
  { id: "SOP-11", title: "Time Adherence, Calendars & Meeting Respect", category: "Operations", tier: "Employee", gated: false, summary: "Shared calendars, central AI integration upkeep, and the rules that keep everyone's time mutually respected." },
  { id: "SOP-13", title: "Working Hours, Attendance & Overtime", category: "People & HR", tier: "Employee", gated: false, summary: "The fixed 11-hour daily bracket for all team members, attendance expectations and overtime handling." },
  { id: "SOP-14", title: "Education & Training Hub", category: "People & HR", tier: "Employee", gated: false, summary: "The weekly continuous-improvement requirement - the company now hand-holds learning rather than only demanding it." },
  { id: "SOP-15", title: "Newsletter & Email Automation", category: "Marketing", tier: "Employee", gated: true, summary: "A separate, non-negotiable compartment that must run continuously - never paused - across newsletter & email automation." },
  { id: "SOP-16", title: "Finance, Invoicing & Data Security", category: "Finance", tier: "Employee", gated: true, summary: "Every invoice must be fully traceable through the centralized system, plus the baseline data-security rules." },
  { id: "SOP-17", title: "Fiverr Operations", category: "Sales", tier: "Employee", gated: true, summary: "Recurring optimization cadence - gigs must never go un-optimized for more than 30 days." },
  { id: "SOP-18", title: "Disciplinary, Warnings & Exit Protocol", category: "People & HR", tier: "Employee", gated: true, summary: "Coaching calls and structured corrective conversations through to the formal warning ladder and exit." },
  { id: "SOP-19", title: "Crisis & Timeline-Reset Protocol", category: "Operations", tier: "Employee", gated: true, summary: "The one-time aggressive timeline reset to relieve stress and let the team clear backlog and deliver with quality." },
];

/* ---- Calendar ----------------------------------------------------------- */
export type CalEvent = {
  id: string;
  title: string;
  time: string;
  type: "deadline" | "meeting" | "training" | "delivery";
  client?: string;
};

export const calendar: CalEvent[] = [
  { id: "C-1", title: "Aurora title sequence - public deadline", time: "Today · 14:30", type: "deadline", client: "Aurora Films" },
  { id: "C-2", title: "Nile Beverages - client sync", time: "Today · 16:00", type: "meeting", client: "Nile Beverages" },
  { id: "C-3", title: "Weekly Training drop", time: "Tomorrow · 10:00", type: "training" },
  { id: "C-4", title: "Orbit brand bumper - delivery", time: "Tomorrow · 18:00", type: "delivery", client: "Orbit Telecom" },
  { id: "C-5", title: "Verde teaser - review", time: "Thu · 12:00", type: "meeting", client: "Verde Cosmetics" },
];

/* ---- Notifications ------------------------------------------------------ */
export type Notification = {
  id: string;
  kind: "sla" | "mention" | "approval" | "receipt";
  text: string;
  time: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  { id: "N-1", kind: "sla", text: "Helios listing reel entered the BLACK zone - client deadline breached.", time: "2m", unread: true },
  { id: "N-2", kind: "sla", text: "Nile cutdowns in RED zone. Escalation ladder triggered.", time: "11m", unread: true },
  { id: "N-3", kind: "approval", text: "Sama requested approval on Nile master color pass.", time: "24m", unread: true },
  { id: "N-4", kind: "receipt", text: "Omar VFX denied salary receipt - flagged for human review.", time: "1h", unread: false },
  { id: "N-5", kind: "mention", text: "Joe mentioned you on Aurora title sequence v3.", time: "2h", unread: false },
];

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/godmode", label: "Panoptic Godmode", icon: "Eye", restricted: true },
  { href: "/tasks", label: "Tasks & Delivery", icon: "ListChecks" },
  { href: "/boards", label: "Boards", icon: "SquareKanban" },
  { href: "/clients", label: "Client CRM", icon: "Building2" },
  { href: "/sales", label: "Sales & Leads", icon: "TrendingUp" },
  { href: "/academy", label: "Iklipse Academy", icon: "GraduationCap" },
  { href: "/sop", label: "SOP Library", icon: "BookOpen" },
  { href: "/salary", label: "Salary & HR", icon: "Wallet" },
  { href: "/calendar", label: "Calendar", icon: "Calendar" },
  { href: "/settings", label: "Settings & Integrations", icon: "Settings" },
] as const;
