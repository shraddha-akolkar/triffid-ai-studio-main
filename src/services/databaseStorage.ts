import type { DatabaseProject, DatabaseTable } from "@/types/database";

const STORAGE_KEY = "triffid_database_projects";
const LEGACY_KEY = "triffid_database_workspace";

export function createProjectId(): string {
  return `db_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createTableId(): string {
  return `tbl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function migrateLegacyWorkspace(): DatabaseProject[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as {
      tables?: DatabaseTable[];
      messages?: { role: "user" | "assistant"; content: string; at: string }[];
      activeTableId?: string | null;
    };
    if (!parsed.tables?.length) return [];

    const now = new Date().toISOString();
    const project: DatabaseProject = {
      id: createProjectId(),
      name: "Migrated Database",
      tables: parsed.tables,
      prompts: (parsed.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
        at: m.at,
      })),
      activeTableId: parsed.activeTableId ?? parsed.tables[0]?.id ?? null,
      createdAt: now,
      updatedAt: now,
    };
    localStorage.removeItem(LEGACY_KEY);
    return [project];
  } catch {
    return [];
  }
}

export function loadDatabaseProjects(): DatabaseProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const migrated = migrateLegacyWorkspace();
      if (migrated.length) {
        saveDatabaseProjects(migrated);
        return migrated;
      }
      return [];
    }
    const parsed = JSON.parse(raw) as DatabaseProject[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveDatabaseProjects(projects: DatabaseProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function upsertDatabaseProject(project: DatabaseProject): DatabaseProject[] {
  const projects = loadDatabaseProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
  saveDatabaseProjects(projects);
  return projects;
}

export function deleteDatabaseProject(id: string): DatabaseProject[] {
  const projects = loadDatabaseProjects().filter((p) => p.id !== id);
  saveDatabaseProjects(projects);
  return projects;
}

export function getDatabaseProject(id: string): DatabaseProject | undefined {
  return loadDatabaseProjects().find((p) => p.id === id);
}
