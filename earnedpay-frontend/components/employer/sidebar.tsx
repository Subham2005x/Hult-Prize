'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    Receipt,
    Settings,
    LogOut,
    Wallet,
    PieChart,
    Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const routes = [
        {
            label: 'Overview',
            icon: LayoutDashboard,
            href: '/employer/dashboard',
            color: 'text-sky-500',
        },
        {
            label: 'Employees',
            icon: Users,
            href: '/employer/employees',
            color: 'text-violet-500',
        },
        {
            label: 'Attendance',
            icon: CalendarCheck,
            href: '/employer/attendance',
            color: 'text-pink-700',
        },
        {
            label: 'Settlements',
            icon: Receipt,
            href: '/employer/settlements',
            color: 'text-emerald-500',
        },
    ];

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-background font-sans", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center pl-3 mb-14">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-primary/30">
                            <Wallet className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">EarnedPay</h1>
                            <p className="text-xs text-muted-foreground font-medium">Employer Portal</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition-all duration-200",
                                    pathname === route.href ? "bg-primary/10 text-primary border-r-4 border-primary rounded-r-none" : "text-muted-foreground"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                                    {route.label}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="px-3 py-2 mt-auto">
                    <div className="space-y-1">
                        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                            Account
                        </h2>
                        <Link
                            href="/employer/settings"
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition-all",
                                pathname === '/employer/settings' ? "bg-primary/10 text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Settings className="h-5 w-5 mr-3 text-gray-500" />
                            Settings
                        </Link>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            onClick={() => logout()}
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Card - Premium Feature or Status */}
            <div className="px-4 mt-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold">Enterprise Plan</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                        Your payroll runs are automated for this month.
                    </p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[70%]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
