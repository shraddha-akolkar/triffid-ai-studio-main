import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Zap, Shield, Layers, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    } else {
      navigate("/login");
    }
  };

  const features = [
    { icon: <Zap className="h-6 w-6" />, title: "AI-Powered Generation", desc: "Generate full-stack applications from simple prompts in seconds." },
    { icon: <Layers className="h-6 w-6" />, title: "Full-Stack Output", desc: "Frontend, backend, database, and deployment — all generated together." },
    { icon: <Shield className="h-6 w-6" />, title: "Enterprise Security", desc: "Role-based access, API key management, and audit logging built-in." },
    { icon: <Rocket className="h-6 w-6" />, title: "One-Click Deploy", desc: "Deploy to any cloud provider with automated CI/CD pipelines." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text">Triffid AI</span>
          <Button variant="outline" size="sm" onClick={() => navigate("/login")} className="border-border text-foreground hover:bg-muted">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(168_80%_50%/0.08),transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary text-xs text-muted-foreground mb-8 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now in Public Beta
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] animate-fade-in">
            Build full-stack apps
            <br />
            <span className="gradient-text">with AI</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Triffid AI generates production-ready applications from natural language prompts.
            Frontend, backend, database, and deployment — all in one platform.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" onClick={handleGetStarted} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 hover:border-primary/30 transition-colors animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span className="gradient-text font-semibold">Triffid AI</span>
          <span>© 2024 Triffid AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
