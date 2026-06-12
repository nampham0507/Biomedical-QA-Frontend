import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, UserRound } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useI18n } from "@/i18n";
import api from "@/services/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchInput from "@/components/shared/SearchInput";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

interface TopbarProps {
  onMenuClick: () => void;
  rightSlot?: ReactNode;
  profilePath: string;
}

export default function Topbar({ onMenuClick, rightSlot, profilePath }: TopbarProps) {
  const { t } = useI18n();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    logout();
    navigate("/auth/login");
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden max-w-md flex-1 md:block">
        <SearchInput value={search} onChange={setSearch} placeholder={t.layout.searchPlaceholder} />
      </div>
      <div className="flex-1 md:hidden" />

      {rightSlot}

      <div className="flex items-center gap-1.5">
        <LanguageSwitcher />

        <Button variant="ghost" size="icon" aria-label={t.layout.notifications} className="text-gray-500">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary-500">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{user?.fullName?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate text-sm font-semibold text-gray-900">{user?.fullName}</span>
              <span className="truncate text-xs font-normal text-gray-500">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(profilePath)}>
              <UserRound className="h-4 w-4" />
              {t.layout.myAccount}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-danger-600 focus:bg-danger-50 focus:text-danger-700">
              <LogOut className="h-4 w-4" />
              {t.layout.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
