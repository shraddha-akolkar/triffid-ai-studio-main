import type { FrontendProject, FrontendSnapshot } from "@/types/frontendBuilder";

const STORAGE_KEY = "triffid_frontend_projects";

function migrateProject(project: FrontendProject): FrontendProject {
  if (project.versions?.length) return project;
  const snapshot: FrontendSnapshot = {
    html: project.html,
    label: "Initial version",
    at: project.updatedAt || project.createdAt,
  };
  return { ...project, versions: [snapshot] };
}

export function loadFrontendProjects(): FrontendProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FrontendProject[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateProject);
  } catch {
    return [];
  }
}

export function getProjectVersions(project: FrontendProject): FrontendSnapshot[] {
  if (project.versions?.length) return project.versions;
  return [
    {
      html: project.html,
      label: "Initial version",
      at: project.updatedAt || project.createdAt,
    },
  ];
}

export function saveFrontendProjects(projects: FrontendProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function upsertFrontendProject(project: FrontendProject): FrontendProject[] {
  const projects = loadFrontendProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
  saveFrontendProjects(projects);
  return projects;
}

export function deleteFrontendProject(id: string): FrontendProject[] {
  const projects = loadFrontendProjects().filter((p) => p.id !== id);
  saveFrontendProjects(projects);
  return projects;
}

export function getFrontendProject(id: string): FrontendProject | undefined {
  return loadFrontendProjects().find((p) => p.id === id);
}
