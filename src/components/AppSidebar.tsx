import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FolderKanban, Key, Rocket, Activity,
  GitBranch, Blocks, Cloud, Calculator, Code, Database
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const navByRole = {
  admin: [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Users", url: "/admin/users", icon: Users },
  ],
  manager: [
    { title: "Dashboard", url: "/manager", icon: LayoutDashboard },
    { title: "Projects", url: "/manager/projects", icon: FolderKanban },
    { title: "API Keys", url: "/manager/api-keys", icon: Key },
    { title: "Deployment", url: "/manager/deployment", icon: Rocket },
    { title: "Monitoring", url: "/manager/monitoring", icon: Activity },
    { title: "CI/CD", url: "/manager/cicd", icon: GitBranch },
    { title: "Visual Builder", url: "/manager/builder", icon: Blocks },
    { title: "Cloud", url: "/manager/cloud", icon: Cloud },
    { title: "AI Cost", url: "/manager/cost", icon: Calculator },
  ],
  employee: [
    { title: "Dashboard", url: "/employee", icon: LayoutDashboard },
    { title: "Projects", url: "/employee/projects", icon: FolderKanban },
    { title: "AI Generator", url: "/employee/generator", icon: Code },
    { title: "Database", url: "/employee/database", icon: Database },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const items = user ? navByRole[user.role] : [];

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="h-14 flex items-center px-4 border-b border-border">
        {!collapsed && (
          <span className="text-lg font-bold gradient-text tracking-tight">Triffid AI</span>
        )}
        {collapsed && <span className="text-lg font-bold gradient-text">T</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            {!collapsed && (user?.role || "Menu")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === `/${user?.role}`}
                      className="hover:bg-muted/50 transition-colors"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
