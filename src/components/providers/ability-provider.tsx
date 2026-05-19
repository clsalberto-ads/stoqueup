"use client"

import { createContext, useContext, ReactNode } from "react"
import { defineAbilityFor, AppAbility, UserRole } from "@/lib/ability"

const AbilityContext = createContext<AppAbility | null>(null)

export function AbilityProvider({
    role,
    children,
}: {
    role: UserRole
    children: ReactNode
}) {
    const ability = defineAbilityFor(role)

    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    )
}

export function useAbility(): AppAbility {
    const ability = useContext(AbilityContext)
    if (!ability) throw new Error("useAbility must be used within AbilityProvider")
    return ability
}
