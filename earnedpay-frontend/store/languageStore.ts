import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, translations } from '@/lib/translations';

interface LanguageState {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: keyof typeof translations.en) => string;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: 'en',
            setLanguage: (language) => set({ language }),
            t: (key) => {
                const lang = get().language;
                return translations[lang][key] || translations['en'][key] || key;
            },
        }),
        {
            name: 'language-storage',
        }
    )
);
