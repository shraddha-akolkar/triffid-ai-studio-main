import { metrics } from "@/services/mockData";
import { Activity, BarChart3, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ManagerMonitoring() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Monitoring</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Uptime" value={`${metrics.uptime}%`} icon={<Clock className="h-5 w-5" />} change="Last 30 days" changeType="positive" />
        <StatCard title="API Calls (7d)" value={metrics.totalApiCalls.toLocaleString()} icon={<BarChart3 className="h-5 w-5" />} change="+18%" changeType="positive" />
        <StatCard title="Active Services" value={metrics.activeDeployments} icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold mb-4">CPU Usage (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.cpu}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 15%)" />
              <XAxis dataKey="time" tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(220 15% 8%)", border: "1px solid hsl(220 15% 15%)", borderRadius: 8, color: "hsl(210 20% 95%)" }} />
              <Area type="monotone" dataKey="value" stroke="hsl(168 80% 50%)" fill="hsl(168 80% 50% / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold mb-4">API Calls per Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.apiCalls}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 15%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(220 15% 8%)", border: "1px solid hsl(220 15% 15%)", borderRadius: 8, color: "hsl(210 20% 95%)" }} />
              <Bar dataKey="calls" fill="hsl(168 80% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
