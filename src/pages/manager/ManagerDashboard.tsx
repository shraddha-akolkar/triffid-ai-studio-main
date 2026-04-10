import { useState } from "react";
import { projects as initialProjects, users, metrics, Project } from "@/services/mockData";
import { FolderKanban, Rocket, Activity, BarChart3, Plus, X } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ManagerDashboard() {
  const [projectList] = useState<Project[]>(initialProjects);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={projectList.length} icon={<FolderKanban className="h-5 w-5" />} change="+2 this month" changeType="positive" />
        <StatCard title="Live Deployments" value={metrics.activeDeployments} icon={<Rocket className="h-5 w-5" />} />
        <StatCard title="API Calls (7d)" value={metrics.totalApiCalls.toLocaleString()} icon={<BarChart3 className="h-5 w-5" />} change="+18% vs last week" changeType="positive" />
        <StatCard title="Uptime" value={`${metrics.uptime}%`} icon={<Activity className="h-5 w-5" />} changeType="positive" change="Last 30 days" />
      </div>

      {/* Recent Projects */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Recent Projects</h2>
        </div>
        <div className="divide-y divide-border">
          {projectList.slice(0, 3).map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.description.slice(0, 60)}...</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === "live" ? "bg-success/10 text-success" : p.status === "deploying" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
