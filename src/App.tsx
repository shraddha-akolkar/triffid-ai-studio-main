import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminActivityReport from "./pages/admin/AdminActivityReport";
import AdminProjectsReport from "./pages/admin/AdminProjectsReport";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerProjects from "./pages/manager/ManagerProjects";
import ManagerApiKeys from "./pages/manager/ManagerApiKeys";
import ManagerDeployment from "./pages/manager/ManagerDeployment";
import ManagerMonitoring from "./pages/manager/ManagerMonitoring";
import ManagerCICD from "./pages/manager/ManagerCICD";
import ManagerCloud from "./pages/manager/ManagerCloud";
import ManagerCost from "./pages/manager/ManagerCost";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeProjects from "./pages/employee/EmployeeProjects";
import EmployeeGenerator from "./pages/employee/EmployeeGenerator";
import EmployeeBackendBuilder from "./pages/employee/EmployeeBackendBuilder";
import EmployeeDatabase from "./pages/employee/EmployeeDatabase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/activity-report" element={<AdminActivityReport />} />
              <Route path="/admin/projects-report" element={<AdminProjectsReport />} />
            </Route>

            {/* Manager Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/projects" element={<ManagerProjects />} />
              <Route path="/manager/api-keys" element={<ManagerApiKeys />} />
              <Route
                path="/manager/deployment"
                element={<ManagerDeployment />}
              />
              <Route
                path="/manager/monitoring"
                element={<ManagerMonitoring />}
              />
              <Route path="/manager/cicd" element={<ManagerCICD />} />
              <Route path="/manager/cloud" element={<ManagerCloud />} />
              <Route path="/manager/cost" element={<ManagerCost />} />
            </Route>

            {/* Employee Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/projects" element={<EmployeeProjects />} />
              <Route
                path="/employee/frontend-builder"
                element={<EmployeeGenerator />}
              />
              <Route
                path="/employee/backend-builder"
                element={<EmployeeBackendBuilder />}
              />
              <Route path="/employee/database" element={<EmployeeDatabase />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
