"use client"

import { createAuthClient } from "better-auth/react"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
})

export function useAuth() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const signIn = useCallback(async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await authClient.signIn.email({ email, password })

            if (result.error) {
                setError(result.error.message || "Login failed")
                return { error: result }
            }

            router.push("/dashboard")
            return { data: result }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro desconhecido"
            setError(message)
            return { error: new Error(message) }
        } finally {
            setIsLoading(false)
        }
    }, [router])

    const signOut = useCallback(async () => {
        try {
            await authClient.signOut()
        } finally {
            router.push("/login")
        }
    }, [router])

    return {
        signIn,
        signOut,
        isLoading,
        error,
        client: authClient
    }
}