import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth.store";
import { useI18n } from "@/i18n";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import type { ApiResponse, User } from "@/types";

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export default function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", { email, password });
      const result = data.data!;
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast({ title: t.auth.loginSuccess, variant: "success" });

      const from = (location.state as { from?: string } | null)?.from;
      const redirectTo = from ?? (result.user.role === "admin" ? "/admin" : "/app/dashboard");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t.auth.invalidCredentials;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t.auth.login}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.layout.tagline}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Link to="/auth/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700">
              {t.auth.forgotPassword}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? t.common.loading : <LogIn className="h-4 w-4" />}
          {!isLoading && t.auth.login}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.auth.noAccount}{" "}
        <Link to="/auth/register" className="font-medium text-primary-600 hover:text-primary-700">
          {t.auth.register}
        </Link>
      </p>
    </div>
  );
}
