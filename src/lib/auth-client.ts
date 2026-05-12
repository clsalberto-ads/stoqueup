import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
})

export async function signInWithEmail(email: string, password: string): Promise<{ error?: { message: string; status: number } }> {
    try {
        const result = await authClient.signIn.email({
            email,
            password,
        })
        
        return result as { error?: { message: string; status: number } }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro de conexão"
        return { error: { message, status: 500 } }
    }
}