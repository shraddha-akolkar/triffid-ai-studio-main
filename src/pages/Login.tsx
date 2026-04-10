import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      const stored = JSON.parse(localStorage.getItem("triffid_user") || "{}");
      navigate(`/${stored.role}`);
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(168_80%_50%/0.06),transparent_60%)]" />
      <div className="w-full max-w-sm mx-auto p-8 relative animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-2">Triffid AI</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@triffid.ai" className="bg-secondary border-border" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="bg-secondary border-border" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 space-y-1">
          <p className="text-xs text-muted-foreground text-center">Demo Credentials:</p>
          {[
            { label: "Admin", email: "admin@triffid.ai", pw: "admin123" },
            { label: "Manager", email: "manager@triffid.ai", pw: "manager123" },
            { label: "Employee", email: "employee@triffid.ai", pw: "employee123" },
          ].map((c) => (
            <button key={c.label} onClick={() => { setEmail(c.email); setPassword(c.pw); }}
              className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded hover:bg-muted transition-colors">
              <span className="font-medium text-foreground">{c.label}:</span> {c.email}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
