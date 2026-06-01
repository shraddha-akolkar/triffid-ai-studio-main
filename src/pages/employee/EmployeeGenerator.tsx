import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  Plus,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import type { FrontendProject, FrontendSnapshot, TechStack } from "@/types/frontendBuilder";
import {
  deleteFrontendProject,
  getProjectVersions,
  loadFrontendProjects,
  upsertFrontendProject,
} from "@/services/frontendBuilderStorage";
import {
  generateFrontendHtml,
  updateFrontendHtml,
} from "@/services/openaiFrontend";
import { BrowserPreview } from "@/components/frontend-builder/BrowserPreview";
import { cn } from "@/lib/utils";

const TECH_OPTIONS: {
  value: TechStack;
  label: string;
  description: string;
  disabled?: boolean;
}[] = [
  {
    value: "html-css",
    label: "HTML / CSS",
    description: "Static site in a single HTML file",
  },
  {
    value: "react",
    label: "React",
    description: "Coming soon",
    disabled: true,
  },
  {
    value: "angular",
    label: "Angular",
    description: "Coming soon",
    disabled: true,
  },
];

function createProjectId(): string {
  return `fp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function snapshotLabel(prompt: string): string {
  const text = prompt.trim();
  return text.length > 56 ? `${text.slice(0, 56)}…` : text;
}

function withNewVersion(
  project: FrontendProject,
  html: string,
  label: string,
): FrontendProject {
  const now = new Date().toISOString();
  const snapshot: FrontendSnapshot = { html, label, at: now };
  const versions = [...getProjectVersions(project), snapshot];
  return {
    ...project,
    html,
    versions,
    updatedAt: now,
  };
}

export default function EmployeeGenerator() {
  const [projects, setProjects] = useState<FrontendProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [techStack, setTechStack] = useState<TechStack>("html-css");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"create" | "workspace">("create");
  const [previewTab, setPreviewTab] = useState<"preview" | "code">("preview");
  const [historyIndex, setHistoryIndex] = useState(0);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeId),
    [projects, activeId],
  );

  const versions = useMemo(
    () => (activeProject ? getProjectVersions(activeProject) : []),
    [activeProject],
  );

  const previewHtml = useMemo(() => {
    if (!activeProject) return null;
    if (versions.length > 0) {
      const idx = Math.min(Math.max(historyIndex, 0), versions.length - 1);
      return versions[idx]?.html ?? activeProject.html;
    }
    return activeProject.html || null;
  }, [activeProject, versions, historyIndex]);

  const currentSnapshot = versions[historyIndex];

  const refreshProjects = useCallback(() => {
    setProjects(loadFrontendProjects());
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    if (activeProject) {
      const v = getProjectVersions(activeProject);
      setHistoryIndex(Math.max(0, v.length - 1));
    } else {
      setHistoryIndex(0);
    }
  }, [activeId]);

  const openProject = (project: FrontendProject) => {
    setActiveId(project.id);
    setProjectName(project.name);
    setTechStack(project.techStack);
    setPrompt("");
    setView("workspace");
    setPreviewTab("preview");
    const v = getProjectVersions(project);
    setHistoryIndex(Math.max(0, v.length - 1));
  };

  const startNewProject = () => {
    setActiveId(null);
    setProjectName("");
    setTechStack("html-css");
    setPrompt("");
    setView("create");
    setHistoryIndex(0);
    setPreviewTab("preview");
  };

  const persistProject = (project: FrontendProject, goToLatest = true) => {
    const updated = upsertFrontendProject(project);
    setProjects(updated);
    setActiveId(project.id);
    setView("workspace");
    setPreviewTab("preview");
    if (goToLatest) {
      const v = getProjectVersions(project);
      setHistoryIndex(Math.max(0, v.length - 1));
    }
  };

  const handleCreate = async () => {
    const name = projectName.trim();
    if (!name) {
      toast({
        title: "Project name required",
        description: "Enter a name for your website project.",
        variant: "destructive",
      });
      return;
    }
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Describe the website you want to build.",
        variant: "destructive",
      });
      return;
    }
    if (techStack !== "html-css") {
      toast({
        title: "Tech stack unavailable",
        description: "Only HTML / CSS is enabled right now.",
        variant: "destructive",
      });
      return;
    }

    setPreviewTab("preview");
    setLoading(true);
    try {
      const html = await generateFrontendHtml(techStack, prompt.trim());
      const now = new Date().toISOString();
      const label = snapshotLabel(prompt);
      const project: FrontendProject = {
        id: createProjectId(),
        name,
        techStack,
        html,
        versions: [{ html, label, at: now }],
        prompts: [
          { role: "user", content: prompt.trim(), at: now },
          { role: "assistant", content: "Generated initial website HTML.", at: now },
        ],
        createdAt: now,
        updatedAt: now,
      };
      persistProject(project);
      setPrompt("");
      toast({
        title: "Website created",
        description: `"${name}" is saved locally. Use ← → to browse versions.`,
      });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!activeProject) return;
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Describe the changes you want to make.",
        variant: "destructive",
      });
      return;
    }

    setPreviewTab("preview");
    setLoading(true);
    try {
      const html = await updateFrontendHtml(
        activeProject.techStack,
        activeProject.html,
        prompt.trim(),
      );
      const now = new Date().toISOString();
      const label = snapshotLabel(prompt);
      let updated = withNewVersion(activeProject, html, label);
      updated = {
        ...updated,
        prompts: [
          ...activeProject.prompts,
          { role: "user", content: prompt.trim(), at: now },
          {
            role: "assistant",
            content: "Applied changes to the website HTML.",
            at: now,
          },
        ],
      };
      persistProject(updated);
      setPrompt("");
      toast({
        title: "Changes applied",
        description: "New version saved. Navigate with browser back / forward.",
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    const next = deleteFrontendProject(id);
    setProjects(next);
    if (activeId === id) {
      startNewProject();
    }
    toast({ title: "Project deleted", description: "Removed from local storage." });
  };

  const copyCode = () => {
    if (!previewHtml) return;
    navigator.clipboard.writeText(previewHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWorkspace = view === "workspace" && activeProject;
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < versions.length - 1;

  const loadingMessage = isWorkspace
    ? "Applying your changes"
    : "Building your website";

  return (
    <div className="flex flex-col gap-5 pb-6 min-h-[calc(100vh-5rem)]">
      <header className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Frontend Builder</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Describe your site, watch it come to life, then refine with prompts.
          Browse versions with the preview back and forward controls.
        </p>
      </header>

      <div className="flex flex-1 flex-col xl:flex-row gap-5 min-h-0">
        <aside className="xl:w-56 shrink-0 rounded-xl border border-border bg-card p-4 space-y-3 h-fit xl:sticky xl:top-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              Projects
            </h2>
            <Button variant="outline" size="sm" onClick={startNewProject} className="h-8">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              No projects yet. Fill in the form and generate below.
            </p>
          ) : (
            <ul className="space-y-0.5 max-h-[200px] xl:max-h-[calc(100vh-12rem)] overflow-y-auto">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => openProject(project)}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-between gap-2 group",
                      activeId === project.id
                        ? "bg-primary/15 text-foreground ring-1 ring-primary/30"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className="truncate font-medium">{project.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      aria-label={`Delete ${project.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="flex flex-1 flex-col gap-4 min-w-0 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-4 shrink-0">
            <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
              {!isWorkspace && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project name</Label>
                    <Input
                      id="project-name"
                      placeholder="e.g. Portfolio Site"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-secondary border-border"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tech stack</Label>
                    <RadioGroup
                      value={techStack}
                      onValueChange={(v) => setTechStack(v as TechStack)}
                      className="grid gap-2"
                    >
                      {TECH_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border border-border px-3 py-2",
                            opt.disabled && "opacity-50",
                            techStack === opt.value &&
                              !opt.disabled &&
                              "border-primary/40 bg-primary/5",
                          )}
                        >
                          <RadioGroupItem
                            value={opt.value}
                            id={`stack-${opt.value}`}
                            disabled={opt.disabled}
                          />
                          <label
                            htmlFor={`stack-${opt.value}`}
                            className={cn(
                              "text-sm flex-1 cursor-pointer",
                              opt.disabled && "cursor-not-allowed",
                            )}
                          >
                            {opt.label}
                            {opt.disabled && (
                              <span className="ml-2 text-[10px] uppercase text-muted-foreground">
                                Soon
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </>
              )}

              {isWorkspace && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Editing </span>
                  <span className="font-semibold">{activeProject.name}</span>
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="prompt">
                  {isWorkspace ? "Refine with prompt" : "Describe your website"}
                </Label>
                <Textarea
                  id="prompt"
                  placeholder={
                    isWorkspace
                      ? "e.g. Dark hero, add pricing table…"
                      : "e.g. Modern coffee shop landing page with menu and contact…"
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-secondary border-border min-h-[100px] resize-none text-sm"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={isWorkspace ? handleRefine : handleCreate}
                disabled={
                  loading ||
                  (!isWorkspace && (!projectName.trim() || !prompt.trim())) ||
                  (isWorkspace && !prompt.trim())
                }
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isWorkspace ? "Applying…" : "Generating…"}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isWorkspace ? "Apply changes" : "Generate website"}
                  </>
                )}
              </Button>

              {isWorkspace && activeProject.prompts.length > 0 && (
                <div className="pt-2 border-t border-border space-y-1.5 max-h-[100px] overflow-y-auto">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                    Recent prompts
                  </p>
                  {activeProject.prompts
                    .filter((p) => p.role === "user")
                    .slice(-3)
                    .reverse()
                    .map((entry, i) => (
                      <p
                        key={`${entry.at}-${i}`}
                        className="text-xs text-muted-foreground line-clamp-2 border-l-2 border-primary/40 pl-2"
                      >
                        {entry.content}
                      </p>
                    ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block rounded-xl border border-dashed border-border/80 bg-muted/10 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Preview tips</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Use ← → to move between saved versions</li>
                <li>Refresh reloads the current snapshot</li>
                <li>Each prompt creates a new version in history</li>
              </ul>
            </div>
          </div>

          <BrowserPreview
            className="flex-1"
            html={previewHtml}
            projectName={activeProject?.name ?? projectName}
            loading={loading}
            loadingMessage={loadingMessage}
            canGoBack={canGoBack && !loading}
            canGoForward={canGoForward && !loading}
            onBack={() => setHistoryIndex((i) => Math.max(0, i - 1))}
            onForward={() =>
              setHistoryIndex((i) => Math.min(versions.length - 1, i + 1))
            }
            versionIndex={historyIndex}
            versionCount={versions.length}
            versionLabel={
              currentSnapshot
                ? `Version ${historyIndex + 1}: ${currentSnapshot.label}`
                : undefined
            }
            previewTab={previewTab}
            onPreviewTabChange={setPreviewTab}
            onCopy={copyCode}
            copied={copied}
            emptyMessage={
              loading
                ? "Sit tight — your preview will appear when generation finishes."
                : "Generate a website to open the live preview in this browser frame."
            }
          />
        </div>
      </div>
    </div>
  );
}
