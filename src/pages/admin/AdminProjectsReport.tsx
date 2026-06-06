import { useMemo } from "react";
import {
  FolderKanban,
  Code,
  Database,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  getProjectsByType,
  getProjectsReport,
  formatReportDate,
  type ProjectReportType,
} from "@/services/adminReportStorage";
import { TECH_STACK_LABELS } from "@/hooks/useFrontendProjects";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const typeStyles: Record<ProjectReportType, string> = {
  frontend: "bg-primary/10 text-primary",
  database: "bg-warning/10 text-warning",
  deployment: "bg-success/10 text-success",
};

const statusStyles: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  live: "bg-success/10 text-success",
  deploying: "bg-warning/10 text-warning",
  pending: "bg-muted text-muted-foreground",
};

const chartColors = ["hsl(168 80% 50%)", "hsl(45 90% 55%)", "hsl(200 80% 55%)"];

export default function AdminProjectsReport() {
  const projects = useMemo(() => getProjectsReport(), []);
  const chartData = useMemo(() => getProjectsByType(projects), [projects]);

  const stats = useMemo(() => ({
    total: projects.length,
    frontend: projects.filter((p) => p.type === "frontend").length,
    database: projects.filter((p) => p.type === "database").length,
    live: projects.filter((p) => p.status === "live").length,
  }), [projects]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Project names from local storage; other fields are demo placeholder data
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.total}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <StatCard
          title="Frontend"
          value={stats.frontend}
          icon={<Code className="h-5 w-5" />}
          change={`${stats.database} database`}
        />
        <StatCard
          title="Live (Demo)"
          value={stats.live}
          icon={<CheckCircle2 className="h-5 w-5" />}
          change="Placeholder status"
          changeType="positive"
        />
        <StatCard
          title="Database"
          value={stats.database}
          icon={<Database className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Projects by Type</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 15%)" />
            <XAxis
              dataKey="type"
              tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(220 15% 8%)",
                border: "1px solid hsl(220 15% 15%)",
                borderRadius: 8,
                color: "hsl(210 20% 95%)",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={chartColors[i % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">All Projects</h3>
        </div>
        {projects.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No projects in local storage yet. Create projects in the Frontend Builder or Database workspace to see them here.
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 font-medium text-muted-foreground">Project</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Owner</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Details</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={`${project.type}-${project.id}`}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="p-4 font-medium">{project.name}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${typeStyles[project.type]}`}
                  >
                    {project.type}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[project.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{project.owner}</td>
                <td className="p-4 text-muted-foreground text-xs">
                  {project.type === "frontend" && project.techStack && (
                    <span>{TECH_STACK_LABELS[project.techStack]}</span>
                  )}
                  {project.type === "frontend" && project.versionCount != null && (
                    <span className="ml-2">{project.versionCount} versions (demo)</span>
                  )}
                  {project.type === "database" && project.tableCount != null && (
                    <span>{project.tableCount} tables (demo)</span>
                  )}
                  {project.promptCount > 0 && (
                    <span className="ml-2">{project.promptCount} prompts (demo)</span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground whitespace-nowrap">
                  {formatReportDate(project.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
