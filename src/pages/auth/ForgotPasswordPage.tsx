import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";
import api from "@/services/api";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t.common.error;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-success-50 text-success-600">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">{t.auth.checkEmail}</h1>
        <p className="mt-2 text-sm text-gray-500">{t.auth.checkEmailDesc}</p>
        <Link
          to="/auth/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.auth.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t.auth.resetPassword}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.auth.forgotPasswordDesc}</p>
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

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? t.common.loading : <Send className="h-4 w-4" />}
          {!isLoading && t.auth.sendResetLink}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/auth/login" className="inline-flex items-center gap-1.5 font-medium text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4" />
          {t.auth.backToLogin}
        </Link>
      </p>
    </div>
  );
}
