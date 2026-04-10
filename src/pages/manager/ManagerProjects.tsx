import { useState } from "react";
import { projects as initialProjects, users, Project } from "@/services/mockData";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ManagerProjects() {
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const employees = users.filter((u) => u.role === "employee");

  const handleCreate = () => {
    const newProject: Project = {
      id: `p${Date.now()}`, name: form.name, description: form.description,
      status: "pending", assignees: [], createdAt: new Date().toISOString().split("T")[0],
    };
    setProjectList((prev) => [...prev, newProject]);
    setShowForm(false);
    setForm({ name: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Create Project</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-4">
            <Input placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectList.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-card p-5 hover:border-primary/30 transition-colors animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{p.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === "live" ? "bg-success/10 text-success" : p.status === "deploying" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                {p.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Assignees:</span>
              <div className="flex -space-x-2">
                {p.assignees.map((id) => {
                  const u = users.find((u) => u.id === id);
                  return u ? (
                    <div key={id} className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary border-2 border-card">{u.avatar}</div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
