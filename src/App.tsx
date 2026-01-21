import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register"; // Import Register page
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions"; // Import Transactions page
import Categories from "./pages/Categories"; // Import Categories page
import { SessionContextProvider, useSession } from "./components/SessionContextProvider";
import React from "react";
import MainLayout from "./components/MainLayout";

const queryClient = new QueryClient();

// PrivateRoute component to protect routes
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useSession();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Memuat sesi...</p>
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

const AppContent = () => (
  <SessionContextProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* Add Register route */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} /> {/* Add Transactions route */}
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} /> {/* Add Categories route */}
          <Route path="/budgets" element={<PrivateRoute><div>Halaman Anggaran</div></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><div>Halaman Laporan</div></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><div>Halaman Pengaturan</div></PrivateRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </SessionContextProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;