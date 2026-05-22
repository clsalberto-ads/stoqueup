"use client"

import { useState } from "react"
import { getSalesDaysCookie } from "@/lib/sales-days-cookie"

function getInitialDaysRange(): number {
    if (typeof window === "undefined") return 30
    
    const stored = localStorage.getItem("stoqueup_preferences")
    if (stored) {
        try {
            const prefs = JSON.parse(stored)
            if (prefs.salesDaysRange) {
                return prefs.salesDaysRange
            }
        } catch {}
    }
    
    const cookie = getSalesDaysCookie()
    if (cookie) return cookie
    
    return 30
}

export function useSalesRange() {
    const [daysRange] = useState(getInitialDaysRange)
    return daysRange
}
