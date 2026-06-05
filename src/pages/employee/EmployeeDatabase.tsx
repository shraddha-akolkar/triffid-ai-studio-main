import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Database,
  FolderOpen,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Table2,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { DatabaseProject, DatabaseTable } from "@/types/database";
import {
  createProjectId,
  deleteDatabaseProject,
  loadDatabaseProjects,
  upsertDatabaseProject,
} from "@/services/databaseStorage";
import {
  applyAiTables,
  generateDatabaseFromPrompt,
  updateDatabaseFromPrompt,
} from "@/services/openaiDatabase";

function renderMessageContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function EmployeeDatabase() {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [databaseName, setDatabaseName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"create" | "workspace">("create");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeId),
    [projects, activeId],
  );

  const activeTable = useMemo(() => {
    if (!activeProject) return undefined;
    return (
      activeProject.tables.find((t) => t.id === activeProject.activeTableId) ??
      activeProject.tables[0]
    );
  }, [activeProject]);

  const refreshProjects = useCallback(() => {
    setProjects(loadDatabaseProjects());
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeProject?.prompts, loading]);

  const openProject = (project: DatabaseProject) => {
    setActiveId(project.id);
    setDatabaseName(project.name);
    setPrompt("");
    setView("workspace");
  };

  const startNewDatabase = () => {
    setActiveId(null);
    setDatabaseName("");
    setPrompt("");
    setView("create");
  };

  const persistProject = (project: DatabaseProject) => {
    const updated = upsertDatabaseProject(project);
    setProjects(updated);
    setActiveId(project.id);
    setView("workspace");
  };

  const handleCreate = async () => {
    const name = databaseName.trim();
    if (!name) {
      toast({
        title: "Database name required",
        description: "Enter a name for your database project.",
        variant: "destructive",
      });
      return;
    }
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Describe the tables and data you want to create.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const ai = await generateDatabaseFromPrompt(prompt.trim());
      const now = new Date().toISOString();
      const { tables, activeTableId } = applyAiTables([], ai.tables, ai.activeTableName);

      const project: DatabaseProject = {
        id: createProjectId(),
        name,
        tables,
        activeTableId,
        prompts: [
          { role: "user", content: prompt.trim(), at: now },
          { role: "assistant", content: ai.message, at: now },
        ],
        createdAt: now,
        updatedAt: now,
      };
      persistProject(project);
      setPrompt("");
      toast({
        title: "Database created",
        description: `"${name}" saved locally with ${tables.length} table(s).`,
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

  const handlePrompt = async () => {
    if (!activeProject) return;
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Describe what you want to do with the database.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const ai = await updateDatabaseFromPrompt(
        activeProject.tables,
        prompt.trim(),
      );
      const now = new Date().toISOString();
      const { tables, activeTableId } = applyAiTables(
        activeProject.tables,
        ai.tables,
        ai.activeTableName,
        activeProject.activeTableId,
      );

      const updated: DatabaseProject = {
        ...activeProject,
        tables,
        activeTableId,
        prompts: [
          ...activeProject.prompts,
          { role: "user", content: prompt.trim(), at: now },
          { role: "assistant", content: ai.message, at: now },
        ],
        updatedAt: now,
      };
      persistProject(updated);
      setPrompt("");
      toast({
        title: "Database updated",
        description: "Changes saved to local storage.",
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
    const next = deleteDatabaseProject(id);
    setProjects(next);
    if (activeId === id) startNewDatabase();
    toast({ title: "Database deleted", description: "Removed from local storage." });
  };

  const setActiveTable = (tableId: string) => {
    if (!activeProject) return;
    persistProject({ ...activeProject, activeTableId: tableId });
  };

  const saveTables = (tables: DatabaseTable[]) => {
    if (!activeProject) return;
    persistProject({
      ...activeProject,
      tables,
      updatedAt: new Date().toISOString(),
    });
  };

  const addRow = () => {
    if (!activeTable || !activeProject) return;
    const tables = activeProject.tables.map((t) =>
      t.id === activeTable.id
        ? {
            ...t,
            rows: [...t.rows, t.columns.map(() => "")],
            updatedAt: new Date().toISOString(),
          }
        : t,
    );
    saveTables(tables);
  };

  const deleteRow = (rowIdx: number) => {
    if (!activeTable || !activeProject) return;
    const tables = activeProject.tables.map((t) =>
      t.id === activeTable.id
        ? {
            ...t,
            rows: t.rows.filter((_, i) => i !== rowIdx),
            updatedAt: new Date().toISOString(),
          }
        : t,
    );
    saveTables(tables);
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    if (!activeTable || !activeProject) return;
    const tables = activeProject.tables.map((t) => {
      if (t.id !== activeTable.id) return t;
      const rows = t.rows.map((r) => [...r]);
      rows[rowIdx][colIdx] = value;
      return { ...t, rows, updatedAt: new Date().toISOString() };
    });
    saveTables(tables);
  };

  const isWorkspace = view === "workspace" && activeProject;

  const quickPrompts = isWorkspace
    ? [
        "Add 3 sample records to the active table",
        "Create a new related table",
        "Show me a summary of all tables",
      ]
    : [
        "E-commerce database with products, orders, and customers tables",
        "HR system with employees, departments, and salaries",
        "Blog with posts, authors, and comments",
      ];

  return (
    <div className="flex flex-col gap-5 pb-6 min-h-[calc(100vh-5rem)]">
      <header className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Database Builder</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Create multiple databases with AI, each containing tables and records.
          Powered by OpenAI — all projects saved locally for your demo.
        </p>
      </header>

      <div className="flex flex-1 flex-col xl:flex-row gap-5 min-h-0">
        {/* Databases sidebar */}
        <aside className="xl:w-56 shrink-0 rounded-xl border border-border bg-card p-4 space-y-3 h-fit xl:sticky xl:top-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              Databases
            </h2>
            <Button variant="outline" size="sm" onClick={startNewDatabase} className="h-8">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              No databases yet. Create one with a name and prompt below.
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
                    <span className="truncate font-medium flex items-center gap-1.5">
                      <Database className="h-3 w-3 shrink-0" />
                      {project.name}
                    </span>
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

        <div className="flex flex-1 flex-col lg:flex-row gap-5 min-w-0 min-h-0">
          {/* Main content */}
          <div className="flex flex-1 flex-col gap-4 min-w-0 min-h-0">
            {/* Prompt form */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm shrink-0">
              {!isWorkspace && (
                <div className="space-y-2">
                  <Label htmlFor="database-name">Database name</Label>
                  <Input
                    id="database-name"
                    placeholder="e.g. E-Commerce Store"
                    value={databaseName}
                    onChange={(e) => setDatabaseName(e.target.value)}
                    className="bg-secondary border-border"
                    disabled={loading}
                  />
                </div>
              )}

              {isWorkspace && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Editing </span>
                  <span className="font-semibold">{activeProject.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {activeProject.tables.length} table(s)
                  </span>
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="prompt">
                  {isWorkspace ? "Manage with prompt" : "Describe your database"}
                </Label>
                <Textarea
                  id="prompt"
                  placeholder={
                    isWorkspace
                      ? 'e.g. "Add 5 products" or "Create an inventory table linked to products"'
                      : 'e.g. "E-commerce DB with products (name, price, stock), customers, and orders tables with sample data"'
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-secondary border-border min-h-[88px] resize-none text-sm"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setPrompt(q)}
                    disabled={loading}
                    className="text-[10px] px-2 py-1 rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <Button
                onClick={isWorkspace ? handlePrompt : handleCreate}
                disabled={
                  loading ||
                  (!isWorkspace && (!databaseName.trim() || !prompt.trim())) ||
                  (isWorkspace && !prompt.trim())
                }
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isWorkspace ? "Updating…" : "Generating…"}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isWorkspace ? "Run prompt" : "Create database"}
                  </>
                )}
              </Button>
            </div>

            {/* Tables + data grid */}
            {isWorkspace && (
              <div className="flex flex-1 flex-col min-h-0 gap-3">
                {activeProject.tables.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {activeProject.tables.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTable(t.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                          activeTable?.id === t.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Table2 className="h-3 w-3" />
                        {t.name}
                        <span className="opacity-70">({t.rows.length})</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col flex-1 min-h-[240px]">
                  <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {activeTable ? (
                          <>
                            <Table2 className="h-4 w-4 text-primary" />
                            {activeTable.name}
                          </>
                        ) : (
                          "No tables yet"
                        )}
                      </h3>
                      {activeTable && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activeTable.rows.length} record(s) ·{" "}
                          {activeTable.columns.length} column(s)
                        </p>
                      )}
                    </div>
                    {activeTable && (
                      <Button
                        size="sm"
                        onClick={addRow}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add row
                      </Button>
                    )}
                  </div>

                  {!activeTable ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground">
                      Use a prompt to create tables in this database.
                    </div>
                  ) : activeTable.rows.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-2 text-center">
                      <Table2 className="h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Table is empty. Add records via prompt or Add row.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            {activeTable.columns.map((col) => (
                              <th
                                key={col}
                                className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap"
                              >
                                {col}
                              </th>
                            ))}
                            <th className="p-3 w-10" />
                          </tr>
                        </thead>
                        <tbody>
                          {activeTable.rows.map((row, ri) => (
                            <tr
                              key={ri}
                              className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                            >
                              {row.map((cell, ci) => (
                                <td key={ci} className="p-2">
                                  <Input
                                    value={cell}
                                    onChange={(e) =>
                                      updateCell(ri, ci, e.target.value)
                                    }
                                    className="bg-transparent border-transparent hover:border-border focus:border-primary h-8 text-sm min-w-[100px]"
                                  />
                                </td>
                              ))}
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteRow(ri)}
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isWorkspace && (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">How it works</p>
                <ul className="space-y-1.5 text-xs list-disc list-inside">
                  <li>Create multiple databases — each is a separate project</li>
                  <li>Each database can have many tables with records</li>
                  <li>Use prompts to create, update, and query data via OpenAI</li>
                  <li>Manually edit cells in the table view anytime</li>
                </ul>
              </div>
            )}
          </div>

          {/* Chat history */}
          {isWorkspace && (
            <aside className="lg:w-[320px] shrink-0 flex flex-col rounded-xl border border-border bg-card shadow-sm min-h-[300px] lg:max-h-[calc(100vh-8rem)]">
              <div className="p-4 border-b border-border shrink-0">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Chat history
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Conversation for {activeProject.name}
                </p>
              </div>

              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {activeProject.prompts.map((msg, i) => (
                    <div
                      key={`${msg.at}-${i}`}
                      className={cn(
                        "flex gap-2.5",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                          msg.role === "user"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {msg.role === "user" ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "rounded-xl px-3 py-2 text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 text-foreground",
                        )}
                      >
                        {msg.role === "assistant"
                          ? renderMessageContent(msg.content)
                          : msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="rounded-xl px-3 py-2 bg-muted/60 text-sm flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Thinking…
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
