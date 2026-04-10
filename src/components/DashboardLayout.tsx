import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based route protection
  const path = location.pathname;
  if (path.startsWith("/admin") && user.role !== "admin") return <Navigate to={`/${user.role}`} replace />;
  if (path.startsWith("/manager") && user.role !== "manager") return <Navigate to={`/${user.role}`} replace />;
  if (path.startsWith("/employee") && user.role !== "employee") return <Navigate to={`/${user.role}`} replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
