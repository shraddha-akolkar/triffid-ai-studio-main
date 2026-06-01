import { useCallback, useEffect, useState } from "react";
import type { FrontendProject, TechStack } from "@/types/frontendBuilder";
import {
  getProjectVersions,
  loadFrontendProjects,
} from "@/services/frontendBuilderStorage";

export const TECH_STACK_LABELS: Record<TechStack, string> = {
  "html-css": "HTML / CSS",
  react: "React",
  angular: "Angular",
};

export function formatProjectDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function getFrontendProjectStats(projects: FrontendProject[]) {
  const versionCount = projects.reduce(
    (sum, p) => sum + getProjectVersions(p).length,
    0,
  );
  const lastUpdated = projects.reduce<string | null>((latest, p) => {
    const t = p.updatedAt || p.createdAt;
    if (!latest || t > latest) return t;
    return latest;
  }, null);
  return { versionCount, lastUpdated };
}

export function useFrontendProjects() {
  const [projects, setProjects] = useState<FrontendProject[]>([]);

  const refresh = useCallback(() => {
    setProjects(loadFrontendProjects());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { projects, refresh };
}
