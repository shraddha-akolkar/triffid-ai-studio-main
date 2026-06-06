import { useState } from "react";
import { Layers, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import type { FrontendProject } from "@/types/frontendBuilder";
import {
  getProjectVersions,
  upsertFrontendProject,
} from "@/services/frontendBuilderStorage";
import {
  formatProjectDate,
  TECH_STACK_LABELS,
  useFrontendProjects,
} from "@/hooks/useFrontendProjects";

function createProjectId(): string {
  return `fp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function ManagerProjects() {
  const { projects, refresh } = useFrontendProjects();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({
        title: "Project name required",
        description: "Enter a name for the project.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const project: FrontendProject = {
      id: createProjectId(),
      name: trimmed,
      techStack: "html-css",
      html: "",
      prompts: [],
      createdAt: now,
      updatedAt: now,
    };

    upsertFrontendProject(project);
    refresh();
    setShowForm(false);
    setName("");
    toast({
      title: "Project created",
      description: `"${trimmed}" has been saved locally.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Create Project</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="bg-secondary border-border"
            />
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No projects in local storage yet. Create one above or in the Frontend Builder.
          </p>
          <Button variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
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
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {versionCount} version{versionCount === 1 ? "" : "s"}
                  </span>
                  <span>Updated {formatProjectDate(p.updatedAt || p.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
