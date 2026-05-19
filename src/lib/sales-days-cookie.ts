"use client"

import { useEffect } from "react"

const COOKIE_NAME = "sales-days-range"

export function setSalesDaysCookie(days: number) {
    if (typeof document === "undefined") return
    document.cookie = `${COOKIE_NAME}=${days}; path=/; max-age=2592000; SameSite=Lax`
}

export function getSalesDaysCookie(): number | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`))
    return match ? parseInt(match[2], 10) : null
}

export function useSalesDaysSync() {
    useEffect(() => {
        const stored = localStorage.getItem("stoqueup_preferences")
        if (stored) {
            try {
                const prefs = JSON.parse(stored)
                if (prefs.salesDaysRange) {
                    setSalesDaysCookie(prefs.salesDaysRange)
                }
            } catch {}
        }
    }, [])
}