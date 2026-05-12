import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { headers } from "next/headers"

export const POST = toNextJsHandler(auth).POST

export async function GET() {
    const cookieStore = await headers()
    const session = await auth.api.getSession({
        headers: { cookie: cookieStore.get("cookie") || "" }
    })
    
    if (!session) {
        return Response.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    return Response.json(session)
}