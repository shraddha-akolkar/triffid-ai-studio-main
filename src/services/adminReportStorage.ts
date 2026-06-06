import { loadFrontendProjects } from "@/services/frontendBuilderStorage";
import { loadDatabaseProjects } from "@/services/databaseStorage";
import type { TechStack } from "@/types/frontendBuilder";

const ACTIVITY_KEY = "triffid_activity_log";
const DEMO_SEEDED_KEY = "triffid_admin_demo_seeded";

const DUMMY_OWNERS = [
  "Emma Employee",
  "Morgan Manager",
  "Sam Smith",
  "Taylor Brown",
  "Chris Lee",
];

const DUMMY_STATUSES = ["active", "live", "deploying", "pending"] as const;

const DUMMY_TECH_STACKS: TechStack[] = ["react", "html-css", "angular"];

export type ActivityResourceType =
  | "frontend"
  | "database"
  | "deployment"
  | "auth"
  | "user";

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceType: ActivityResourceType;
  timestamp: string;
}

export type ProjectReportType = "frontend" | "database" | "deployment";

export interface ProjectReportEntry {
  id: string;
  name: string;
  type: ProjectReportType;
  status: string;
  owner: string;
  techStack?: TechStack;
  versionCount?: number;
  tableCount?: number;
  promptCount: number;
  createdAt: string;
  updatedAt: string;
}

function daysAgo(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function loadActivityLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActivityEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveActivityLog(entries: ActivityEntry[]): void {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries));
}

function buildDummyProjectEntry(
  id: string,
  name: string,
  type: ProjectReportType,
  index: number,
): ProjectReportEntry {
  const status = DUMMY_STATUSES[index % DUMMY_STATUSES.length];
  const owner = DUMMY_OWNERS[index % DUMMY_OWNERS.length];
  const createdDaysAgo = 30 - (index % 25);
  const updatedDaysAgo = index % 7;

  const base: ProjectReportEntry = {
    id,
    name,
    type,
    status,
    owner,
    promptCount: 2 + (index % 5),
    createdAt: daysAgo(createdDaysAgo),
    updatedAt: daysAgo(updatedDaysAgo, index % 12),
  };

  if (type === "frontend") {
    return {
      ...base,
      techStack: DUMMY_TECH_STACKS[index % DUMMY_TECH_STACKS.length],
      versionCount: 1 + (index % 4),
    };
  }

  if (type === "database") {
    return {
      ...base,
      tableCount: 2 + (index % 6),
    };
  }

  return base;
}

export function seedAdminDemoData(): void {
  if (localStorage.getItem(DEMO_SEEDED_KEY) === "true") return;

  if (loadActivityLog().length === 0) {
    saveActivityLog([
      { id: "a1", userId: "3", userName: "Emma Employee", action: "Created project", resource: "Marketing Landing Page", resourceType: "frontend", timestamp: daysAgo(5) },
      { id: "a2", userId: "3", userName: "Emma Employee", action: "Saved version", resource: "Marketing Landing Page", resourceType: "frontend", timestamp: daysAgo(2) },
      { id: "a3", userId: "2", userName: "Morgan Manager", action: "Deployed", resource: "E-Commerce Platform", resourceType: "deployment", timestamp: daysAgo(1) },
      { id: "a4", userId: "4", userName: "Sam Smith", action: "Created table", resource: "E-Commerce Schema", resourceType: "database", timestamp: daysAgo(3) },
      { id: "a5", userId: "3", userName: "Emma Employee", action: "AI prompt", resource: "Admin Dashboard UI", resourceType: "frontend", timestamp: daysAgo(8) },
      { id: "a6", userId: "2", userName: "Morgan Manager", action: "Started deployment", resource: "Analytics Dashboard", resourceType: "deployment", timestamp: daysAgo(0, 3) },
      { id: "a7", userId: "1", userName: "Alex Admin", action: "Logged in", resource: "Admin Portal", resourceType: "auth", timestamp: daysAgo(0, 1) },
      { id: "a8", userId: "6", userName: "Chris Lee", action: "Updated user", resource: "Jane Doe", resourceType: "user", timestamp: daysAgo(2) },
      { id: "a9", userId: "7", userName: "Taylor Brown", action: "Created project", resource: "Chat Application", resourceType: "deployment", timestamp: daysAgo(10) },
      { id: "a10", userId: "3", userName: "Emma Employee", action: "Edited schema", resource: "E-Commerce Schema", resourceType: "database", timestamp: daysAgo(1) },
      { id: "a11", userId: "4", userName: "Sam Smith", action: "Logged in", resource: "Employee Portal", resourceType: "auth", timestamp: daysAgo(0, 5) },
      { id: "a12", userId: "2", userName: "Morgan Manager", action: "Created project", resource: "Analytics Dashboard", resourceType: "deployment", timestamp: daysAgo(20) },
      { id: "a13", userId: "8", userName: "Riley Chen", action: "AI prompt", resource: "Marketing Landing Page", resourceType: "frontend", timestamp: daysAgo(1, 2) },
      { id: "a14", userId: "1", userName: "Alex Admin", action: "Viewed report", resource: "Activity Report", resourceType: "auth", timestamp: daysAgo(0) },
    ]);
  }

  localStorage.setItem(DEMO_SEEDED_KEY, "true");
}

export function getActivityReport(): ActivityEntry[] {
  seedAdminDemoData();
  return loadActivityLog().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getProjectsReport(): ProjectReportEntry[] {
  const frontend = loadFrontendProjects().map((p, i) =>
    buildDummyProjectEntry(p.id, p.name, "frontend", i),
  );

  const database = loadDatabaseProjects().map((p, i) =>
    buildDummyProjectEntry(p.id, p.name, "database", frontend.length + i),
  );

  return [...frontend, ...database].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getActivityByDay(entries: ActivityEntry[]): { day: string; count: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    counts.set(days[d.getDay()], 0);
  }

  entries.forEach((e) => {
    const d = new Date(e.timestamp);
    const key = days[d.getDay()];
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return order
    .filter((day) => counts.has(day))
    .map((day) => ({ day, count: counts.get(day) ?? 0 }));
}

export function getProjectsByType(entries: ProjectReportEntry[]): { type: string; count: number }[] {
  const labels: Record<ProjectReportType, string> = {
    frontend: "Frontend",
    database: "Database",
    deployment: "Deployment",
  };
  const counts: Record<ProjectReportType, number> = {
    frontend: 0,
    database: 0,
    deployment: 0,
  };
  entries.forEach((e) => {
    counts[e.type]++;
  });
  return (Object.keys(counts) as ProjectReportType[])
    .filter((type) => counts[type] > 0)
    .map((type) => ({
      type: labels[type],
      count: counts[type],
    }));
}

export function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
