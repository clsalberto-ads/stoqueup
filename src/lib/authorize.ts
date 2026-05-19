import { auth } from "./auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { defineAbilityFor, type UserRole, type Actions, type Subjects } from "./ability"

export async function authorize(action: Actions, subject: Subjects) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) redirect("/login")

    const role = (session.user.role as UserRole) || "user"
    const ability = defineAbilityFor(role)

    if (!ability.can(action, subject)) {
        redirect("/dashboard")
    }

    return session
}
