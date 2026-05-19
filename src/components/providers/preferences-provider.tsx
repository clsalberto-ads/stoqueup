"use client"

import { createContext, useContext, useMemo } from "react"
import { usePreferences, type Preferences } from "@/hooks/use-preferences"

interface PreferencesContextType {
    preferences: Preferences
    setPreferences: (newPrefs: Partial<Preferences>) => void
    setSalesDaysRange: (days: number) => void
    setNotificationsEnabled: (enabled: boolean) => void
    isLoaded: boolean
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const prefs = usePreferences()

    const value = useMemo(() => prefs, [prefs])

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    )
}

export function useSalesDaysRange() {
    const ctx = useContext(PreferencesContext)
    const fallback = usePreferences()

    if (ctx) {
        return {
            daysRange: ctx.preferences.salesDaysRange,
            isLoaded: ctx.isLoaded
        }
    }

    return {
        daysRange: fallback.preferences.salesDaysRange,
        isLoaded: fallback.isLoaded
    }
}
