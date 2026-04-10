import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Circle,
  Clock3,
  GitBranch,
  Play,
  RefreshCcw,
  Server,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stages = [
  { name: "Lint", status: "complete", time: "18s" },
  { name: "Build", status: "complete", time: "34s" },
  { name: "Test", status: "running", time: "1m 02s" },
  { name: "Security Scan", status: "pending", time: "Queued" },
  { name: "Deploy", status: "pending", time: "Waiting" },
];

const services = [
  { name: "GitHub Actions", purpose: "Primary pipeline runner", status: "Connected", sync: "1 min ago" },
  { name: "Docker Registry", purpose: "Container image publishing", status: "Connected", sync: "4 min ago" },
  { name: "Kubernetes", purpose: "Staging and production rollout", status: "Connected", sync: "2 min ago" },
  { name: "Sentry", purpose: "Release error tracking", status: "Warning", sync: "17 min ago" },
  { name: "Slack", purpose: "Deployment alerts and approvals", status: "Connected", sync: "Now" },
  { name: "SonarQube", purpose: "Code quality gates", status: "Disconnected", sync: "2h ago" },
];

const environments = [
  { name: "Development", health: 98, builds: 42, lastDeploy: "9 min ago", flag: "Healthy" },
  { name: "Staging", health: 91, builds: 19, lastDeploy: "27 min ago", flag: "Stable" },
  { name: "Production", health: 96, builds: 8, lastDeploy: "1h ago", flag: "Protected" },
];

const runQueue = [
  { id: "job-318", pipeline: "frontend-release", branch: "feat/billing", eta: "2m", trigger: "Manual" },
  { id: "job-317", pipeline: "api-release", branch: "fix/rate-limit", eta: "5m", trigger: "Push" },
  { id: "job-316", pipeline: "security-check", branch: "main", eta: "8m", trigger: "Schedule" },
];

const recentRuns = [
  { id: "#248", branch: "main", status: "success", duration: "2m 24s", commit: "Release v1.8.0", author: "Nadia" },
  { id: "#247", branch: "feat/checkout", status: "success", duration: "3m 03s", commit: "Finalize checkout flow", author: "Vik" },
  { id: "#246", branch: "fix/session", status: "failed", duration: "1m 39s", commit: "Patch token refresh logic", author: "Ari" },
  { id: "#245", branch: "main", status: "cancelled", duration: "32s", commit: "Hotfix trigger rollback", author: "Nadia" },
];

export default function ManagerCICD() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">CI/CD Pipeline</h1>
          <p className="text-sm text-muted-foreground">Manage integrations, monitor release flow, and keep deployments healthy.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">
            <Play className="h-3.5 w-3.5" />
            Run Pipeline
          </Button>
          <Button size="sm" variant="outline">
            <RefreshCcw className="h-3.5 w-3.5" />
            Sync Services
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Current Execution</h3>
          <Badge variant="secondary">Run #249</Badge>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-[760px] items-center justify-center gap-4">
            {stages.map((s, i) => (
              <div key={s.name} className="flex items-center gap-4">
                <div
                  className={`flex min-w-[132px] flex-col items-center gap-2 rounded-lg border px-4 py-4 text-center transition-all ${
                    s.status === "complete"
                      ? "border-success/30 bg-success/5"
                      : s.status === "running"
                        ? "border-warning/30 bg-warning/5 animate-pulse-glow"
                        : "border-border bg-muted/20"
                  }`}
                >
                  {s.status === "complete" ? (
                    <CheckCircle className="h-6 w-6 text-success" />
                  ) : s.status === "running" ? (
                    <Circle className="h-6 w-6 text-warning" />
                  ) : (
                    <Clock3 className="h-6 w-6 text-muted-foreground" />
                  )}
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.time}</span>
                </div>
                {i < stages.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall progress</span>
            <span>57%</span>
          </div>
          <Progress value={57} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {environments.map((env) => (
          <div key={env.name} className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">{env.name}</h4>
              </div>
              <Badge variant={env.name === "Production" ? "default" : "secondary"}>{env.flag}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Health score</span>
                <span>{env.health}%</span>
              </div>
              <Progress value={env.health} />
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
                <span>Builds today: {env.builds}</span>
                <span className="text-right">Last deploy: {env.lastDeploy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Connected Services</h3>
          <Button size="sm" variant="outline">
            <Wrench className="h-3.5 w-3.5" />
            Manage Integrations
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.name} className="rounded-md border border-border/70 bg-muted/10 px-4 py-3">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{service.name}</p>
                </div>
                <Badge
                  variant={
                    service.status === "Connected"
                      ? "secondary"
                      : service.status === "Warning"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {service.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{service.purpose}</p>
              <p className="mt-2 text-xs text-muted-foreground">Last sync: {service.sync}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold">Run Queue</h3>
          <div className="space-y-2">
            {runQueue.map((job) => (
              <div key={job.id} className="rounded-md border border-border/70 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.pipeline}</span>
                  </div>
                  <Badge variant="outline">{job.trigger}</Badge>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{job.branch}</span>
                  <span>ETA {job.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold">Security and Quality Gates</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-success" />
                Dependency scan
              </div>
              <Badge variant="secondary">Passed</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-success" />
                Unit test coverage
              </div>
              <Badge variant="secondary">86%</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" />
                SAST findings
              </div>
              <Badge variant="outline">2 medium</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-3 font-semibold">Recent Runs</h3>
        <div className="space-y-2">
          {recentRuns.map((run) => (
            <div key={run.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2">
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    run.status === "success"
                      ? "bg-success"
                      : run.status === "failed"
                        ? "bg-destructive"
                        : "bg-warning"
                  }`}
                />
                <span className="font-mono text-sm">{run.id}</span>
                <span className="text-sm text-muted-foreground">{run.branch}</span>
                <span className="hidden text-xs text-muted-foreground md:inline">{run.commit}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{run.author}</span>
                <span>{run.duration}</span>
                <Button size="sm" variant="ghost">
                  View Logs
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
