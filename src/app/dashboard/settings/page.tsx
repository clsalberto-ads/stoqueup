export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { organization } from "@/db/schema"
import { redirect } from "next/navigation"

import { SettingsTabs } from "@/app/dashboard/settings/settings-tabs"

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        redirect("/login")
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard")
    }

    const orgData = await db.select().from(organization).limit(1)

    const userData = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie os dados da sua conta e preferências do sistema.
                </p>
            </div>

            <SettingsTabs user={userData} organization={orgData[0] || null} />
        </div>
    )
}
