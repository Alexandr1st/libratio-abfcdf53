
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Books from "./pages/Books";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Diary from "./pages/Diary";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyLibrary from "./pages/CompanyLibrary";
import CompanyEmployees from "./pages/CompanyEmployees";
import EditCompanyProfile from "./pages/EditCompanyProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminActivity from "./pages/admin/AdminActivity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/books" element={<Books />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/company-library" element={<CompanyLibrary />} />
            <Route path="/company-employees" element={<CompanyEmployees />} />
            <Route path="/company-profile/edit" element={<EditCompanyProfile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
