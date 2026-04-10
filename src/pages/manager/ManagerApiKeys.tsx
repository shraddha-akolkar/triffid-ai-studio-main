import { useState } from "react";
import { Key, Copy, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManagerApiKeys() {
  const [keys, setKeys] = useState([
    { id: "1", name: "Production", key: "trfk_live_a1b2c3d4e5f6g7h8", created: "2024-06-01" },
    { id: "2", name: "Development", key: "trfk_dev_x9y8z7w6v5u4t3s2", created: "2024-07-15" },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const random = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setKeys((prev) => [...prev, { id: Date.now().toString(), name: `Key ${prev.length + 1}`, key: `trfk_new_${random}`, created: new Date().toISOString().split("T")[0] }]);
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button onClick={generateKey} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Generate Key
        </Button>
      </div>
      <div className="space-y-3">
        {keys.map((k) => (
          <div key={k.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{k.name}</p>
                <code className="text-xs text-muted-foreground font-mono">{k.key}</code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{k.created}</span>
              <Button variant="ghost" size="icon" onClick={() => copyKey(k.id, k.key)}>
                {copiedId === k.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
