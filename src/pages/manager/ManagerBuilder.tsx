import { useState } from "react";
import { Move, Type, Image, Square } from "lucide-react";

const mockComponents = [
  { id: "1", type: "Header", icon: Type, label: "Header Block" },
  { id: "2", type: "Image", icon: Image, label: "Image Block" },
  { id: "3", type: "Button", icon: Square, label: "Button Block" },
];

export default function ManagerBuilder() {
  const [canvas, setCanvas] = useState<string[]>(["Header Block", "Image Block"]);

  const addToCanvas = (label: string) => {
    setCanvas((prev) => [...prev, label]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Visual Builder</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Components Panel */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold mb-3 text-sm">Components</h3>
          <div className="space-y-2">
            {mockComponents.map((c) => (
              <button key={c.id} onClick={() => addToCanvas(c.label)}
                className="w-full flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary/30 hover:bg-muted/30 transition-colors text-sm">
                <c.icon className="h-4 w-4 text-primary" />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3 rounded-lg border border-border bg-card p-6 min-h-[400px]">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Canvas</h3>
          <div className="space-y-3">
            {canvas.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-md border border-dashed border-border bg-muted/10 hover:border-primary/30 transition-colors">
                <Move className="h-4 w-4 text-muted-foreground cursor-grab" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
            {canvas.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-20">Click components to add them to the canvas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
