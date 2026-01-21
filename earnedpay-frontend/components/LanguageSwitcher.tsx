"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLanguageStore } from "@/store/languageStore"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguageStore()

    const languages = {
        en: "English",
        hi: "हिंदी",
        mr: "मराठी",
        bn: "বাংলা"
    }

    return (
        <div className="relative inline-flex items-center">
            <div className="absolute left-3 pointer-events-none z-10">
                <Languages className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="appearance-none pl-9 pr-8 py-2 h-10 w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary-500"
            >
                {Object.entries(languages).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 pointer-events-none z-10">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    )
}
