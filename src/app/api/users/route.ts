import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Acesso não autorizado" }, { status: 401 })
        }

        const result = await auth.api.listUsers({
            headers: await headers(),
            query: { limit: 100 },
        })

        return NextResponse.json({ users: result.users || [] })
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

        const result = await auth.api.createUser({
            headers: await headers(),
            body: {
                email: email.trim().toLowerCase(),
                name: name.trim(),
                password: password,
                role: role === "admin" ? "admin" : "user",
            }
        })

        return NextResponse.json({ success: true, user: result.user })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro interno do servidor"
        console.error("User creation error:", error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}