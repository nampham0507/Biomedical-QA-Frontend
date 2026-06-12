import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export interface SidebarNavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  header: ReactNode;
  footer?: ReactNode;
}

function NavItems({ navItems, collapsed }: { navItems: SidebarNavItem[]; collapsed: boolean }) {
  return (
    <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
      {navItems.map(({ to, end, icon: Icon, label }) => {
        const link = (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2.5",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        );

        if (!collapsed) return link;

        return (
          <Tooltip key={to}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

export default function Sidebar({
  navItems,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  header,
  footer,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative z-20 hidden h-screen shrink-0 flex-col border-r border-gray-200 bg-white md:flex"
      >
        <div className="flex h-16 items-center gap-2 overflow-hidden border-b border-gray-200 px-4">{header}</div>
        <TooltipProvider delayDuration={200}>
          <NavItems navItems={navItems} collapsed={collapsed} />
        </TooltipProvider>
        {footer && <div className="border-t border-gray-200 p-3">{footer}</div>}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-[68px] flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-ambient transition-colors hover:text-primary-600"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-gray-900/40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-elevated md:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
                {header}
                <button onClick={onMobileClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div onClick={onMobileClose}>
                <NavItems navItems={navItems} collapsed={false} />
              </div>
              {footer && <div className="border-t border-gray-200 p-3">{footer}</div>}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
