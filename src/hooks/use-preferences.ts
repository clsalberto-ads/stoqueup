"use client"

import { useState, useCallback } from "react"

export interface Preferences {
    salesDaysRange: number
    notificationsEnabled: boolean
}

const defaultPreferences: Preferences = {
    salesDaysRange: 30,
    notificationsEnabled: true
}

const STORAGE_KEY = 'stoqueup_preferences'

function getInitialPreferences(): Preferences {
    if (typeof window === "undefined") return defaultPreferences

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        try {
            const parsed = JSON.parse(stored) as Partial<Preferences>
            return { ...defaultPreferences, ...parsed }
        } catch {
            return defaultPreferences
        }
    }
    return defaultPreferences
}

export function usePreferences() {
    const [preferences, setPreferencesState] = useState<Preferences>(getInitialPreferences)

    const setPreferences = useCallback((newPrefs: Partial<Preferences>) => {
        setPreferencesState(prev => {
            const updated = { ...prev, ...newPrefs }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
    }, [])

    const setSalesDaysRange = useCallback((days: number) => {
        setPreferences({ salesDaysRange: days })
    }, [setPreferences])

    const setNotificationsEnabled = useCallback((enabled: boolean) => {
        setPreferences({ notificationsEnabled: enabled })
    }, [setPreferences])

    return {
        preferences,
        setPreferences,
        setSalesDaysRange,
        setNotificationsEnabled,
        isLoaded: true
    }
}
