import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import FollowUps from "@/pages/FollowUps";
import AssignTasks from "@/pages/AssignTasks";
import AddNotes from "@/pages/AddNotes";
import SalesTeam from "@/pages/SalesTeam";
import Reports from "@/pages/Reports";
import Clients from "@/pages/Clients";
import NotFound from "./pages/NotFound";
import { useUser } from "@/context/UserContext";

const queryClient = new QueryClient();

const AdminOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const { userRole } = useUser();

  if (userRole !== "admin") {
    return <Navigate to="/leads" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/assign-tasks" element={<AssignTasks />} />
            <Route path="/add-notes" element={<AddNotes />} />
            <Route path="/sales-team" element={<AdminOnlyRoute><SalesTeam /></AdminOnlyRoute>} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
