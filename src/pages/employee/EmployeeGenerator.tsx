import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Code,
  Eye,
  FolderOpen,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import type { FrontendProject, TechStack } from "@/types/frontendBuilder";
import {
  deleteFrontendProject,
  loadFrontendProjects,
  upsertFrontendProject,
} from "@/services/frontendBuilderStorage";
import {
  generateFrontendHtml,
  updateFrontendHtml,
} from "@/services/openaiFrontend";
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

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeId),
    [projects, activeId],
  );

  const refreshProjects = useCallback(() => {
    setProjects(loadFrontendProjects());
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const openProject = (project: FrontendProject) => {
    setActiveId(project.id);
    setProjectName(project.name);
    setTechStack(project.techStack);
    setPrompt("");
    setView("workspace");
  };

  const startNewProject = () => {
    setActiveId(null);
    setProjectName("");
    setTechStack("html-css");
    setPrompt("");
    setView("create");
  };

  const persistProject = (project: FrontendProject) => {
    const updated = upsertFrontendProject(project);
    setProjects(updated);
    setActiveId(project.id);
    setView("workspace");
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

    setLoading(true);
    try {
      const html = await generateFrontendHtml(techStack, prompt.trim());
      const now = new Date().toISOString();
      const project: FrontendProject = {
        id: createProjectId(),
        name,
        techStack,
        html,
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
        description: `"${name}" is saved locally. Preview it on the right.`,
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

    setLoading(true);
    try {
      const html = await updateFrontendHtml(
        activeProject.techStack,
        activeProject.html,
        prompt.trim(),
      );
      const now = new Date().toISOString();
      const updated: FrontendProject = {
        ...activeProject,
        html,
        prompts: [
          ...activeProject.prompts,
          { role: "user", content: prompt.trim(), at: now },
          {
            role: "assistant",
            content: "Applied changes to the website HTML.",
            at: now,
          },
        ],
        updatedAt: now,
      };
      persistProject(updated);
      setPrompt("");
      toast({
        title: "Changes applied",
        description: "Preview updated with your latest prompt.",
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
    if (!activeProject?.html) return;
    navigator.clipboard.writeText(activeProject.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWorkspace = view === "workspace" && activeProject;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Frontend Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create websites with AI, preview them instantly, and refine with prompts.
          Projects are saved in your browser until the backend is ready.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-border bg-card p-4 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Your projects
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={startNewProject}
              className="h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
          </div>
          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No projects yet. Create your first website below.
            </p>
          ) : (
            <ul className="space-y-1 max-h-[320px] overflow-y-auto">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => openProject(project)}
                    className={cn(
                      "w-full text-left rounded-md px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2 group",
                      activeId === project.id
                        ? "bg-primary/15 text-foreground"
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
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

                <div className="space-y-3">
                  <Label>Tech stack</Label>
                  <RadioGroup
                    value={techStack}
                    onValueChange={(v) => setTechStack(v as TechStack)}
                    className="space-y-2"
                  >
                    {TECH_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border border-border p-3",
                          opt.disabled && "opacity-60",
                          techStack === opt.value && !opt.disabled && "border-primary/50 bg-primary/5",
                        )}
                      >
                        <RadioGroupItem
                          value={opt.value}
                          id={`stack-${opt.value}`}
                          disabled={opt.disabled}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={`stack-${opt.value}`}
                          className={cn(
                            "flex-1 cursor-pointer",
                            opt.disabled && "cursor-not-allowed",
                          )}
                        >
                          <span className="text-sm font-medium flex items-center gap-2">
                            {opt.label}
                            {opt.disabled && (
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                Soon
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {opt.description}
                          </span>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {isWorkspace && (
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Editing: </span>
                <span className="font-medium">{activeProject.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  ({activeProject.techStack})
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="prompt">
                {isWorkspace ? "Refine with a prompt" : "Describe your website"}
              </Label>
              <Textarea
                id="prompt"
                placeholder={
                  isWorkspace
                    ? "e.g. Change the hero to dark theme and add a contact form section"
                    : "e.g. A modern landing page for a coffee shop with menu, hours, and location map placeholder"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-secondary border-border min-h-[160px] resize-none"
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
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isWorkspace ? "Applying changes..." : "Generating website..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isWorkspace ? "Apply changes" : "Generate website"}
                </>
              )}
            </Button>

            {isWorkspace && activeProject.prompts.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-3 space-y-2 max-h-[180px] overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground">Prompt history</p>
                {activeProject.prompts
                  .filter((p) => p.role === "user")
                  .slice(-5)
                  .reverse()
                  .map((entry, i) => (
                    <p key={`${entry.at}-${i}`} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">
                      {entry.content}
                    </p>
                  ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col min-h-[420px]">
            {!activeProject?.html ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Eye className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">Preview will appear here after you generate a website.</p>
              </div>
            ) : (
              <Tabs
                value={previewTab}
                onValueChange={(v) => setPreviewTab(v as "preview" | "code")}
                className="flex flex-col flex-1"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                  <TabsList className="h-8 bg-transparent p-0 gap-1">
                    <TabsTrigger value="preview" className="h-7 text-xs data-[state=active]:bg-background">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="h-7 text-xs data-[state=active]:bg-background">
                      <Code className="h-3.5 w-3.5 mr-1" />
                      Code
                    </TabsTrigger>
                  </TabsList>
                  {previewTab === "code" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyCode}
                      className="h-7 text-xs"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  )}
                </div>
                <TabsContent value="preview" className="flex-1 m-0 p-0 data-[state=inactive]:hidden">
                  <iframe
                    title={`Preview: ${activeProject.name}`}
                    srcDoc={activeProject.html}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-[min(520px,60vh)] border-0 bg-white"
                  />
                </TabsContent>
                <TabsContent value="code" className="flex-1 m-0 overflow-hidden data-[state=inactive]:hidden">
                  <pre className="p-4 text-xs font-mono text-muted-foreground overflow-auto h-[min(520px,60vh)]">
                    {activeProject.html}
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
