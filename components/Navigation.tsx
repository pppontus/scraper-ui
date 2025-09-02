"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Settings,
  Activity,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sources", label: "Sources", icon: Database },
  { href: "/runs", label: "Runs & Logs", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold">Scraper Hub</h1>
        </div>
      </div>

      <div className="flex-1 py-4">
        <div className="px-3 mb-4">
          <Link
            href="/sources/new"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Source
          </Link>
        </div>

        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Timezone: Europe/Stockholm</div>
          <div className="mt-1">Last sync: 14:23</div>
        </div>
      </div>
    </nav>
  );
}