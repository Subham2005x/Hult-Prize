'use client';

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { Input } from "@/components/ui/input";

export function Header() {
    const { user } = useAuth();

    return (
        <div className="border-b bg-background/95 backdrop-blur z-50 sticky top-0">
            <div className="flex h-16 items-center px-4 md:px-6 gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <Sidebar className="border-none" />
                    </SheetContent>
                </Sheet>

                {/* Search Bar - Desktop */}
                <div className="hidden md:flex items-center flex-1 max-w-sm">
                    <div className="relative w-full text-muted-foreground">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
                        <Input
                            type="search"
                            placeholder="Search workers, transactions..."
                            className="w-full bg-muted/40 pl-9 rounded-xl border-none focus-visible:ring-1"
                        />
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
                    </Button>
                    <ThemeToggle />
                    <div className="hidden md:flex items-center gap-3 pl-2 border-l">
                        <div className="text-right">
                            <p className="text-sm font-medium leading-none">{user?.email || 'Employer'}</p>
                            <p className="text-xs text-muted-foreground mt-1">Admin</p>
                        </div>
                        <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            {user?.email?.charAt(0).toUpperCase() || 'E'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
