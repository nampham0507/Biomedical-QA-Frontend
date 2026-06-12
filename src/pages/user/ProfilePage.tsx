import { useState } from "react";
import { Globe, Lock, User as UserIcon } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useChangePassword, useUpdateProfile } from "@/hooks/useProfile";
import { formatDate, getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  if (!user) return null;

  async function handleSaveProfile() {
    try {
      await updateProfile.mutateAsync({ fullName: fullName.trim() });
      toast({ description: t.profile.updateSuccess });
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      toast({ title: t.auth.passwordMinLength, variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t.auth.passwordsDontMatch, variant: "destructive" });
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast({ description: t.profile.passwordSuccess });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  return (
    <PageContainer>
      <PageHeader title={t.profile.title} />

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">
            <UserIcon className="h-4 w-4" />
            {t.profile.personalInfo}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4" />
            {t.profile.security}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="h-4 w-4" />
            {t.profile.preferences}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="flex flex-col items-center gap-3 p-6 text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="text-2xl">{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold text-gray-900">{user.fullName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
              <p className="text-xs text-gray-400">
                {t.profile.memberSince} {formatDate(user.createdAt)}
              </p>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t.profile.basicDetails}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.auth.fullName}</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.auth.email}</Label>
                  <Input id="email" type="email" value={user.email} disabled />
                  <p className="text-xs text-gray-400">{t.profile.emailManaged}</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending || !fullName.trim() || fullName.trim() === user.fullName}
                  >
                    {t.common.save}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>{t.profile.changePassword}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t.profile.currentPassword}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t.profile.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.profile.confirmNewPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
                >
                  {t.profile.changePassword}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>{t.profile.languageLabel}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{t.profile.languageDescription}</p>
              <LanguageSwitcher />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
