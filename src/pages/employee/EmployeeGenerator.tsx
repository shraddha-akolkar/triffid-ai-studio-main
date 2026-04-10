import { useMemo, useState } from "react";
import { dummyGeneratedCode, projects } from "@/services/mockData";
import { Code, Sparkles, Copy, Check, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function EmployeeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [projectId, setProjectId] = useState("");
  const [output, setOutput] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [copied, setCopied] = useState(false);
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId],
  );

  const generate = async () => {
    if (!projectId || !prompt.trim()) return;
    setLoading(true);
    setOutput("");
    setPreviewUrl("");
    // Simulate typing effect
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    const generatedPreviewUrl = `https://preview.triffid.ai/${projectId}/feature-${Date.now()}`;
    setPreviewUrl(generatedPreviewUrl);
    const generatedHeader = `// Project: ${selectedProject?.name ?? "Unknown"}\n// Feature request: ${prompt.trim()}\n// Preview: ${generatedPreviewUrl}\n\n`;
    const generatedCode = `${generatedHeader}${dummyGeneratedCode}`;
    let i = 0;
    const interval = setInterval(() => {
      setOutput(generatedCode.slice(0, i));
      i += 3;
      if (i > generatedCode.length) {
        setOutput(generatedCode);
        clearInterval(interval);
      }
    }, 10);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendToDeployment = async () => {
    if (!projectId || !previewUrl || !output) return;
    setDeploying(true);
    await new Promise((r) => setTimeout(r, 900));
    setDeploying(false);
    toast({
      title: "Sent to deployment",
      description: `${selectedProject?.name ?? "Project"} feature has been queued.`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feature Generator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Project</p>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Describe the feature to add... e.g. 'Add a user profile page with avatar upload and account settings'"
            value={prompt} onChange={(e) => setPrompt(e.target.value)}
            className="bg-secondary border-border min-h-[200px] resize-none" />
          <Button onClick={generate} disabled={loading || !projectId || !prompt.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? <><Sparkles className="h-4 w-4 mr-2 animate-spin" /> Generating Feature...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Feature</>}
          </Button>
          {previewUrl && (
            <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Preview Link</p>
                <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all inline-flex items-center gap-1">
                  {previewUrl}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              </div>
              <Button
                onClick={sendToDeployment}
                disabled={deploying}
                className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {deploying ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Deployment
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" /> Generated Output
            </div>
            {output && (
              <Button variant="ghost" size="sm" onClick={copyCode} className="h-7 text-xs">
                {copied ? <Check className="h-3 w-3 mr-1 text-success" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <pre className="p-4 text-sm font-mono text-muted-foreground overflow-auto min-h-[200px] max-h-[400px]">
            {output || <span className="text-muted-foreground/50">Feature changes will appear here after generation...</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
