import { metrics } from "@/services/mockData";
import { Cloud, Cpu, HardDrive, Wifi } from "lucide-react";

export default function ManagerCloud() {
  const { cloudUsage } = metrics;

  const items = [
    { label: "Compute", value: cloudUsage.compute, icon: Cpu, color: "bg-primary" },
    { label: "Storage", value: cloudUsage.storage, icon: HardDrive, color: "bg-warning" },
    { label: "Bandwidth", value: cloudUsage.bandwidth, icon: Wifi, color: "bg-success" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cloud Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{item.label}</span>
            </div>
            <div className="text-3xl font-bold mb-3">{item.value}%</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${item.value}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{item.value}% of allocated resources</p>
          </div>
        ))}
      </div>
    </div>
  );
}
