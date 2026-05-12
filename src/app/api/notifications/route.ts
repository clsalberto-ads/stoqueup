import { getNotifications, markAsRead } from "@/lib/notification-actions"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const notifications = await getNotifications(true)
        return Response.json(notifications || [])
    } catch (error) {
        console.error("API Error:", error)
        return Response.json([])
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id } = body
        
        if (!id) {
            return Response.json({ error: "ID requerido" }, { status: 400 })
        }
        
        const result = await markAsRead(id)
        return Response.json(result)
    } catch (error) {
        console.error("API Error:", error)
        return Response.json({ error: "Erro ao marcar" }, { status: 500 })
    }
}