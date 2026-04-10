import { useState } from "react";
import { users as initialUsers, User, Role } from "@/services/mockData";
import { Users, UserCheck, Shield, Plus, Pencil, Trash2, X } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "employee" as Role });

  const stats = {
    total: userList.length,
    active: userList.filter((u) => u.status === "active").length,
    admins: userList.filter((u) => u.role === "admin").length,
    managers: userList.filter((u) => u.role === "manager").length,
    employees: userList.filter((u) => u.role === "employee").length,
  };

  const handleSave = () => {
    if (editingUser) {
      setUserList((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, name: form.name, email: form.email, role: form.role } : u));
    } else {
      const newUser: User = { id: Date.now().toString(), name: form.name, email: form.email, role: form.role, status: "active", avatar: form.name.split(" ").map((n) => n[0]).join(""), joinedAt: new Date().toISOString().split("T")[0] };
      setUserList((prev) => [...prev, newUser]);
    }
    setShowForm(false);
    setEditingUser(null);
    setForm({ name: "", email: "", role: "employee" });
  };

  const handleEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, role: u.role });
    setShowForm(true);
  };

  const handleDelete = (id: string) => setUserList((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => { setShowForm(true); setEditingUser(null); setForm({ name: "", email: "", role: "employee" }); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.total} icon={<Users className="h-5 w-5" />} change="+12% this month" changeType="positive" />
        <StatCard title="Active Users" value={stats.active} icon={<UserCheck className="h-5 w-5" />} change={`${Math.round((stats.active / stats.total) * 100)}% active`} changeType="positive" />
        <StatCard title="Admins" value={stats.admins} icon={<Shield className="h-5 w-5" />} />
        <StatCard title="Employees" value={stats.employees} icon={<Users className="h-5 w-5" />} />
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editingUser ? "Edit User" : "Add User"}</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary border-border" />
            <Select value={form.role} onValueChange={(v: Role) => setForm({ ...form, role: v })}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
            {editingUser ? "Update" : "Create"} User
          </Button>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 font-medium text-muted-foreground">User</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">{u.avatar}</div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : u.role === "manager" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`flex items-center gap-1.5 text-xs ${u.status === "active" ? "text-success" : "text-muted-foreground"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{u.joinedAt}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(u)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
