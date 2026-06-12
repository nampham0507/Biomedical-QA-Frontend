import { useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/i18n";

export default function AdminSettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [siteName, setSiteName] = useState("BioMedQA");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  function handleSave() {
    toast({ description: t.settings.saved });
  }

  return (
    <PageContainer>
      <PageHeader title={t.settings.title} description={t.settings.description} />

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.general}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="siteName">{t.settings.siteName}</Label>
            <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="max-w-sm" />
            <p className="text-xs text-gray-400">{t.settings.siteNameDescription}</p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
            <div>
              <p className="text-sm font-medium text-gray-900">{t.settings.maintenanceMode}</p>
              <p className="text-xs text-gray-400">{t.settings.maintenanceModeDescription}</p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.notifications}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{t.settings.emailNotifications}</p>
              <p className="text-xs text-gray-400">{t.settings.emailNotificationsDescription}</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
            <div>
              <p className="text-sm font-medium text-gray-900">{t.settings.weeklyReports}</p>
              <p className="text-xs text-gray-400">{t.settings.weeklyReportsDescription}</p>
            </div>
            <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>{t.common.save}</Button>
      </div>
    </PageContainer>
  );
}
