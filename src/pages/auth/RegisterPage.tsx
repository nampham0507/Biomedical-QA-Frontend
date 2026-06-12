import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth.store";
import { useI18n } from "@/i18n";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import type { ApiResponse, User } from "@/types";

interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export default function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t.auth.passwordMinLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.auth.passwordsDontMatch);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post<ApiResponse<RegisterResponse>>("/auth/register", {
        fullName,
        email,
        password,
      });
      const result = data.data!;
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast({ title: t.auth.registerSuccess, variant: "success" });
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t.common.error;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t.auth.createAccount}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.auth.createAccountDesc}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{t.auth.fullName}</Label>
          <Input id="fullName" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

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
          <Label htmlFor="password">{t.auth.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
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
          <p className="text-xs text-gray-400">{t.auth.passwordMinLength}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? t.common.loading : <UserPlus className="h-4 w-4" />}
          {!isLoading && t.auth.register}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.auth.hasAccount}{" "}
        <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
          {t.auth.login}
        </Link>
      </p>
    </div>
  );
}
