'use client';

import { Sidebar } from "@/components/employer/sidebar";
import { Header } from "@/components/employer/header";

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>
            <div className="md:pl-72 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-4 md:p-8 bg-muted/20 dark:bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    );
}
