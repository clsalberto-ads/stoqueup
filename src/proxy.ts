import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: request.headers
        });
    } catch {
        console.log("[Proxy] No session found,redirecting to login");
    }

    // Se NÃO estiver logado e tentar acessar dashboard, manda pro login
    if (!session && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Se estiver logado e tentar acessar /login, manda pro dashboard
    if (session && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};