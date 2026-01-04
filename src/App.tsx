import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Diary from "./pages/Diary";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import ClubProfile from "./pages/ClubProfile";
import ClubLibrary from "./pages/ClubLibrary";
import ClubMembers from "./pages/ClubMembers";
import EditClubProfile from "./pages/EditClubProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminClubs from "./pages/admin/AdminClubs";
import AdminClubDetail from "./pages/admin/AdminClubDetail";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminBookDetail from "./pages/admin/AdminBookDetail";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSettings from "./pages/admin/AdminSettings";
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
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/clubs/:id" element={<ClubDetail />} />
            <Route path="/club-profile" element={<ClubProfile />} />
            <Route path="/club-library" element={<ClubLibrary />} />
            <Route path="/club-members" element={<ClubMembers />} />
            <Route path="/club-profile/edit" element={<EditClubProfile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/clubs" element={<AdminClubs />} />
            <Route path="/admin/clubs/:id" element={<AdminClubDetail />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route path="/admin/books/:id" element={<AdminBookDetail />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
