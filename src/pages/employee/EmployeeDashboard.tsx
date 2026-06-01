import { Link } from "react-router-dom";
import { FolderKanban, Layers, Clock, Code } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { getProjectVersions } from "@/services/frontendBuilderStorage";
import {
  formatProjectDate,
  getFrontendProjectStats,
  TECH_STACK_LABELS,
  useFrontendProjects,
} from "@/hooks/useFrontendProjects";

export default function EmployeeDashboard() {
  const { projects } = useFrontendProjects();
  const { versionCount, lastUpdated } = getFrontendProjectStats(projects);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Saved Projects"
          value={projects.length}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <StatCard
          title="Saved Versions"
          value={versionCount}
          icon={<Layers className="h-5 w-5" />}
        />
        <StatCard
          title="Last Updated"
          value={lastUpdated ? formatProjectDate(lastUpdated) : "—"}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <h2 className="font-semibold">My Projects</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/employee/frontend-builder">
              <Code className="h-3.5 w-3.5 mr-2" />
              Frontend Builder
            </Link>
          </Button>
        </div>
        {projects.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="mb-4">Projects you create in the Frontend Builder appear here.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/employee/frontend-builder">Create a project</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {projects.map((p) => {
              const versions = getProjectVersions(p).length;
              return (
                <div
                  key={p.id}
                  className="p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{p.name}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {TECH_STACK_LABELS[p.techStack]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {versions} version{versions === 1 ? "" : "s"} · Updated{" "}
                    {formatProjectDate(p.updatedAt || p.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
