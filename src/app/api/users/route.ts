import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { user, account } from "@/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Acesso não autorizado" }, { status: 401 })
        }

        const users = await db.select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        }).from(user).orderBy(user.createdAt)

        return NextResponse.json({ users })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido"
        console.error("Error fetching users:", error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Acesso não autorizado. Apenas administradores podem criar usuários." }, { status: 401 })
        }

        let body: Record<string, unknown>
        try {
            body = await request.json()
        } catch {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
        }

        const { email, name, password, role } = body

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json({ error: "E-mail inválido" }, { status: 400 })
        }
        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json({ error: "Nome deve ter pelo menos 2 caracteres" }, { status: 400 })
        }
        if (!password || typeof password !== "string" || password.length < 6) {
            return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
        }

        const emailLower = email.trim().toLowerCase()
        const existingUser = await db.select().from(user).where(eq(user.email, emailLower)).limit(1)
        if (existingUser.length > 0) {
            return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 })
        }

        const userId = randomUUID()
        const now = new Date()
        
        await db.insert(user).values({
            id: userId,
            name: name.trim(),
            email: emailLower,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
            role: role === "admin" ? "admin" : "user",
        })

        await db.insert(account).values({
            id: randomUUID(),
            accountId: userId,
            providerId: "credential",
            userId: userId,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: password,
            createdAt: now,
            updatedAt: now,
        })

        return NextResponse.json({ success: true, user: { id: userId, name: name.trim(), email: emailLower, role: role === "admin" ? "admin" : "user" } })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro interno do servidor"
        console.error("User creation error:", error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}