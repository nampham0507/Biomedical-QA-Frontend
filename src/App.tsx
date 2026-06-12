import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./stores/auth.store";
import { Toaster } from "./components/ui/toaster";
import LoadingState from "./components/shared/LoadingState";

import AuthLayout from "./components/layout/AuthLayout";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));

const DashboardPage = lazy(() => import("./pages/user/DashboardPage"));
const AskPage = lazy(() => import("./pages/user/AskPage"));
const KnowledgeBasePage = lazy(() => import("./pages/user/KnowledgeBasePage"));
const DatasetsPage = lazy(() => import("./pages/user/DatasetsPage"));
const ConversationsPage = lazy(() => import("./pages/user/ConversationsPage"));
const FavoritesPage = lazy(() => import("./pages/user/FavoritesPage"));
const ProfilePage = lazy(() => import("./pages/user/ProfilePage"));

const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminAnalysisDetailPage = lazy(() => import("./pages/admin/AdminAnalysisDetailPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <Navigate to={user?.role === "admin" ? "/admin" : "/app/dashboard"} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingState fullScreen />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            {/* Auth */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* App (authenticated) */}
            <Route
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route path="/app/dashboard" element={<DashboardPage />} />
              <Route path="/app/ask" element={<AskPage />} />
              <Route path="/app/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/app/datasets" element={<DatasetsPage />} />
              <Route path="/app/conversations" element={<ConversationsPage />} />
              <Route path="/app/favorites" element={<FavoritesPage />} />
              <Route path="/app/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin */}
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<AdminAnalyticsPage />} />
              <Route path="/admin/analysis/:id" element={<AdminAnalysisDetailPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
