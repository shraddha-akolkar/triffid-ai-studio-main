import { useMemo } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  getActivityByDay,
  getActivityReport,
  formatReportDate,
  type ActivityResourceType,
} from "@/services/adminReportStorage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const resourceTypeStyles: Record<ActivityResourceType, string> = {
  frontend: "bg-primary/10 text-primary",
  database: "bg-warning/10 text-warning",
  deployment: "bg-success/10 text-success",
  auth: "bg-muted text-muted-foreground",
  user: "bg-destructive/10 text-destructive",
};

export default function AdminActivityReport() {
  const activities = useMemo(() => getActivityReport(), []);
  const chartData = useMemo(() => getActivityByDay(activities), [activities]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayCount = activities.filter(
      (a) => new Date(a.timestamp).toDateString() === today,
    ).length;
    const uniqueUsers = new Set(activities.map((a) => a.userId)).size;
    const topAction = activities.reduce<Record<string, number>>((acc, a) => {
      acc[a.action] = (acc[a.action] ?? 0) + 1;
      return acc;
    }, {});
    const mostCommon = Object.entries(topAction).sort((a, b) => b[1] - a[1])[0];

    return {
      total: activities.length,
      today: todayCount,
      uniqueUsers,
      mostCommon: mostCommon ? mostCommon[0] : "—",
    };
  }, [activities]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          User activity across the platform (local storage demo data)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Activities"
          value={stats.total}
          icon={<Activity className="h-5 w-5" />}
          change="All time"
        />
        <StatCard
          title="Today"
          value={stats.today}
          icon={<Clock className="h-5 w-5" />}
          change="Last 24 hours"
          changeType="positive"
        />
        <StatCard
          title="Active Users"
          value={stats.uniqueUsers}
          icon={<Users className="h-5 w-5" />}
          change="In activity log"
        />
        <StatCard
          title="Top Action"
          value={stats.mostCommon}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Activity (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 15%)" />
            <XAxis
              dataKey="day"
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
            <Bar dataKey="count" fill="hsl(168 80% 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Activity Log</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 font-medium text-muted-foreground">User</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Resource</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="p-4 font-medium">{entry.userName}</td>
                <td className="p-4">{entry.action}</td>
                <td className="p-4 text-muted-foreground">{entry.resource}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${resourceTypeStyles[entry.resourceType]}`}
                  >
                    {entry.resourceType}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground whitespace-nowrap">
                  {formatReportDate(entry.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
