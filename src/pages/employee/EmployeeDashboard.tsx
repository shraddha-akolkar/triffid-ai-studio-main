import { projects, users } from "@/services/mockData";
import { FolderKanban, Key, Code } from "lucide-react";
import { StatCard } from "@/components/StatCard";

export default function EmployeeDashboard() {
  const employeeProjects = projects.filter((p) => p.assignees.includes("3"));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Assigned Projects" value={employeeProjects.length} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard title="API Keys Available" value={employeeProjects.filter((p) => p.apiKey).length} icon={<Key className="h-5 w-5" />} />
        <StatCard title="Code Generated" value="12" icon={<Code className="h-5 w-5" />} change="This month" />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border"><h2 className="font-semibold">My Projects</h2></div>
        <div className="divide-y divide-border">
          {employeeProjects.map((p) => (
            <div key={p.id} className="p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">{p.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === "live" ? "bg-success/10 text-success" : p.status === "deploying" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                  {p.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              {p.apiKey && <code className="text-xs text-muted-foreground font-mono mt-2 block">API Key: {p.apiKey}</code>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
