
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/templates/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { RBACProvider } from "@/context/RBACContext";
import { MarketProvider } from "@/context/MarketContext";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import Productivity from "@/pages/Productivity";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import ProfilePage from "@/pages/ProfilePage";
import ApprovalCenter from "@/pages/ApprovalCenter";
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './utils/configs/msal';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <MsalProvider instance={msalInstance}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <MarketProvider>
          <RBACProvider>
            
              <NavigationProvider>
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/productivity" element={<Productivity />} />
                    {/* <Route path="/approvals" element={<ApprovalsCenter />} /> */}
                    <Route path="/approval-center" element={<ApprovalCenter />} />
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
                </Routes>
                <Toaster />
                <SonnerToaster />
              </NavigationProvider>
          
          </RBACProvider>
            </MarketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </MsalProvider>
  );
}

export default App;
