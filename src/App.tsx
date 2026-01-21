import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index"; // Keep Index for now, though it might be replaced
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { SessionContextProvider, useSession } from "./components/SessionContextProvider";
import React from "react";
import MainLayout from "./components/MainLayout"; // Import MainLayout

const queryClient = new QueryClient();

// PrivateRoute component to protect routes
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>; // Wrap children with MainLayout
};

const AppContent = () => (
  <SessionContextProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> {/* Default route to dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          {/* Add placeholder routes for other sections */}
          <Route path="/transactions" element={<PrivateRoute><div>Halaman Transaksi</div></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><div>Halaman Kategori</div></PrivateRoute>} />
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