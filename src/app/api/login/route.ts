import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'

const handler = toNextJsHandler(auth)

export async function POST(request: Request) {
    const url = new URL(request.url)
    
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    const signInUrl = new URL("/api/auth?/sign-in/email", url.origin)
    signInUrl.searchParams.set("email", email)
    signInUrl.searchParams.set("password", password)
    
    const signInReq = new Request(signInUrl.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        },
    })
    
    const response = await handler.POST(signInReq)
    console.log("Response status:", response.status)
    console.log("Response body:", await response.clone().text())
    
    return response
}