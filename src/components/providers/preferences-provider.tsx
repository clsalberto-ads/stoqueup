"use client"

import { usePreferences } from "@/hooks/use-preferences"

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}

export function useSalesDaysRange() {
    const { preferences, isLoaded } = usePreferences()
    return {
        daysRange: preferences.salesDaysRange,
        isLoaded
    }
}
