import { Link } from "react-router-dom";
import { Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjectVersions } from "@/services/frontendBuilderStorage";
import {
  formatProjectDate,
  TECH_STACK_LABELS,
  useFrontendProjects,
} from "@/hooks/useFrontendProjects";

export default function EmployeeProjects() {
  const { projects } = useFrontendProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/employee/frontend-builder">
            <Code className="h-4 w-4 mr-2" />
            Open Frontend Builder
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No projects in local storage yet. Create one in the Frontend Builder.
          </p>
          <Button asChild variant="outline">
            <Link to="/employee/frontend-builder">Go to Frontend Builder</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const versionCount = getProjectVersions(p).length;
            return (
              <div
                key={p.id}
                className="rounded-lg border border-border bg-card p-5 animate-fade-in hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {TECH_STACK_LABELS[p.techStack]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {versionCount} version{versionCount === 1 ? "" : "s"}
                  </span>
                  <span>Updated {formatProjectDate(p.updatedAt || p.createdAt)}</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/employee/frontend-builder">Open in builder</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
