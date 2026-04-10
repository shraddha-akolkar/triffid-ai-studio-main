import { useState } from "react";
import { projects } from "@/services/mockData";
import { Rocket, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManagerDeployment() {
  const [deployments, setDeployments] = useState(projects.map((p) => ({ ...p })));

  const deploy = (id: string) => {
    setDeployments((prev) => prev.map((d) => d.id === id ? { ...d, status: "deploying" as const } : d));
    setTimeout(() => {
      setDeployments((prev) => prev.map((d) => d.id === id ? { ...d, status: "live" as const } : d));
    }, 2000);
  };

  const statusIcon = (s: string) => {
    if (s === "live") return <CheckCircle className="h-4 w-4 text-success" />;
    if (s === "deploying") return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deployment</h1>
      <div className="space-y-3">
        {deployments.map((d) => (
          <div key={d.id} className="rounded-lg border border-border bg-card p-5 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-4">
              {statusIcon(d.status)}
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{d.status}</p>
              </div>
            </div>
            {d.status === "pending" && (
              <Button size="sm" onClick={() => deploy(d.id)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Rocket className="h-3.5 w-3.5 mr-1.5" /> Deploy
              </Button>
            )}
            {d.status === "live" && <span className="text-xs text-success font-medium">Live ✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
