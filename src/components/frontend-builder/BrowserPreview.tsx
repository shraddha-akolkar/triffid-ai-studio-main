import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Code,
  Copy,
  Check,
  Eye,
  Lock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GenerationOverlay } from "./GenerationOverlay";

interface BrowserPreviewProps {
  className?: string;
  html: string | null;
  projectName?: string;
  loading?: boolean;
  loadingMessage?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  versionIndex: number;
  versionCount: number;
  versionLabel?: string;
  previewTab: "preview" | "code";
  onPreviewTabChange: (tab: "preview" | "code") => void;
  onCopy?: () => void;
  copied?: boolean;
  emptyMessage?: string;
}

export function BrowserPreview({
  className,
  html,
  projectName = "preview",
  loading = false,
  loadingMessage,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  versionIndex,
  versionCount,
  versionLabel,
  previewTab,
  onPreviewTabChange,
  onCopy,
  copied = false,
  emptyMessage = "Your website preview will appear here after generation.",
}: BrowserPreviewProps) {
  const [iframeKey, setIframeKey] = useState(0);

  const previewUrl = useMemo(() => {
    const slug = projectName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 32);
    return `https://preview.local/${slug || "site"}/v${versionIndex + 1}`;
  }, [projectName, versionIndex]);

  const hasContent = Boolean(html);

  return (
    <div
      className={cn(
        "flex flex-col flex-1 min-h-0 rounded-xl border border-border bg-card overflow-hidden shadow-lg",
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b border-border bg-[hsl(220_15%_10%)] px-2 py-2 sm:px-3">
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md hover:bg-muted"
            disabled={!canGoBack || loading}
            onClick={onBack}
            aria-label="Previous version"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md hover:bg-muted"
            disabled={!canGoForward || loading}
            onClick={onForward}
            aria-label="Next version"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md hover:bg-muted hidden sm:flex"
            disabled={!hasContent || loading}
            onClick={() => setIframeKey((k) => k + 1)}
            aria-label="Refresh preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center gap-2 min-w-0 mx-1 sm:mx-2 rounded-md bg-background/60 border border-border px-3 py-1.5">
          <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate font-mono">
            {hasContent ? previewUrl : "about:blank"}
          </span>
        </div>

        {versionCount > 0 && hasContent && (
          <span className="hidden md:inline text-[10px] text-muted-foreground shrink-0 tabular-nums">
            {versionIndex + 1} / {versionCount}
          </span>
        )}

        <Tabs
          value={previewTab}
          onValueChange={(v) => onPreviewTabChange(v as "preview" | "code")}
          className="shrink-0"
        >
          <TabsList className="h-8 bg-muted/50 p-0.5">
            <TabsTrigger
              value="preview"
              className="h-7 px-2 text-xs data-[state=active]:bg-background"
            >
              <Eye className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger
              value="code"
              disabled={!hasContent}
              className="h-7 px-2 text-xs data-[state=active]:bg-background"
            >
              <Code className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {previewTab === "code" && hasContent && onCopy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="h-8 text-xs shrink-0 ml-1"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>

      {versionLabel && hasContent && (
        <div className="px-3 py-1 text-[11px] text-muted-foreground border-b border-border/50 bg-muted/20 truncate">
          {versionLabel}
        </div>
      )}

      <div className="relative flex-1 min-h-[min(520px,calc(100vh-16rem))] sm:min-h-[min(640px,calc(100vh-14rem))] lg:min-h-[calc(100vh-13rem)] bg-[hsl(220_10%_12%)]">
        {loading && (
          <GenerationOverlay message={loadingMessage} />
        )}

        {!hasContent && !loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full border border-dashed border-border p-6">
              <Eye className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">{emptyMessage}</p>
          </div>
        ) : previewTab === "preview" ? (
          html && (
            <iframe
              key={iframeKey}
              title={`Preview: ${projectName}`}
              srcDoc={html}
              sandbox="allow-scripts allow-same-origin"
              className={cn(
                "absolute inset-0 w-full h-full border-0 bg-white",
                loading && "opacity-30 pointer-events-none",
              )}
            />
          )
        ) : (
          html && (
            <pre className="absolute inset-0 p-4 text-xs font-mono text-muted-foreground overflow-auto bg-[hsl(220_15%_6%)]">
              {html}
            </pre>
          )
        )}
      </div>
    </div>
  );
}
