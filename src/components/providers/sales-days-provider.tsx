"use client"

import { usePreferences } from "@/hooks/use-preferences"

interface SalesDaysProviderProps {
    children: (daysRange: number) => React.ReactNode
}

export function SalesDaysProvider({ children }: SalesDaysProviderProps) {
    const { preferences, isLoaded } = usePreferences()

    if (!isLoaded) {
        return <>{children(30)}</>
    }

    return <>{children(preferences.salesDaysRange)}</>
}
