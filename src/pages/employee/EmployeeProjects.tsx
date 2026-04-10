import { projects, users } from "@/services/mockData";

export default function EmployeeProjects() {
  const employeeProjects = projects.filter((p) => p.assignees.includes("3"));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employeeProjects.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{p.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === "live" ? "bg-success/10 text-success" : p.status === "deploying" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                {p.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
            {p.apiKey && (
              <div className="rounded bg-muted/30 p-2">
                <span className="text-xs text-muted-foreground">API Key: </span>
                <code className="text-xs font-mono text-primary">{p.apiKey}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
