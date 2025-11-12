"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  DollarSign, 
  TrendingUp,
  MessageSquare,
  Settings,
  UserCircle,
  Phone,
  X,
  Shield,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Clients",
    href: "/dashboard/customers",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: <UserCircle className="w-5 h-5" />,
    roles: ["CEO", "MD", "SysAdmin", "Agent"],
  },
  {
    label: "Pinnacle Estates",
    href: "/dashboard/estates",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    label: "Allocations",
    href: "/dashboard/allocations",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    label: "Commissions",
    href: "/dashboard/commissions",
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ["CEO", "MD", "SysAdmin", "Agent"],
  },
  {
    label: "SMS Campaigns",
    href: "/dashboard/sms",
    icon: <MessageSquare className="w-5 h-5" />,
    roles: ["CEO", "MD", "SysAdmin"],
  },
  {
    label: "Call Logs",
    href: "/dashboard/calls",
    icon: <Phone className="w-5 h-5" />,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ["CEO", "MD", "SysAdmin"],
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit",
    icon: <Shield className="w-5 h-5" />,
    roles: ["CEO", "MD", "SysAdmin"],
  },
  {
    label: "Help Center",
    href: "/help",
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["CEO", "MD", "SysAdmin"],
  },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (profile?.role && item.roles.includes(profile.role))
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r border-gray-200 bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-600">Pinnacle Builders</h1>
              <p className="text-xs text-accent-600 font-medium">Building Trust, One Estate at a Time</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary-50 text-primary-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || profile?.email}
              </p>
              <p className="text-xs text-gray-500">{profile?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl md:hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-primary-600">Pinnacle Builders</h1>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-primary-50 text-primary-700 shadow-sm"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile?.full_name || profile?.email}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.role}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
